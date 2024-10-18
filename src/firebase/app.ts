// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6uCOVCJ7RVQb75LYP5tFSu9qUPVV3S1I",
  authDomain: "bitovi-hearts-typescript.firebaseapp.com",
  projectId: "bitovi-hearts-typescript",
  storageBucket: "bitovi-hearts-typescript.appspot.com",
  messagingSenderId: "701816952511",
  appId: "1:701816952511:web:78c753d13b23aa5cb8980a"
};

// Initialize Firebase
export let app: FirebaseApp

export function init() {
    app = initializeApp(firebaseConfig);
}
