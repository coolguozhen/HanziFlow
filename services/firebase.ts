import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBaZoFDrALRlT1_XT-XrJ7W_eeuj55Mcb0",
    authDomain: "hanziflow.firebaseapp.com",
    projectId: "hanziflow",
    storageBucket: "hanziflow.firebasestorage.app",
    messagingSenderId: "552710642008",
    appId: "1:552710642008:web:34599c57561643f3136d2d",
    measurementId: "G-V8SS6SZCTM"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

export default app;
