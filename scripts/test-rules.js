const fs = require('fs');
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');

async function run() {
  const projectId = 'tarunno-test';
  const rules = fs.readFileSync('./firestore.rules', 'utf8');

  const testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { rules }
  });

  // Helper to get a Firestore instance for an authenticated user
  const authedDb = (uid) => testEnv.authenticatedContext(uid).firestore();
  const unauth = () => testEnv.unauthenticatedContext().firestore();

  // Create an admin user doc using a privileged context (bypass rules)
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await db.collection('users').doc('admin1').set({ role: 'admin', email: 'admin@example.com' });
  });

  console.log('Running Firestore rules smoke tests...');

  // 1) Register flow: authenticated user creates their users/{uid} doc
  const alice = authedDb('alice');
  try {
    await assertSucceeds(alice.collection('users').doc('alice').set({ email: 'a@example.com', role: 'user', profileComplete: false }));
    console.log('PASS: users/{uid} create by owner');
  } catch (e) {
    console.error('FAIL: users/{uid} create by owner', e);
  }

  // 2) Onboarding: create profiles/{uid}
  try {
    await assertSucceeds(alice.collection('profiles').doc('alice').set({ name: 'Alice', createdAt: Date.now() }));
    console.log('PASS: profiles/{uid} create by owner');
  } catch (e) {
    console.error('FAIL: profiles/{uid} create by owner', e);
  }

  // 3) bloodDonations under profiles/{uid} with uid field set
  try {
    await assertSucceeds(alice.collection('profiles').doc('alice').collection('bloodDonations').doc('d1').set({ uid: 'alice', amount: 1 }));
    console.log('PASS: bloodDonations create with uid');
  } catch (e) {
    console.error('FAIL: bloodDonations create with uid', e);
  }

  // 4) bloodDonations create without uid should fail
  try {
    await assertFails(alice.collection('profiles').doc('alice').collection('bloodDonations').doc('d2').set({ amount: 1 }));
    console.log('PASS: bloodDonations create without uid rejected');
  } catch (e) {
    console.error('FAIL: bloodDonations create without uid test threw', e);
  }

  // 5) collection-group bloodDonations under different parent: attempt to write to /somewhereElse/bloodDonations
  try {
    await assertFails(alice.collection('other').doc('x').collection('bloodDonations').doc('d3').set({ uid: 'alice', amount: 1 }));
    console.log('PASS: creation under other parent rejected (expected)');
  } catch (e) {
    console.error('FAIL: collection-group bloodDonations test threw', e);
  }

  // 6) fundContributions create by owner (valid)
  try {
    await assertSucceeds(alice.collection('fundContributions').add({ uid: 'alice', status: 'pending', amount: 100 }));
    console.log('PASS: fundContributions create by owner');
  } catch (e) {
    console.error('FAIL: fundContributions create by owner', e);
  }

  // 7) fundContributions update: admin approves
  const admin = authedDb('admin1');
  // create a contribution as alice (bypass rules to ensure doc exists)
  let contribId;
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    const ref = await db.collection('fundContributions').add({ uid: 'alice', status: 'pending', amount: 200 });
    contribId = ref.id;
  });

  try {
    await assertSucceeds(admin.collection('fundContributions').doc(contribId).update({ status: 'approved', reviewedBy: 'admin1' }));
    console.log('PASS: admin can approve contribution');
  } catch (e) {
    console.error('FAIL: admin approve failed', e);
  }

  // 8) non-owner cannot approve
  try {
    await assertFails(alice.collection('fundContributions').doc(contribId).update({ status: 'approved' }));
    console.log('PASS: non-admin cannot change status');
  } catch (e) {
    console.error('FAIL: non-admin status change test threw', e);
  }

  // Clean up
  await testEnv.cleanup();
  console.log('Tests complete.');
}

run().catch((e) => {
  console.error('Test run failed:', e);
  process.exit(1);
});
