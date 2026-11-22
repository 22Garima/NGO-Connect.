// =========================================
// NGOConnect - Firebase Configuration
// =========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import {
    initializeAppCheck,
    ReCaptchaEnterpriseProvider
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app-check.js";

import {
    getAuth,
    GoogleAuthProvider,
    OAuthProvider
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


// =========================================
// FIREBASE CONFIGURATION
// =========================================

const firebaseConfig = {
    apiKey: "AIzaSyAGiV4MBYOVxjybNWl0x01J74EC81ONgFg",
    authDomain: "ngo-connect-1147b.firebaseapp.com",
    projectId: "ngo-connect-1147b",
    storageBucket: "ngo-connect-1147b.firebasestorage.app",
    messagingSenderId: "190749078125",
    appId: "1:190749078125:web:5fbaff46f1f3ff0ccb0564"
};


// =========================================
// INITIALIZE FIREBASE
// =========================================

const app = initializeApp(firebaseConfig);


// =========================================
// REAL-TIME CAPTCHA / APP CHECK
// =========================================

const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(
        "6LcveOEtAAAAAAGsqsTDcUmsvhP2WrJZvHfs_MfW"
    ),
    isTokenAutoRefreshEnabled: true
});


// =========================================
// FIREBASE AUTHENTICATION
// =========================================

const auth = getAuth(app);


// =========================================
// FIRESTORE DATABASE
// =========================================

const db = getFirestore(app);


// =========================================
// GOOGLE SIGN-IN
// =========================================

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});


// =========================================
// MICROSOFT SIGN-IN
// =========================================

const microsoftProvider = new OAuthProvider(
    "microsoft.com"
);

microsoftProvider.setCustomParameters({
    prompt: "select_account"
});


// =========================================
// EXPORT
// =========================================

export {
    auth,
    db,
    googleProvider,
    microsoftProvider
};