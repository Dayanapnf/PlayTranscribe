const admin = require('firebase-admin');
const serviceAccount = require('your_admin_sdk.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'your_storage',
  });
}

const storege = admin.firestore();
const bucket = admin.storage().bucket();
const db = admin.firestore();

module.exports = { admin, storege, bucket, db };
