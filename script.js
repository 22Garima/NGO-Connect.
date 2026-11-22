// ===============================
// NGOConnect - COMPLETE SCRIPT
// ===============================


// ===============================
// FIREBASE AUTH IMPORTS
// ===============================

import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";


// ===============================
// FIREBASE CONFIG
// ===============================

import {
    auth,
    db,
    googleProvider,
    microsoftProvider
} from "./firebase-config.js";


// ===============================
// FIRESTORE IMPORTS
// ===============================

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


// ===============================
// LANGUAGE TRANSLATIONS
// ===============================

const translations = {

    en: {

        home: "Home",
        signUp: "Sign Up",
        login: "Login",

        welcomeBack: "WELCOME BACK",
        joinNgoConnect: "JOIN NGOCONNECT",

        loginSubtitle:
            "Login to continue to NGOConnect.",

        signupSubtitle:
            "Join our community and start making a difference.",

        createAccount: "Create Account",

        fullName: "Full Name",
        emailAddress: "Email Address",
        phoneNumber: "Phone Number",
        password: "Password",

        email: "Email",
        phone: "Phone",

        verifyThrough: "Verify through",

        forgotPassword: "Forgot Password?",

        loginButton: "Login →",
        createAccountButton: "Create Account →",

        noAccount:
            "Don't have an account?",

        alreadyAccount:
            "Already have an account?",

        createAccountLink:
            "Create Account",

        secureLogin:
            "Your login is protected by Firebase Authentication.",

        secureSignup:
            "Your account information is protected by Firebase Authentication.",

        captchaText:
            "I'm not a robot",

        orContinue:
            "OR CONTINUE WITH",

        continueGoogle:
            "Continue with Google",

        continueMicrosoft:
            "Continue with Microsoft",

        passwordRuleText:
            "Password: 8–16 characters, including uppercase, lowercase, number and special character.",

        passwordMustContain:
            "Password must contain:",

        verifyPhone:
            "Verify Phone Number",

        otpMessage:
            "Enter the 6-digit OTP generated for your account.",

        enterOtp:
            "Enter 6-digit OTP",

        verifyOtp:
            "Verify OTP →",

        emailPlaceholder:
            "Enter your email",

        passwordPlaceholder:
            "Enter your password",

        fullNamePlaceholder:
            "Enter your full name",


        // ===============================
        // ROLE PAGE TRANSLATIONS
        // ===============================

        roleSectionLabel:
            "GET STARTED",

        roleTitle:
            "Choose Your Role",

        roleDescription:
            "Select how you want to use NGOConnect.",

        roleNGOTitle:
            "NGO",

        roleNGODescription:
            "I need resources for my organization",

        roleProviderTitle:
            "Provider",

        roleProviderDescription:
            "I have resources to provide",

        roleIndividualTitle:
            "Individual",

        roleIndividualDescription:
            "I need help or support"

    },


    hi: {

        home: "होम",
        signUp: "साइन अप",
        login: "लॉगिन",

        welcomeBack:
            "वापसी पर स्वागत है",

        joinNgoConnect:
            "NGOCONNECT से जुड़ें",

        loginSubtitle:
            "NGOConnect पर जारी रखने के लिए लॉगिन करें।",

        signupSubtitle:
            "हमारे समुदाय से जुड़ें और बदलाव लाना शुरू करें।",

        createAccount:
            "अकाउंट बनाएं",

        fullName:
            "पूरा नाम",

        emailAddress:
            "ईमेल पता",

        phoneNumber:
            "फोन नंबर",

        password:
            "पासवर्ड",

        email:
            "ईमेल",

        phone:
            "फोन",

        verifyThrough:
            "सत्यापन का तरीका",

        forgotPassword:
            "पासवर्ड भूल गए?",

        loginButton:
            "लॉगिन →",

        createAccountButton:
            "अकाउंट बनाएं →",

        noAccount:
            "क्या आपका अकाउंट नहीं है?",

        alreadyAccount:
            "क्या आपका पहले से अकाउंट है?",

        createAccountLink:
            "अकाउंट बनाएं",

        secureLogin:
            "आपका लॉगिन Firebase Authentication द्वारा सुरक्षित है।",

        secureSignup:
            "आपकी अकाउंट जानकारी Firebase Authentication द्वारा सुरक्षित है।",

        captchaText:
            "मैं रोबोट नहीं हूं",

        orContinue:
            "या जारी रखें",

        continueGoogle:
            "Google से जारी रखें",

        continueMicrosoft:
            "Microsoft से जारी रखें",

        passwordRuleText:
            "पासवर्ड: 8–16 अक्षर, जिसमें uppercase, lowercase, number और special character होना चाहिए।",

        passwordMustContain:
            "पासवर्ड में होना चाहिए:",

        verifyPhone:
            "फोन नंबर सत्यापित करें",

        otpMessage:
            "अपने अकाउंट के लिए बनाया गया 6-अंकों का OTP डालें।",

        enterOtp:
            "6-अंकों का OTP डालें",

        verifyOtp:
            "OTP सत्यापित करें →",

        emailPlaceholder:
            "अपना ईमेल डालें",

        passwordPlaceholder:
            "अपना पासवर्ड डालें",

        fullNamePlaceholder:
            "अपना पूरा नाम डालें",


        // ===============================
        // ROLE PAGE TRANSLATIONS
        // ===============================

        roleSectionLabel:
            "शुरू करें",

        roleTitle:
            "अपनी भूमिका चुनें",

        roleDescription:
            "चुनें कि आप NGOConnect का उपयोग कैसे करना चाहते हैं।",

        roleNGOTitle:
            "NGO",

        roleNGODescription:
            "मुझे अपने संगठन के लिए संसाधनों की आवश्यकता है",

        roleProviderTitle:
            "संसाधन प्रदाता",

        roleProviderDescription:
            "मेरे पास देने के लिए संसाधन हैं",

        roleIndividualTitle:
            "व्यक्ति",

        roleIndividualDescription:
            "मुझे सहायता या सहयोग की आवश्यकता है"

    }
};


// ===============================
// LANGUAGE FUNCTION
// ===============================

function applyLanguage(language) {

    const selectedLanguage =
        translations[language]
            ? language
            : "en";


    document.documentElement.lang =
        selectedLanguage;


    const elements =
        document.querySelectorAll(
            "[data-i18n]"
        );


    elements.forEach((element) => {

        const key =
            element.getAttribute(
                "data-i18n"
            );


        if (
            translations[selectedLanguage][key]
        ) {

            element.textContent =
                translations[selectedLanguage][key];

        }

    });


    const placeholders =
        document.querySelectorAll(
            "[data-i18n-placeholder]"
        );


    placeholders.forEach((element) => {

        const key =
            element.getAttribute(
                "data-i18n-placeholder"
            );


        if (
            translations[selectedLanguage][key]
        ) {

            element.placeholder =
                translations[selectedLanguage][key];

        }

    });


    localStorage.setItem(
        "ngoConnectLanguage",
        selectedLanguage
    );

}


// ===============================
// LANGUAGE SELECT
// ===============================

const languageSelect =
    document.getElementById(
        "languageSelect"
    );


const savedLanguage =
    localStorage.getItem(
        "ngoConnectLanguage"
    ) || "en";


if (languageSelect) {

    languageSelect.value =
        savedLanguage;

}


applyLanguage(
    savedLanguage
);


// ===============================
// DARK / LIGHT MODE
// SINGLE GLOBAL SYSTEM
// ===============================

const themeModeToggle =
    document.getElementById(
        "themeModeToggle"
    ) ||
    document.getElementById(
        "themeToggle"
    );


function updateThemeButton() {

    if (!themeModeToggle) {
        return;
    }


    const isDark =
        document.body.classList.contains(
            "dark-mode"
        );


    themeModeToggle.textContent =
        isDark
            ? "☀️"
            : "🌙";


    themeModeToggle.setAttribute(
        "aria-label",
        isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
    );


    themeModeToggle.setAttribute(
        "title",
        isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
    );

}


const savedMode =
    localStorage.getItem(
        "ngoConnectMode"
    ) || "light";


if (
    savedMode === "dark"
) {

    document.body.classList.add(
        "dark-mode"
    );

} else {

    document.body.classList.remove(
        "dark-mode"
    );

}


updateThemeButton();


if (themeModeToggle) {

    themeModeToggle.addEventListener(
        "click",
        () => {

            const isCurrentlyDark =
                document.body.classList.contains(
                    "dark-mode"
                );


            if (isCurrentlyDark) {

                document.body.classList.remove(
                    "dark-mode"
                );


                localStorage.setItem(
                    "ngoConnectMode",
                    "light"
                );

            } else {

                document.body.classList.add(
                    "dark-mode"
                );


                localStorage.setItem(
                    "ngoConnectMode",
                    "dark"
                );

            }


            updateThemeButton();

        }
    );

}


// ===============================
// THEMES
// ===============================

const themeSelect =
    document.getElementById(
        "themeSelect"
    );


function applyTheme(theme) {

    document.body.classList.remove(
        "theme-ocean",
        "theme-forest",
        "theme-purple"
    );


    if (
        theme === "ocean" ||
        theme === "forest" ||
        theme === "purple"
    ) {

        document.body.classList.add(
            `theme-${theme}`
        );

    }


    localStorage.setItem(
        "ngoConnectTheme",
        theme
    );

}


const savedTheme =
    localStorage.getItem(
        "ngoConnectTheme"
    ) || "default";


applyTheme(
    savedTheme
);


if (themeSelect) {

    themeSelect.value =
        savedTheme;


    themeSelect.addEventListener(
        "change",
        () => {

            applyTheme(
                themeSelect.value
            );

        }
    );

}


// ===============================
// PASSWORD SHOW / HIDE
// ===============================

function setupPasswordToggle(
    toggleId,
    passwordId
) {

    const toggle =
        document.getElementById(
            toggleId
        );


    const password =
        document.getElementById(
            passwordId
        );


    if (
        !toggle ||
        !password
    ) return;


    const eyeIcon = `
        <svg viewBox="0 0 24 24"
            width="21"
            height="21"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">

            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z">
            </path>

            <circle
                cx="12"
                cy="12"
                r="3">
            </circle>

        </svg>
    `;


    const eyeSlashIcon = `
        <svg viewBox="0 0 24 24"
            width="21"
            height="21"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">

            <path d="M3 3l18 18">
            </path>

            <path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c7 0 10 7 10 7a17.5 17.5 0 0 1-3.2 4.4">
            </path>

            <path d="M6.6 6.6C3.6 8.5 2 12 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.8-.8">
            </path>

            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2">
            </path>

        </svg>
    `;


    toggle.innerHTML =
        eyeIcon;


    toggle.addEventListener(
        "click",
        () => {

            if (
                password.type ===
                "password"
            ) {

                password.type =
                    "text";


                toggle.innerHTML =
                    eyeSlashIcon;


                toggle.setAttribute(
                    "aria-label",
                    "Hide password"
                );


                toggle.setAttribute(
                    "title",
                    "Hide password"
                );

            } else {

                password.type =
                    "password";


                toggle.innerHTML =
                    eyeIcon;


                toggle.setAttribute(
                    "aria-label",
                    "Show password"
                );


                toggle.setAttribute(
                    "title",
                    "Show password"
                );

            }

        }
    );

}


setupPasswordToggle(
    "toggleSignupPassword",
    "password"
);


setupPasswordToggle(
    "toggleLoginPassword",
    "loginPassword"
);


// ===============================
// PASSWORD VALIDATION
// ===============================

function validatePassword(password) {

    const length =
        password.length >= 8 &&
        password.length <= 16;


    const uppercase =
        /[A-Z]/.test(password);


    const lowercase =
        /[a-z]/.test(password);


    const number =
        /[0-9]/.test(password);


    const special =
        /[^A-Za-z0-9]/.test(password);


    return {

        length,
        uppercase,
        lowercase,
        number,
        special,

        valid:
            length &&
            uppercase &&
            lowercase &&
            number &&
            special

    };

}


// ===============================
// LIVE PASSWORD RULES
// ===============================

const signupPassword =
    document.getElementById(
        "password"
    );


if (signupPassword) {

    signupPassword.addEventListener(
        "input",
        () => {

            const result =
                validatePassword(
                    signupPassword.value
                );


            const rules = {

                passwordLengthRule:
                    result.length,

                passwordUpperRule:
                    result.uppercase,

                passwordLowerRule:
                    result.lowercase,

                passwordNumberRule:
                    result.number,

                passwordSpecialRule:
                    result.special

            };


            Object.entries(
                rules
            ).forEach(
                ([id, valid]) => {

                    const element =
                        document.getElementById(
                            id
                        );


                    if (!element) return;


                    element.classList.toggle(
                        "valid",
                        valid
                    );

                }
            );

        }
    );

}


// ===============================
// CAPTCHA CHECK
// ===============================

function isCaptchaCompleted() {

    const captcha =
        document.getElementById(
            "captchaCheckbox"
        );


    if (!captcha) {

        return true;

    }


    return captcha.checked;

}


// ===============================
// SIGN UP
// ===============================

const signupForm =
    document.getElementById(
        "signupForm"
    );


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const fullName =
                document.getElementById(
                    "fullName"
                ).value.trim();


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const password =
                document.getElementById(
                    "password"
                ).value;
const phoneNumber = document
    .getElementById("phone")
    .value
    .trim();

const selectedCountryCode = document
    .getElementById("countryCode")
    ?.value || "+91";

const phone = selectedCountryCode + phoneNumber;

            const verification =
                document.querySelector(
                    'input[name="verification"]:checked'
                )?.value;


            if (!fullName) {

                alert(
                    "Please enter your full name."
                );

                return;

            }


            if (!email) {

                alert(
                    "Please enter your email address."
                );

                return;

            }


            if (!phone) {

                alert(
                    "Please enter your phone number."
                );

                return;

            }


            const passwordResult =
                validatePassword(
                    password
                );


            if (!passwordResult.valid) {

                alert(
                    "Password must be 8–16 characters and contain uppercase, lowercase, number and special character."
                );

                return;

            }


            if (!isCaptchaCompleted()) {

                alert(
                    "Please complete the CAPTCHA verification."
                );

                return;

            }


            if (
                verification ===
                "email"
            ) {

                try {

                    const userCredential =
                        await createUserWithEmailAndPassword(
                            auth,
                            email,
                            password
                        );


                    const user =
                        userCredential.user;


                    await sendEmailVerification(
                        user
                    );


                    localStorage.setItem(
                        "ngoConnectUser",
                        JSON.stringify({

                            name:
                                fullName,

                            email:
                                email,

                            phone:
                                phone

                        })
                    );


                    await signOut(
                        auth
                    );


                    alert(
                        "Account created successfully!\n" +
                        "Please verify your email before logging in."
                    );


                    window.location.href =
                        "login.html";


                } catch (error) {

                    console.error(
                        "EMAIL SIGNUP ERROR:",
                        error
                    );


                    if (
                        error.code ===
                        "auth/email-already-in-use"
                    ) {

                        alert(
                            "This email is already registered."
                        );

                    } else if (
                        error.code ===
                        "auth/weak-password"
                    ) {

                        alert(
                            "Password does not meet the required security rules."
                        );

                    } else if (
                        error.code ===
                        "auth/invalid-email"
                    ) {

                        alert(
                            "Please enter a valid email address."
                        );

                    } else {

                        alert(
                            "Signup failed:\n" +
                            error.message
                        );

                    }

                }

                return;

            }


            if (
                verification ===
                "phone"
            ) {

                try {

                    const demoOTP =
                        Math.floor(
                            100000 +
                            Math.random() *
                            900000
                        ).toString();


                    sessionStorage.setItem(
                        "demoOTP",
                        demoOTP
                    );


                    localStorage.setItem(
                        "ngoConnectUser",
                        JSON.stringify({

                            name:
                                fullName,

                            email:
                                email,

                            phone:
                                phone

                        })
                    );


                    sessionStorage.setItem(
                        "phoneVerified",
                        "false"
                    );


                    const phoneOtpSection =
                        document.getElementById(
                            "phoneOtpSection"
                        );


                    if (
                        phoneOtpSection
                    ) {

                        phoneOtpSection.style.display =
                            "block";

                    }


                    console.log(
                        "================================"
                    );


                    console.log(
                        "NGOConnect Demo OTP:",
                        demoOTP
                    );


                    console.log(
                        "================================"
                    );


                    alert(
                        "Demo 6-digit OTP generated!\n\n" +
                        "Press Ctrl + Shift + J and check Console."
                    );


                } catch (error) {

                    console.error(
                        "OTP ERROR:",
                        error
                    );


                    alert(
                        "Could not generate OTP."
                    );

                }

                return;

            }

        }
    );

}


// ===============================
// PHONE OTP VERIFICATION
// ===============================

const verifyOtpBtn =
    document.getElementById(
        "verifyOtpBtn"
    );


if (verifyOtpBtn) {

    verifyOtpBtn.addEventListener(
        "click",
        () => {

            const otpInput =
                document.getElementById(
                    "otp"
                );


            if (!otpInput) return;


            const enteredOTP =
                otpInput.value.trim();


            if (
                !/^\d{6}$/.test(
                    enteredOTP
                )
            ) {

                alert(
                    "Please enter a valid 6-digit OTP."
                );

                return;

            }


            const generatedOTP =
                sessionStorage.getItem(
                    "demoOTP"
                );


            if (!generatedOTP) {

                alert(
                    "OTP expired or not generated. Please create the account again."
                );

                return;

            }


            if (
                enteredOTP ===
                generatedOTP
            ) {

                sessionStorage.setItem(
                    "phoneVerified",
                    "true"
                );


                sessionStorage.removeItem(
                    "demoOTP"
                );


                alert(
                    "Phone verified successfully!"
                );


                window.location.href =
                    "role.html";


            } else {

                alert(
                    "Invalid OTP. Please enter the correct OTP."
                );

            }

        }
    );

}


// ===============================
// GOOGLE LOGIN / SIGNUP
// ===============================

async function googleSignIn() {

    try {

        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );


        const user =
            result.user;


        localStorage.setItem(
            "ngoConnectUser",
            JSON.stringify({

                name:
                    user.displayName || "",

                email:
                    user.email || "",

                phone:
                    user.phoneNumber || ""

            })
        );


        alert(
            "Google sign-in successful!"
        );


        window.location.href =
            "role.html";


    } catch (error) {

        console.error(
            "GOOGLE SIGN-IN ERROR:",
            error
        );


        if (
            error.code ===
            "auth/popup-closed-by-user"
        ) {

            alert(
                "Google sign-in was cancelled."
            );


        } else if (
            error.code ===
            "auth/popup-blocked"
        ) {

            alert(
                "Please allow popups for NGOConnect."
            );


        } else {

            alert(
                "Google sign-in failed:\n" +
                error.message
            );

        }

    }

}


const googleLoginBtn =
    document.getElementById(
        "googleLoginBtn"
    );


const googleSignupBtn =
    document.getElementById(
        "googleSignupBtn"
    );


if (googleLoginBtn) {

    googleLoginBtn.addEventListener(
        "click",
        googleSignIn
    );

}


if (googleSignupBtn) {

    googleSignupBtn.addEventListener(
        "click",
        googleSignIn
    );

}


// ===============================
// MICROSOFT LOGIN / SIGNUP
// ===============================

async function microsoftSignIn() {

    try {

        const result =
            await signInWithPopup(
                auth,
                microsoftProvider
            );


        const user =
            result.user;


        localStorage.setItem(
            "ngoConnectUser",
            JSON.stringify({

                name:
                    user.displayName || "",

                email:
                    user.email || "",

                phone:
                    user.phoneNumber || ""

            })
        );


        alert(
            "Microsoft sign-in successful!"
        );


        window.location.href =
            "role.html";


    } catch (error) {

        console.error(
            "MICROSOFT SIGN-IN ERROR:",
            error
        );


        if (
            error.code ===
            "auth/popup-closed-by-user"
        ) {

            alert(
                "Microsoft sign-in was cancelled."
            );

        } else if (
            error.code ===
            "auth/popup-blocked"
        ) {

            alert(
                "Please allow popups for NGOConnect."
            );

        } else if (
            error.code === "auth/operation-not-allowed" ||
            error.code === "auth/invalid-oauth-provider"
        ) {

            alert(
                "Microsoft sign-in is not enabled in Firebase yet.\n\n" +
                "Open Firebase Console > Authentication > Sign-in method > Microsoft, enable it, and add your Microsoft Entra client ID and secret."
            );

        } else if (
            error.code === "auth/unauthorized-domain"
        ) {

            alert(
                "This website address is not authorised in Firebase Authentication.\n\n" +
                "Add 127.0.0.1 (or localhost) under Firebase Authentication > Settings > Authorized domains."
            );

        } else if (
            error.code === "auth/invalid-credential" ||
            error.code === "auth/invalid-client-id" ||
            error.code === "auth/invalid-client-secret"
        ) {

            alert(
                "Microsoft OAuth credentials were rejected. Check the Application (client) ID and client secret in Firebase, and confirm that the Firebase callback URL is registered in Microsoft Entra."
            );

        } else {

            alert(
                "Microsoft sign-in failed:\n" +
                error.message
            );

        }

    }

}


const microsoftLoginBtn =
    document.getElementById(
        "microsoftLoginBtn"
    );


const microsoftSignupBtn =
    document.getElementById(
        "microsoftSignupBtn"
    );


if (microsoftLoginBtn) {

    microsoftLoginBtn.addEventListener(
        "click",
        microsoftSignIn
    );

}


if (microsoftSignupBtn) {

    microsoftSignupBtn.addEventListener(
        "click",
        microsoftSignIn
    );

}


// ===============================
// LOGIN
// ===============================

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            if (!email || !password) {

                alert(
                    "Please enter email and password."
                );

                return;

            }


            if (
                !isCaptchaCompleted()
            ) {

                alert(
                    "Please complete the CAPTCHA verification."
                );

                return;

            }


            try {

                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                if (
                    !user.emailVerified
                ) {

                    alert(
                        "Your email is not verified yet.\n\n" +
                        "Please verify your email before logging in."
                    );


                    await signOut(
                        auth
                    );


                    return;

                }


                alert(
                    "Login successful!"
                );


                window.location.href =
                    "role.html";


            } catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                if (
                    error.code ===
                    "auth/invalid-credential"
                ) {

                    alert(
                        "Incorrect email or password."
                    );


                } else if (
                    error.code ===
                    "auth/wrong-password"
                ) {

                    alert(
                        "Incorrect password."
                    );


                } else if (
                    error.code ===
                    "auth/user-not-found"
                ) {

                    alert(
                        "No account found with this email."
                    );


                } else if (
                    error.code ===
                    "auth/too-many-requests"
                ) {

                    alert(
                        "Too many login attempts. Please try again later."
                    );


                } else {

                    alert(
                        "Login failed:\n" +
                        error.message
                    );

                }

            }

        }
    );

}


// ===============================
// FORGOT PASSWORD
// ===============================

const forgotPassword =
    document.getElementById(
        "forgotPassword"
    );


if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();


            const emailInput =
                document.getElementById(
                    "loginEmail"
                );


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            if (!email) {

                alert(
                    "Please enter your email address first."
                );


                if (emailInput) {

                    emailInput.focus();

                }


                return;

            }


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                alert(
                    "Password reset email sent!\n\n" +
                    "Please check your email and follow the link to create a new password."
                );


            } catch (error) {

                console.error(
                    "PASSWORD RESET ERROR:",
                    error
                );


                if (
                    error.code ===
                    "auth/user-not-found"
                ) {

                    alert(
                        "No account found with this email."
                    );


                } else if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    alert(
                        "Please enter a valid email address."
                    );


                } else {

                    alert(
                        "Could not send password reset email:\n" +
                        error.message
                    );

                }

            }

        }
    );

}


// ===============================
// PROTECTED PAGES
// ===============================

const protectedPages = [

    "role.html",
    "ngo.html",
    "provider.html",
    "individual.html",
    "results.html"

];


const currentPage =
    window.location.pathname
        .split("/")
        .pop();


if (
    protectedPages.includes(
        currentPage
    )
) {

    onAuthStateChanged(
        auth,
        (user) => {

            const phoneVerified =
                sessionStorage.getItem(
                    "phoneVerified"
                );


            if (
                phoneVerified ===
                "true"
            ) {

                return;

            }


            if (!user) {

                window.location.href =
                    "login.html";

                return;

            }


            if (
                !user.emailVerified
            ) {

                signOut(
                    auth
                );


                window.location.href =
                    "login.html";

            }

        }
    );

}


// ===============================
// NGO FORM - FIRESTORE
// ===============================

const ngoForm =
    document.getElementById(
        "ngoForm"
    );


if (ngoForm) {

    ngoForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const resource =
                document.getElementById(
                    "resource"
                ).value;


            const quantity =
                document.getElementById(
                    "quantity"
                ).value;


            const location =
                document.getElementById(
                    "location"
                ).value;


            const urgency =
                document.getElementById(
                    "urgency"
                ).value;


            const additionalInfo =
                document.getElementById(
                    "additionalInfo"
                ).value;


            if (
                !resource ||
                !quantity ||
                !location ||
                !urgency
            ) {

                alert(
                    "Please fill all required fields."
                );

                return;

            }


            const firestoreData = {

                type:
                    "NGO",

                resource:
                    resource,

                quantity:
                    quantity,

                location:
                    location,

                urgency:
                    urgency,

                additionalInfo:
                    additionalInfo,

                createdAt:
                    serverTimestamp()

            };


            const sessionData = {

                type:
                    "NGO",

                resource:
                    resource,

                quantity:
                    quantity,

                location:
                    location,

                urgency:
                    urgency,

                additionalInfo:
                    additionalInfo

            };


            try {

                const docRef =
                    await addDoc(
                        collection(
                            db,
                            "requests"
                        ),
                        firestoreData
                    );


                console.log(
                    "NGO request saved with ID:",
                    docRef.id
                );


                sessionStorage.setItem(
                    "matchingRequest",
                    JSON.stringify(
                        sessionData
                    )
                );


                alert(
                    "NGO request saved successfully!"
                );


                window.location.href =
                    "results.html";


            } catch (error) {

                console.error(
                    "NGO FIRESTORE ERROR:",
                    error
                );


                alert(
                    "Could not save NGO request.\n\n" +
                    error.message
                );

            }

        }
    );

}


// ===============================
// PROVIDER FORM - FIRESTORE
// ===============================

const providerForm =
    document.getElementById(
        "providerForm"
    );


if (providerForm) {

    providerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const resource =
                document.getElementById(
                    "providerResource"
                ).value;


            const quantity =
                document.getElementById(
                    "providerQuantity"
                ).value;


            const location =
                document.getElementById(
                    "providerLocation"
                ).value;


            const availability =
                document.getElementById(
                    "availability"
                ).value;


            const additionalInfo =
                document.getElementById(
                    "providerAdditionalInfo"
                ).value;


            if (
                !resource ||
                !quantity ||
                !location ||
                !availability
            ) {

                alert(
                    "Please fill all required fields."
                );

                return;

            }


            const firestoreData = {

                type:
                    "Provider",

                resource:
                    resource,

                quantity:
                    quantity,

                location:
                    location,

                availability:
                    availability,

                additionalInfo:
                    additionalInfo,

                createdAt:
                    serverTimestamp()

            };


            const sessionData = {

                type:
                    "Provider",

                resource:
                    resource,

                quantity:
                    quantity,

                location:
                    location,

                availability:
                    availability,

                additionalInfo:
                    additionalInfo

            };


            try {

                const docRef =
                    await addDoc(
                        collection(
                            db,
                            "resources"
                        ),
                        firestoreData
                    );


                console.log(
                    "Provider resource saved with ID:",
                    docRef.id
                );


                sessionStorage.setItem(
                    "matchingRequest",
                    JSON.stringify(
                        sessionData
                    )
                );


                alert(
                    "Provider resource saved successfully!"
                );


                window.location.href =
                    "results.html";


            } catch (error) {

                console.error(
                    "PROVIDER FIRESTORE ERROR:",
                    error
                );


                alert(
                    "Could not save provider resource.\n\n" +
                    error.message
                );

            }

        }
    );

}


// ===============================
// INDIVIDUAL FORM - FIRESTORE
// ===============================

const individualForm =
    document.getElementById(
        "individualForm"
    );


if (individualForm) {

    individualForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const helpType =
                document.getElementById(
                    "helpType"
                ).value;


            const location =
                document.getElementById(
                    "individualLocation"
                ).value;


            const urgency =
                document.getElementById(
                    "individualUrgency"
                ).value;


            const additionalInfo =
                document.getElementById(
                    "individualAdditionalInfo"
                ).value;


            if (
                !helpType ||
                !location ||
                !urgency
            ) {

                alert(
                    "Please fill all required fields."
                );

                return;

            }


            const firestoreData = {

                type:
                    "Individual",

                helpType:
                    helpType,

                location:
                    location,

                urgency:
                    urgency,

                additionalInfo:
                    additionalInfo,

                createdAt:
                    serverTimestamp()

            };


            const sessionData = {

                type:
                    "Individual",

                helpType:
                    helpType,

                location:
                    location,

                urgency:
                    urgency,

                additionalInfo:
                    additionalInfo

            };


            try {

                const docRef =
                    await addDoc(
                        collection(
                            db,
                            "individualRequests"
                        ),
                        firestoreData
                    );


                console.log(
                    "Individual request saved with ID:",
                    docRef.id
                );


                sessionStorage.setItem(
                    "matchingRequest",
                    JSON.stringify(
                        sessionData
                    )
                );


                alert(
                    "Individual request saved successfully!"
                );


                window.location.href =
                    "results.html";


            } catch (error) {

                console.error(
                    "INDIVIDUAL FIRESTORE ERROR:",
                    error
                );


                alert(
                    "Could not save individual request.\n\n" +
                    error.message
                );

            }

        }
    );

}


// =====================================================
// ROLE + INDIVIDUAL PAGE TRANSLATIONS
// =====================================================

const roleIndividualPageTranslations = {

    en: {

        navHome:
            "Home",

        navChangeRole:
            "Change Role",

        navLogout:
            "Logout",

        roleSectionLabel:
            "GET STARTED",

        roleTitle:
            "Choose Your Role",

        roleDescription:
            "Select how you want to use NGOConnect.",

        roleNGOTitle:
            "NGO",

        roleNGODescription:
            "I need resources for my organization",

        roleProviderTitle:
            "Provider",

        roleProviderDescription:
            "I have resources to provide",

        roleIndividualTitle:
            "Individual",

        roleIndividualDescription:
            "I need help or support",

        individualDashboardLabel:
            "Individual Dashboard",

        individualDashboardTitle:
            "Tell Us How We Can Help",

        individualDashboardDescription:
            "Tell us what kind of help you need and we will find suitable NGOs.",

        helpTypeLabel:
            "Type of Help Needed",

        individualLocationLabel:
            "Location",

        individualUrgencyLabel:
            "Urgency",

        individualAdditionalInfoLabel:
            "Additional Information",

        findIndividualNGOsButton:
            "Find NGOs That Can Help",

        individualMatchingTitle:
            "Find Relevant NGOs",

        individualMatchingDescription:
            "We help connect your request with suitable NGOs.",

        individualLocationTitle:
            "Location Based",

        individualLocationDescription:
            "Find organizations working near your location.",

        individualUrgencyTitle:
            "Priority Matching",

        individualUrgencyDescription:
            "Urgent requests can receive higher priority."

    },


    hi: {

        navHome:
            "होम",

        navChangeRole:
            "भूमिका बदलें",

        navLogout:
            "लॉगआउट",

        roleSectionLabel:
            "शुरू करें",

        roleTitle:
            "अपनी भूमिका चुनें",

        roleDescription:
            "चुनें कि आप NGOConnect का उपयोग कैसे करना चाहते हैं।",

        roleNGOTitle:
            "NGO",

        roleNGODescription:
            "मुझे अपने संगठन के लिए संसाधनों की आवश्यकता है",

        roleProviderTitle:
            "संसाधन प्रदाता",

        roleProviderDescription:
            "मेरे पास देने के लिए संसाधन हैं",

        roleIndividualTitle:
            "व्यक्ति",

        roleIndividualDescription:
            "मुझे सहायता या सहयोग की आवश्यकता है",

        individualDashboardLabel:
            "व्यक्ति डैशबोर्ड",

        individualDashboardTitle:
            "बताएं कि हम आपकी कैसे मदद कर सकते हैं",

        individualDashboardDescription:
            "बताएं कि आपको किस प्रकार की सहायता चाहिए और हम उपयुक्त NGOs खोजेंगे।",

        helpTypeLabel:
            "आवश्यक सहायता का प्रकार",

        individualLocationLabel:
            "स्थान",

        individualUrgencyLabel:
            "तत्कालता",

        individualAdditionalInfoLabel:
            "अतिरिक्त जानकारी",

        findIndividualNGOsButton:
            "मेरी मदद करने वाले NGOs खोजें",

        individualMatchingTitle:
            "उपयुक्त NGOs खोजें",

        individualMatchingDescription:
            "हम आपकी आवश्यकता को उपयुक्त NGOs से जोड़ने में मदद करते हैं।",

        individualLocationTitle:
            "स्थान आधारित",

        individualLocationDescription:
            "अपने स्थान के पास काम करने वाले संगठनों को खोजें।",

        individualUrgencyTitle:
            "प्राथमिकता मिलान",

        individualUrgencyDescription:
            "तत्काल अनुरोधों को अधिक प्राथमिकता दी जा सकती है।"

    }

};


// =====================================================
// APPLY ROLE + INDIVIDUAL TRANSLATIONS
// =====================================================

function applyRoleIndividualPageLanguage(language) {

    const selectedLanguage =
        roleIndividualPageTranslations[language]
            ? language
            : "en";


    const texts =
        roleIndividualPageTranslations[
            selectedLanguage
        ];


    Object.entries(texts).forEach(
        ([id, value]) => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    value;

            }

        }
    );


    const helpType =
        document.getElementById(
            "helpType"
        );


    if (helpType) {

        const oldValue =
            helpType.value;


        const helpOptions = {

            en: [

                ["", "Select type of help"],
                ["Food", "Food"],
                ["Medical Help", "Medical Help"],
                ["Education", "Education"],
                ["Shelter", "Shelter"],
                ["Financial Help", "Financial Help"],
                ["Clothes", "Clothes"],
                ["Other", "Other"]

            ],

            hi: [

                ["", "सहायता का प्रकार चुनें"],
                ["Food", "भोजन"],
                ["Medical Help", "चिकित्सा सहायता"],
                ["Education", "शिक्षा"],
                ["Shelter", "आश्रय"],
                ["Financial Help", "वित्तीय सहायता"],
                ["Clothes", "कपड़े"],
                ["Other", "अन्य"]

            ]

        };


        helpType.innerHTML =
            "";


        helpOptions[
            selectedLanguage
        ].forEach(
            ([value, text]) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    value;


                option.textContent =
                    text;


                helpType.appendChild(
                    option
                );

            }
        );


        helpType.value =
            oldValue;

    }


    const individualUrgency =
        document.getElementById(
            "individualUrgency"
        );


    if (individualUrgency) {

        const oldValue =
            individualUrgency.value;


        const urgencyOptions = {

            en: [

                ["", "Select urgency"],
                ["High", "High"],
                ["Medium", "Medium"],
                ["Low", "Low"]

            ],

            hi: [

                ["", "तत्कालता चुनें"],
                ["High", "उच्च"],
                ["Medium", "मध्यम"],
                ["Low", "कम"]

            ]

        };


        individualUrgency.innerHTML =
            "";


        urgencyOptions[
            selectedLanguage
        ].forEach(
            ([value, text]) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    value;


                option.textContent =
                    text;


                individualUrgency.appendChild(
                    option
                );

            }
        );


        individualUrgency.value =
            oldValue;

    }


    const locationInput =
        document.getElementById(
            "individualLocation"
        );


    if (locationInput) {

        locationInput.placeholder =
            selectedLanguage === "hi"
                ? "उदाहरण: नोएडा"
                : "Example: Noida";

    }


    const additionalInfoInput =
        document.getElementById(
            "individualAdditionalInfo"
        );


    if (additionalInfoInput) {

        additionalInfoInput.placeholder =
            selectedLanguage === "hi"
                ? "ऐसी कोई अन्य जानकारी बताएं जो मदद कर सके..."
                : "Tell us anything else that may help...";

    }

}


// =====================================================
// NGO DASHBOARD TRANSLATIONS
// =====================================================

const ngoPageTranslations = {

    en: {

        navHome:
            "Home",

        navChangeRole:
            "Change Role",

        ngoDashboardLabel:
            "NGO Dashboard",

        ngoDashboardTitle:
            "Tell Us What You Need",

        ngoDashboardDescription:
            "Enter your resource requirement and we will find suitable providers.",

        resourceLabel:
            "Resource Needed",

        quantityLabel:
            "Quantity Needed",

        locationLabel:
            "Location",

        urgencyLabel:
            "Urgency",

        additionalInfoLabel:
            "Additional Information",

        findResourcesButton:
            "Find Matching Resources",

        smartMatchingTitle:
            "Smart Matching",

        smartMatchingDescription:
            "We compare your requirement with available resources.",

        locationMatchingTitle:
            "Location Based",

        locationMatchingDescription:
            "Find providers near your required location.",

        urgencyMatchingTitle:
            "Urgency Based",

        urgencyMatchingDescription:
            "High-priority requirements can be matched faster."

    },


    hi: {

        navHome:
            "होम",

        navChangeRole:
            "भूमिका बदलें",

        ngoDashboardLabel:
            "NGO डैशबोर्ड",

        ngoDashboardTitle:
            "बताएं कि आपको क्या चाहिए",

        ngoDashboardDescription:
            "अपनी संसाधन संबंधी आवश्यकता दर्ज करें और हम उपयुक्त प्रदाताओं को खोजने में मदद करेंगे।",

        resourceLabel:
            "आवश्यक संसाधन",

        quantityLabel:
            "आवश्यक मात्रा",

        locationLabel:
            "स्थान",

        urgencyLabel:
            "प्राथमिकता",

        additionalInfoLabel:
            "अतिरिक्त जानकारी",

        findResourcesButton:
            "मिलते-जुलते संसाधन खोजें",

        smartMatchingTitle:
            "स्मार्ट मिलान",

        smartMatchingDescription:
            "हम आपकी आवश्यकता की उपलब्ध संसाधनों से तुलना करते हैं।",

        locationMatchingTitle:
            "स्थान के आधार पर",

        locationMatchingDescription:
            "अपने आवश्यक स्थान के पास संसाधन प्रदाताओं को खोजें।",

        urgencyMatchingTitle:
            "प्राथमिकता के आधार पर",

        urgencyMatchingDescription:
            "अधिक प्राथमिकता वाली आवश्यकताओं का मिलान जल्दी किया जा सकता है।"

    }

};


// =====================================================
// APPLY NGO PAGE LANGUAGE
// =====================================================

function applyNGOPageLanguage(language) {

    const selectedLanguage =
        ngoPageTranslations[language]
            ? language
            : "en";


    const texts =
        ngoPageTranslations[
            selectedLanguage
        ];


    Object.entries(texts).forEach(
        ([id, value]) => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    value;

            }

        }
    );


    const quantityInput =
        document.getElementById(
            "quantity"
        );


    if (quantityInput) {

        quantityInput.placeholder =
            selectedLanguage === "hi"
                ? "उदाहरण: 700"
                : "Example: 700";

    }


    const locationInput =
        document.getElementById(
            "location"
        );


    if (locationInput) {

        locationInput.placeholder =
            selectedLanguage === "hi"
                ? "उदाहरण: नोएडा"
                : "Example: Noida";

    }


    const additionalInfoInput =
        document.getElementById(
            "additionalInfo"
        );


    if (additionalInfoInput) {

        additionalInfoInput.placeholder =
            selectedLanguage === "hi"
                ? "अन्य आवश्यक विवरण लिखें..."
                : "Add any additional details...";

    }


    const resourceSelect =
        document.getElementById(
            "resource"
        );


    if (resourceSelect) {

        const oldValue =
            resourceSelect.value;


        const resourceOptions = {

            en: [

                ["", "Select a resource"],
                ["Food", "Food"],
                ["Funds", "Funds"],
                ["Volunteers", "Volunteers"],
                ["Clothes", "Clothes"],
                ["Medicines", "Medicines"],
                ["Books", "Books"],
                ["Other", "Other"]

            ],

            hi: [

                ["", "संसाधन चुनें"],
                ["Food", "भोजन"],
                ["Funds", "धनराशि"],
                ["Volunteers", "स्वयंसेवक"],
                ["Clothes", "कपड़े"],
                ["Medicines", "दवाइयाँ"],
                ["Books", "किताबें"],
                ["Other", "अन्य"]

            ]

        };


        resourceSelect.innerHTML =
            "";


        resourceOptions[
            selectedLanguage
        ].forEach(
            ([value, text]) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    value;


                option.textContent =
                    text;


                resourceSelect.appendChild(
                    option
                );

            }
        );


        resourceSelect.value =
            oldValue;

    }


    const urgencySelect =
        document.getElementById(
            "urgency"
        );


    if (urgencySelect) {

        const oldValue =
            urgencySelect.value;


        const urgencyOptions = {

            en: [

                ["", "Select urgency"],
                ["High", "High"],
                ["Medium", "Medium"],
                ["Low", "Low"]

            ],

            hi: [

                ["", "प्राथमिकता चुनें"],
                ["High", "अधिक"],
                ["Medium", "मध्यम"],
                ["Low", "कम"]

            ]

        };


        urgencySelect.innerHTML =
            "";


        urgencyOptions[
            selectedLanguage
        ].forEach(
            ([value, text]) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    value;


                option.textContent =
                    text;


                urgencySelect.appendChild(
                    option
                );

            }
        );


        urgencySelect.value =
            oldValue;

    }

}


// =====================================================
// PROVIDER DASHBOARD TRANSLATIONS
// =====================================================

const providerPageTranslations = {

    en: {

        navHome:
            "Home",

        navChangeRole:
            "Change Role",

        providerDashboardLabel:
            "Provider Dashboard",

        providerDashboardTitle:
            "Tell Us What You Have",

        providerDashboardDescription:
            "Add the resources you can provide and find NGOs that need them.",

        providerResourceLabel:
            "Resource Available",

        providerQuantityLabel:
            "Quantity Available",

        providerLocationLabel:
            "Location",

        availabilityLabel:
            "Availability",

        providerAdditionalInfoLabel:
            "Additional Information",

        findNGOsButton:
            "Find NGOs That Need This",

        providerMatchingTitle:
            "Smart Matching",

        providerMatchingDescription:
            "Match your available resources with NGO requirements.",

        providerLocationTitle:
            "Location Based",

        providerLocationDescription:
            "Find NGOs close to your resource location.",

        providerAvailabilityTitle:
            "Availability",

        providerAvailabilityDescription:
            "Share when your resources are available."

    },


    hi: {

        navHome:
            "होम",

        navChangeRole:
            "भूमिका बदलें",

        providerDashboardLabel:
            "संसाधन प्रदाता डैशबोर्ड",

        providerDashboardTitle:
            "बताएं कि आपके पास क्या है",

        providerDashboardDescription:
            "उन संसाधनों की जानकारी दें जिन्हें आप उपलब्ध करा सकते हैं और जरूरतमंद NGOs खोजें।",

        providerResourceLabel:
            "उपलब्ध संसाधन",

        providerQuantityLabel:
            "उपलब्ध मात्रा",

        providerLocationLabel:
            "स्थान",

        availabilityLabel:
            "उपलब्धता",

        providerAdditionalInfoLabel:
            "अतिरिक्त जानकारी",

        findNGOsButton:
            "इस संसाधन की आवश्यकता वाले NGOs खोजें",

        providerMatchingTitle:
            "स्मार्ट मिलान",

        providerMatchingDescription:
            "आपके उपलब्ध संसाधनों का NGO की आवश्यकताओं से मिलान करें।",

        providerLocationTitle:
            "स्थान के आधार पर",

        providerLocationDescription:
            "अपने संसाधन के स्थान के पास NGOs खोजें।",

        providerAvailabilityTitle:
            "उपलब्धता",

        providerAvailabilityDescription:
            "बताएं कि आपके संसाधन कब उपलब्ध हैं।"

    }

};


// =====================================================
// APPLY PROVIDER PAGE LANGUAGE
// =====================================================

function applyProviderPageLanguage(language) {

    const selectedLanguage =
        providerPageTranslations[language]
            ? language
            : "en";


    const texts =
        providerPageTranslations[
            selectedLanguage
        ];


    Object.entries(texts).forEach(
        ([id, value]) => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    value;

            }

        }
    );


    const quantityInput =
        document.getElementById(
            "providerQuantity"
        );


    if (quantityInput) {

        quantityInput.placeholder =
            selectedLanguage === "hi"
                ? "उदाहरण: 1000"
                : "Example: 1000";

    }


    const locationInput =
        document.getElementById(
            "providerLocation"
        );


    if (locationInput) {

        locationInput.placeholder =
            selectedLanguage === "hi"
                ? "उदाहरण: नोएडा"
                : "Example: Noida";

    }


    const additionalInfoInput =
        document.getElementById(
            "providerAdditionalInfo"
        );


    if (additionalInfoInput) {

        additionalInfoInput.placeholder =
            selectedLanguage === "hi"
                ? "अन्य आवश्यक विवरण लिखें..."
                : "Add any additional details...";

    }


    const resourceSelect =
        document.getElementById(
            "providerResource"
        );


    if (resourceSelect) {

        const oldValue =
            resourceSelect.value;


        const resourceOptions = {

            en: [

                ["", "Select a resource"],
                ["Food", "Food"],
                ["Funds", "Funds"],
                ["Volunteers", "Volunteers"],
                ["Clothes", "Clothes"],
                ["Medicines", "Medicines"],
                ["Books", "Books"],
                ["Other", "Other"]

            ],

            hi: [

                ["", "संसाधन चुनें"],
                ["Food", "भोजन"],
                ["Funds", "धनराशि"],
                ["Volunteers", "स्वयंसेवक"],
                ["Clothes", "कपड़े"],
                ["Medicines", "दवाइयाँ"],
                ["Books", "किताबें"],
                ["Other", "अन्य"]

            ]

        };


        resourceSelect.innerHTML =
            "";


        resourceOptions[
            selectedLanguage
        ].forEach(
            ([value, text]) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    value;


                option.textContent =
                    text;


                resourceSelect.appendChild(
                    option
                );

            }
        );


        resourceSelect.value =
            oldValue;

    }


    const availabilitySelect =
        document.getElementById(
            "availability"
        );


    if (availabilitySelect) {

        const oldValue =
            availabilitySelect.value;


        const availabilityOptions = {

            en: [

                ["", "Select availability"],
                ["Available", "Available"],
                ["Not Available", "Not Available"],
                ["Available Soon", "Available Soon"]

            ],

            hi: [

                ["", "उपलब्धता चुनें"],
                ["Available", "उपलब्ध"],
                ["Not Available", "उपलब्ध नहीं"],
                ["Available Soon", "जल्द उपलब्ध"]

            ]

        };


        availabilitySelect.innerHTML =
            "";


        availabilityOptions[
            selectedLanguage
        ].forEach(
            ([value, text]) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    value;


                option.textContent =
                    text;


                availabilitySelect.appendChild(
                    option
                );

            }
        );


        availabilitySelect.value =
            oldValue;

    }

}


// =====================================================
// RESULTS PAGE TRANSLATIONS
// =====================================================

const resultsPageTranslations = {

    en: {

        navHome:
            "Home",

        navChangeRole:
            "Change Role",

        resultsLabel:
            "Smart Matching",

        requestSummaryTitle:
            "Your Request",

        summaryResourceLabel:
            "Resource",

        summaryQuantityLabel:
            "Quantity",

        summaryLocationLabel:
            "Location",

        summaryUrgencyLabel:
            "Urgency",

        matchesTitle:
            "Recommended Matches",

        matchResourceLabel:
            "Resource",

        matchAvailableLabel:
            "Available",

        matchDistanceLabel:
            "Distance",

        contactMatch:
            "Contact NGO",

        makeAnotherRequest:
            "Make Another Request",

        resultsFooter:
            "© 2026 NGOConnect. Connecting Needs with Resources."

    },


    hi: {

        navHome:
            "होम",

        navChangeRole:
            "भूमिका बदलें",

        resultsLabel:
            "स्मार्ट मिलान",

        requestSummaryTitle:
            "आपका अनुरोध",

        summaryResourceLabel:
            "संसाधन",

        summaryQuantityLabel:
            "मात्रा",

        summaryLocationLabel:
            "स्थान",

        summaryUrgencyLabel:
            "तत्कालता",

        matchesTitle:
            "सुझाए गए मिलान",

        matchResourceLabel:
            "संसाधन",

        matchAvailableLabel:
            "उपलब्ध",

        matchDistanceLabel:
            "दूरी",

        contactMatch:
            "NGO से संपर्क करें",

        makeAnotherRequest:
            "एक और अनुरोध करें",

        resultsFooter:
            "© 2026 NGOConnect. आवश्यकताओं को संसाधनों से जोड़ना।"

    }

};


// =====================================================
// RESULTS PAGE LANGUAGE FUNCTION
// =====================================================

function applyResultsPageLanguage(language) {

    const selectedLanguage =
        resultsPageTranslations[language]
            ? language
            : "en";

    const texts =
        resultsPageTranslations[
            selectedLanguage
        ];

    // These values are populated dynamically by results.js. Do not replace
    // them with static demo text such as "3 Matches" when language changes.
    const dynamicIds = new Set([
        "resultsTitle",
        "resultsDescription",
        "matchCount"
    ]);

    Object.entries(texts).forEach(
        ([id, value]) => {
            if (dynamicIds.has(id)) return;
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        }
    );

    // Keep summary labels meaningful for the active user role.
    let savedRequest = null;
    try {
        savedRequest = JSON.parse(sessionStorage.getItem("matchingRequest") || "null");
    } catch (_) {
        savedRequest = null;
    }
    const activeRole = savedRequest?.type;
    const resourceLabel = document.getElementById("summaryResourceLabel");
    const quantityLabel = document.getElementById("summaryQuantityLabel");
    const urgencyLabel = document.getElementById("summaryUrgencyLabel");
    if (activeRole === "Individual") {
        if (resourceLabel) resourceLabel.textContent = selectedLanguage === "hi" ? "आवश्यक सहायता" : "Help needed";
        if (quantityLabel) quantityLabel.textContent = selectedLanguage === "hi" ? "लागू नहीं" : "Not applicable";
        if (urgencyLabel) urgencyLabel.textContent = selectedLanguage === "hi" ? "तत्कालता" : "Urgency";
    } else if (activeRole === "Provider") {
        if (resourceLabel) resourceLabel.textContent = selectedLanguage === "hi" ? "उपलब्ध संसाधन" : "Resource offered";
        if (quantityLabel) quantityLabel.textContent = selectedLanguage === "hi" ? "प्रस्तावित मात्रा" : "Quantity offered";
        if (urgencyLabel) urgencyLabel.textContent = selectedLanguage === "hi" ? "उपलब्धता" : "Availability";
    }


    const resourceLabels =
        document.querySelectorAll(
            ".match-resource-label"
        );


    resourceLabels.forEach(
        (element) => {

            element.textContent =
                texts.matchResourceLabel;

        }
    );


    const availableLabels =
        document.querySelectorAll(
            ".match-available-label"
        );


    availableLabels.forEach(
        (element) => {

            element.textContent =
                texts.matchAvailableLabel;

        }
    );


    const distanceLabels =
        document.querySelectorAll(
            ".match-distance-label"
        );


    distanceLabels.forEach(
        (element) => {

            element.textContent =
                texts.matchDistanceLabel;

        }
    );


    const contactButtons =
        document.querySelectorAll(
            ".contact-match"
        );


    contactButtons.forEach(
        (element) => {

            element.textContent =
                texts.contactMatch;

        }
    );

}


// =====================================================
// SINGLE LANGUAGE CHANGE FUNCTION
// =====================================================

function changeLanguage(language) {

    const selectedLanguage =
        translations[language]
            ? language
            : "en";


    localStorage.setItem(
        "ngoConnectLanguage",
        selectedLanguage
    );


    // Common pages

    applyLanguage(
        selectedLanguage
    );


    // Role + Individual pages

    applyRoleIndividualPageLanguage(
        selectedLanguage
    );


    // NGO dashboard

    applyNGOPageLanguage(
        selectedLanguage
    );


    // Provider dashboard

    applyProviderPageLanguage(
        selectedLanguage
    );


    // Results page

    applyResultsPageLanguage(
        selectedLanguage
    );

}


// =====================================================
// INITIAL LANGUAGE
// =====================================================

function initializePageLanguage() {

    const currentLanguage =
        localStorage.getItem(
            "ngoConnectLanguage"
        ) || "en";


    if (languageSelect) {

        languageSelect.value =
            currentLanguage;

    }


    changeLanguage(
        currentLanguage
    );

}


// =====================================================
// SINGLE LANGUAGE SELECT LISTENER
// =====================================================

if (languageSelect) {

    languageSelect.addEventListener(
        "change",
        () => {

            changeLanguage(
                languageSelect.value
            );

        }
    );

}


// =====================================================
// INITIALIZE LANGUAGE
// =====================================================

initializePageLanguage();


// =====================================================
// RE-APPLY AFTER PAGE LOAD
// =====================================================

window.addEventListener(
    "load",
    function () {

        const currentLanguage =
            localStorage.getItem(
                "ngoConnectLanguage"
            ) || "en";


        if (languageSelect) {

            languageSelect.value =
                currentLanguage;

        }


        changeLanguage(
            currentLanguage
        );

    }
);
// ==============================
// CUSTOM COUNTRY DROPDOWN
// HOVER + CLICK SUPPORT
// ==============================

const countrySelected =
    document.getElementById("countrySelected");

const countryMenu =
    document.getElementById("countryMenu");

const selectedFlag =
    document.getElementById("selectedFlag");

const selectedCode =
    document.getElementById("selectedCode");

const countryCode =
    document.getElementById("countryCode");

const customCountry =
    document.getElementById("customCountry");


if (
    countrySelected &&
    countryMenu &&
    selectedFlag &&
    selectedCode &&
    countryCode &&
    customCountry
) {

    // --------------------------------
    // OPEN DROPDOWN
    // --------------------------------

    function openCountryMenu() {

        countryMenu.classList.add("show");

    }


    // --------------------------------
    // CLOSE DROPDOWN
    // --------------------------------

    function closeCountryMenu() {

        countryMenu.classList.remove("show");

    }


    // --------------------------------
    // HOVER → OPEN
    // --------------------------------

    customCountry.addEventListener(
        "mouseenter",
        function () {

            openCountryMenu();

        }
    );


    // --------------------------------
    // MOUSE LEAVE → CLOSE
    // --------------------------------

    customCountry.addEventListener(
        "mouseleave",
        function () {

            closeCountryMenu();

        }
    );


    // --------------------------------
    // CLICK / TAP SUPPORT
    // Useful for mobile
    // --------------------------------

    countrySelected.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            countryMenu.classList.toggle("show");

        }
    );


    // --------------------------------
    // SELECT COUNTRY
    // --------------------------------

    const countryButtons =
        countryMenu.querySelectorAll("button");


    countryButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const code =
                        button.dataset.code;


                    const flag =
                        button.querySelector(
                            ".flag-icon, .flag-emoji"
                        );


                    // Clear old flag
                    selectedFlag.innerHTML = "";


                    // Copy selected flag
                    if (flag) {

                        const clonedFlag =
                            flag.cloneNode(true);


                        selectedFlag.appendChild(
                            clonedFlag
                        );

                    }


                    // Update country code
                    selectedCode.textContent =
                        code;


                    // Update hidden input
                    countryCode.value =
                        code;


                    // Close dropdown
                    closeCountryMenu();

                }
            );

        }
    );


    // --------------------------------
    // CLICK OUTSIDE → CLOSE
    // --------------------------------

    document.addEventListener(
        "click",
        function (event) {

            if (
                !customCountry.contains(
                    event.target
                )
            ) {

                closeCountryMenu();

            }

        }
    );

}