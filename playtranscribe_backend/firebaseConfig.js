const admin = require('firebase-admin');
const serviceAccount = require('./playtranscribe-firebase-adminsdk-st6um-2ba0aa147a.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'playtranscribe.appspot.com',
  });
}

const storege = admin.firestore();
const bucket = admin.storage().bucket();
const db = admin.firestore();

module.exports = { admin, storege, bucket, db };
