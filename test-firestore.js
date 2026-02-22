require("dotenv").config({ path: ".env.local" });
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

try {
  let privateKeyStr = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!privateKeyStr) {
    privateKeyStr = require("fs").readFileSync(".env").toString().match(/FIREBASE_ADMIN_PRIVATE_KEY='(.*?)'/)[1];
    process.env.FIREBASE_ADMIN_PRIVATE_KEY = privateKeyStr;
  }
} catch(e) {}

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
initializeApp({ credential: cert(serviceAccount) });

getFirestore().collection("settings").doc("home").get().then(doc => {
  console.log("EXISTS:", doc.exists);
  console.log("DATA:", doc.data());
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
