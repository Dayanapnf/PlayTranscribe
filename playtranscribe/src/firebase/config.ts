import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCO4CjtV-fsTxwRQ3AD0WSo6at82J8flog",
  authDomain: "playtranscribe.firebaseapp.com",
  projectId: "playtranscribe",
  storageBucket: "playtranscribe.appspot.com",
  messagingSenderId: "188309684942",
  appId: "1:188309684942:web:fbee2c7ffda4113b4f469f",
  measurementId: "G-FGCHMLDRY5"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);

// Configurando os serviços Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
