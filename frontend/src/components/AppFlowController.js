import React, { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';
import OnboardingSlides from './OnboardingSlides';

const AppFlowController = ({ children, user }) => {
  const [currentStep, setCurrentStep] = useState('loading'); // 'loading' | 'splash' | 'onboarding' | 'app'
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isFirstAppOpen, setIsFirstAppOpen] = useState(true);

  useEffect(() => {
    // Check onboarding and session status
    const onboardingCompleted = localStorage.getItem('wellington_onboarding_completed');
    const hasSuccessfulLogin = localStorage.getItem('wellington_has_logged_in');
    const sessionTimestamp = sessionStorage.getItem('wellington_session_start');
    
    setHasSeenOnboarding(!!onboardingCompleted);
    
    // Determine if this is a fresh app open (not just a page refresh during same session)
    const isNewAppSession = !sessionTimestamp;
    if (isNewAppSession) {
      sessionStorage.setItem('wellington_session_start', Date.now().toString());
      setIsFirstAppOpen(true);
    } else {
      setIsFirstAppOpen(false);
    }
    
    // Small delay to show loading state
    const timer = setTimeout(() => {
      if (user) {
        // User is already logged in, skip to app (but splash already shown)
        setCurrentStep('app');
      } else {
        // Always show splash screen first on fresh app open
        setCurrentStep('splash');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user]);

  const handleSplashComplete = () => {
    const onboardingCompleted = localStorage.getItem('wellington_onboarding_completed');
    const hasSuccessfulLogin = localStorage.getItem('wellington_has_logged_in');
    
    // Show onboarding if:
    // 1. Never completed onboarding, OR
    // 2. Never successfully logged in (even if they saw onboarding but couldn't login)
    if (!onboardingCompleted || !hasSuccessfulLogin) {
      setCurrentStep('onboarding');
    } else {
      // Skip onboarding for users who have successfully logged in before
      setCurrentStep('app');
    }
  };

  const handleOnboardingComplete = () => {
    // Mark onboarding as completed (but user still needs to login successfully)
    localStorage.setItem('wellington_onboarding_completed', 'true');
    setHasSeenOnboarding(true);
    setCurrentStep('app');
  };

  // Helper function to be called when user successfully logs in
  // You'll need to call this from your login component
  const markSuccessfulLogin = () => {
    localStorage.setItem('wellington_has_logged_in', 'true');
  };

  // Dev function to reset onboarding (for development/testing)
  const resetOnboarding = () => {
    localStorage.removeItem('wellington_onboarding_completed');
    localStorage.removeItem('wellington_has_logged_in');
    sessionStorage.removeItem('wellington_session_start');
    window.location.reload();
  };

  // Loading state
  if (currentStep === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading Wellington Kids...</p>
        </div>
      </div>
    );
  }

  // Show app content (including login) when ready
  if (currentStep === 'app') {
    // Clone children and pass the markSuccessfulLogin function
    const childrenWithProps = React.cloneElement(children, { 
      markSuccessfulLogin,
      resetOnboarding // For dev purposes
    });
    return childrenWithProps;
  }

  // Show appropriate flow step
  return (
    <>
      {currentStep === 'splash' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      
      {currentStep === 'onboarding' && (
        <OnboardingSlides onComplete={handleOnboardingComplete} />
      )}
    </>
  );
};

export default AppFlowController;