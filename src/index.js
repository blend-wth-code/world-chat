import React from "react";
import ReactDOM from "react-dom/client";
import { FirebaseAppProvider } from "reactfire";
import { initializeApp } from "firebase/app";
import App from "./components/App";
import "./styles/common.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

const firebaseConfig = {
  apiKey: "AIzaSyBmnvQEDqeQGKnk0PqkyWXNCrr905FR-os",
  authDomain: "react-firebase-f9ed9.firebaseapp.com",
  projectId: "react-firebase-f9ed9",
  storageBucket: "react-firebase-f9ed9.appspot.com",
  messagingSenderId: "788405322236",
  appId: "1:788405322236:web:e593f5a5b7732544367279",
};
initializeApp(firebaseConfig);
root.render(
  <React.StrictMode>
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <App />
    </FirebaseAppProvider>
  </React.StrictMode>
);
