// firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'; // 👈 THÊM DÒNG NÀY

// 🛠️ Thay đoạn này bằng config Firebase thật của bạn
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAL6AIGMB6bP1B4pQrhvAV6RyU7Al5BXq0',
  authDomain: 'caronovaonline.firebaseapp.com',
  databaseURL:
    'https://caronovaonline-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'caronovaonline',
  storageBucket: 'caronovaonline.firebasestorage.app',
  messagingSenderId: '565695054679',
  appId: '1:565695054679:web:9c2b9483a9320e6101f412',
  measurementId: 'G-LE6RZCB5FG',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // ✅ export để các file khác dùng
export const auth = getAuth(app); // 👈 Thêm dòng này nếu chưa có
