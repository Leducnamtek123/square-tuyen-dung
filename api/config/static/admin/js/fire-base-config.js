import {initializeApp} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import {
    getFirestore,
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import { FIREBASE_CONFIG } from "./init.js";

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

export default db;