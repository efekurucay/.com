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

async function fix() {
  const db = getFirestore();
  const projects = await db.collection("projects").where("slug", "==", "0-trendyol-ai-solutions").get();
  if (projects.empty) {
    console.log("NOT FOUND");
    process.exit(1);
  }
  const doc = projects.docs[0];
  const data = doc.data();
  if (data.team && data.team[0]) {
    data.team[0].name = "Yahya Efe Kuruçay";
    data.team[0].linkedIn = "https://www.linkedin.com/in/efekurucay24";
    await doc.ref.update({ team: data.team });
    console.log("UPDATED", doc.id);
  } else {
    console.log("NO TEAM", data);
  }
}
fix().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
