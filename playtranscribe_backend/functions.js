// functions.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.resetDailyQuota = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const usersRef = admin.firestore().collection('users');

    try {
      const usersSnapshot = await usersRef.get();
      const batch = admin.firestore().batch();

      usersSnapshot.forEach((doc) => {
        const quotaRef = doc.ref.collection('quota').doc('dailyQuota');
        batch.set(
          quotaRef,
          {
            usedQuotaMB: 0,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      });

      await batch.commit();
      console.log('Cotas diárias zeradas com sucesso.');
    } catch (error) {
      console.error('Erro ao zerar as cotas diárias:', error);
    }
  });
