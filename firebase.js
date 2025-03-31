// Load Firebase from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import dotenv from 'dotenv'

dotenv.config();
const firebaseApiKey = process.env.FIREBASE_API_KEY;
const firebaseAuthDomain = process.env.FIREBASE_AUTH_DOMAIN;
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const firebaseStorageBucket = process.env.FIREBASE_STORAGE_BUCKET;
const firebaseMessagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = process.env.FIREBASE_APP_ID;
const firebaseMeasurementId = process.env.FIREBASE_MEASUREMENT_ID;


const firebaseConfig = {
    apiKey: firebaseApiKey,
    authDomain: firebaseAuthDomain,
    projectId: firebaseProjectId,
    storageBucket: firebaseStorageBucket,
    messagingSenderId: firebaseMessagingSenderId,
    appId: firebaseAppId,
    measurementId: firebaseMeasurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Sign up function
const signUp = async (email, password) => {
  try {
    console.log("Attempting to sign up with:", email, password);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User Signed Up:", userCredential.user);
    alert("User signed in");
    return userCredential.user;
  } catch (error) {
    console.error("Error Signing Up:", error.message);
    alert(error.message);
  }
}

// Login Function
const login = async (email, password) => {
  try {
    console.log("Attempting to log in with:", email, password);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User Logged In:", userCredential.user);
    alert("Login successful!");
  } catch (error) {
    console.error("Error Logging In:", error.message);
    alert(error.message);
  }
};

// Logout Function
const logout = async () => {
  try {
    await signOut(auth);
    console.log("User Logged Out");
    alert("Logged out successfully!");
  } catch (error) {
    console.error("Error Logging Out:", error.message);
    alert(error.message);
  }
};

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Current User:", user);
        resolve(user); // Resolve with the current user object
      } else {
        console.log("No user is currently logged in.");
        resolve(null); // Resolve with null if no user is logged in
      }
    }, (error) => {
      console.error("Error checking auth state:", error.message);
      reject(error); // Reject with the error if something goes wrong
    });
  });
};

// Export functions (if using modules)
export { signUp, login, logout, getCurrentUser };