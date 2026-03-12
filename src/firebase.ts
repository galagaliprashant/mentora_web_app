import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBuHApOarw5wSsX2AxNTgxtvlbV8F3Q1RM',
  authDomain: 'mentoraiasmobile.firebaseapp.com',
  projectId: 'mentoraiasmobile',
  storageBucket: 'mentoraiasmobile.firebasestorage.app',
  messagingSenderId: '145675560620',
  appId: '1:145675560620:web:mentora-web-app',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
