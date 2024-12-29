  // Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBlAJry-cbXWFiiju2bJ9zscwH3GLo5cqE",
  authDomain: "myblogs-124da.firebaseapp.com",
  databaseURL: "https://myblogs-124da-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "myblogs-124da",
  storageBucket: "myblogs-124da.firebasestorage.app",
  messagingSenderId: "33700612705",
  appId: "1:33700612705:web:c7813effb1e3d3c4853820"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);

const myblogs = document.querySelector('#myblogs');
const login = document.querySelector('#login');