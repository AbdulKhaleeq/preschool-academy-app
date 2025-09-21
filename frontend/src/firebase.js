// Firebase client initialization for web (React)
// Reads config from environment variables prefixed with REACT_APP_
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  // Custom configuration for better OTP messages
  storageBucket: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.appspot.com`,
};

// Validate Firebase configuration
const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingConfig = requiredConfig.filter(key => !firebaseConfig[key]);
if (missingConfig.length > 0) {
  console.error('Missing Firebase configuration:', missingConfig);
  throw new Error(`Missing Firebase environment variables: ${missingConfig.map(k => `REACT_APP_FIREBASE_${k.toUpperCase()}`).join(', ')}`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Create a persistent, body-level container and (re)create an invisible reCAPTCHA per request.
let lastVerifier = null;
let lastContainerId = null;

// Create a brand-new, uniquely identified invisible reCAPTCHA container per request.
export const initOrResetRecaptcha = () => {
  // Cleanup previous instance and its DOM node, if any
  if (lastVerifier && typeof lastVerifier.clear === 'function') {
    try { 
      lastVerifier.clear(); 
    } catch (error) {
      // Silent cleanup
    }
  }
  if (lastContainerId) {
    const prevEl = document.getElementById(lastContainerId);
    if (prevEl && prevEl.parentNode) {
      try { 
        prevEl.parentNode.removeChild(prevEl); 
      } catch (error) {
        // Silent cleanup
      }
    }
  }

  // Create a unique container id to avoid "already been rendered" collisions
  const containerId = `recaptcha-container-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const el = document.createElement('div');
  el.id = containerId;
  // Keep it present but not taking layout space
  el.style.position = 'fixed';
  el.style.width = '0';
  el.style.height = '0';
  el.style.overflow = 'hidden';
  el.style.zIndex = '-1000';
  document.body.appendChild(el);

  try {
    // Enhanced RecaptchaVerifier configuration for better localhost compatibility
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: (response) => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        // reCAPTCHA expired
      },
      'error-callback': (error) => {
        console.error('reCAPTCHA error:', error);
      }
    });
    
    lastVerifier = verifier;
    lastContainerId = containerId;
    return verifier;
  } catch (error) {
    console.error('Failed to create RecaptchaVerifier:', error);
    throw new Error('Failed to initialize reCAPTCHA. Please check your Firebase configuration and network connection.');
  }
};

export { app, auth };
