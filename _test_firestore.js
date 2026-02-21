const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

// Load .env manually
const envContent = fs.readFileSync('.env', 'utf8');
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
});

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

console.log('ProjectID:', projectId ? 'SET' : 'MISSING');
console.log('ClientEmail:', clientEmail ? 'SET' : 'MISSING');
console.log('PrivateKey:', privateKey ? 'SET (' + privateKey.length + ' chars)' : 'MISSING');

if (!clientEmail || !privateKey) { console.log('ADMIN CREDENTIALS MISSING'); process.exit(1); }

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore(app);

async function test() {
    try {
        const settingsSnap = await db.collection('settings').doc('person').get();
        console.log('Person exists:', settingsSnap.exists);

        const allExps = await db.collection('experiences').get();
        console.log('All experiences count:', allExps.size);
        allExps.docs.forEach(d => {
            const data = d.data();
            console.log('  -', d.id, '| type:', data.type, '| order:', data.order, '| visible:', data.visible);
        });

        const workExps = await db.collection('experiences').where('type', '==', 'work').orderBy('order').get();
        console.log('Work experiences count:', workExps.size);

        const edu = await db.collection('education').get();
        console.log('Education count:', edu.size);

        const skills = await db.collection('skills').get();
        console.log('Skills count:', skills.size);

        const certs = await db.collection('certifications').get();
        console.log('Certifications count:', certs.size);

    } catch (e) {
        console.error('ERROR:', e.message);
        console.error('CODE:', e.code);
    }
    process.exit(0);
}
test();
