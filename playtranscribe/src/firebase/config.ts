import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// Configuração do Firebase
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "authdomain.firebaseapp.com",
  projectId: "projectID",
  storageBucket: "storagename.appspot.com",
  messagingSenderId: "messagingSenderId",
  appId: "appID",
  measurementId: "measurementId"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);

// Configurando os serviços Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

