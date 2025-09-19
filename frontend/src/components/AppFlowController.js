import React, { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';
import OnboardingSlides from './OnboardingSlides';

const AppFlowController = ({ children, user }) => {
  const [currentStep, setCurrentStep] = useState('loading'); // 'loading' | 'splash' | 'onboarding' | 'app'

  useEffect(() => {
    // Small delay to show loading state
    const timer = setTimeout(() => {
      if (user) {
        // User is already logged in, skip to app
        setCurrentStep('app');
      } else {
        // Always show splash screen first
        setCurrentStep('splash');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user]);

  const handleSplashComplete = () => {
    const onboardingCompleted = localStorage.getItem('wellington_onboarding_completed');
    
    if (!onboardingCompleted) {
      setCurrentStep('onboarding');
    } else {
      setCurrentStep('app');
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('wellington_onboarding_completed', 'true');
    setCurrentStep('app');
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
    return children;
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