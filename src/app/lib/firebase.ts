import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// isi konfigurasi sesuai dengan konfigurasi firebase kalian
const firebaseConfig = {
    apiKey: "AIzaSyAGXg84VXV5aL3JN459iyxzJj5IQbOmdG0",
    authDomain: "todolist-b02d1.firebaseapp.com",
    projectId: "todolist-b02d1",
    storageBucket: "todolist-b02d1.firebasestorage.app",
    messagingSenderId: "473066538552",
    appId: "1:473066538552:web:9650fb64684689d3d208cd",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

