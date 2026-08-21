/* =========================================================
   Firestore 연동 커넥터
   - mockData.js가 먼저 로드된 상태를 전제로 함 (colorPalette, 최초 시딩용 데이터)
   - Firestore가 비어있으면 mockData.js 내용을 한 번 업로드(시딩)
   - 이후에는 Firestore에서 읽어와 window.MOCK을 덮어씀
   ========================================================= */
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyCaa3qLpCcyY-zX718Posr14Dzhu1-6KnA",
    authDomain: "budget-13ce4.firebaseapp.com",
    projectId: "budget-13ce4",
    storageBucket: "budget-13ce4.firebasestorage.app",
    messagingSenderId: "884695004806",
    appId: "1:884695004806:web:9445daecd413c272c34307",
    measurementId: "G-79GWDQKWVS",
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  const COLLECTIONS = ['categories', 'transactions', 'budgets', 'incomes', 'debts', 'cards', 'cardBills', 'shoppingItems'];
  const ID_KEY = { categories: 'key', transactions: 'id', debts: 'id', cards: 'key', cardBills: 'id', shoppingItems: 'id' };

  async function fetchCollection(name) {
    const snap = await db.collection(name).get();
    return snap.docs.map((d) => d.data());
  }

  async function seedFromMock() {
    const MOCK = window.MOCK;
    for (const name of COLLECTIONS) {
      const rows = MOCK[name] || [];
      const idKey = ID_KEY[name];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const docId = idKey ? row[idKey] : (name === 'budgets' ? `${row.month}_${row.category}` : `${name}_${i}`);
        await db.collection(name).doc(String(docId)).set(row);
      }
    }
  }

  window.loadFirestoreData = async function () {
    try {
      const catSnap = await db.collection('categories').limit(1).get();
      if (catSnap.empty) {
        await seedFromMock(); // 최초 1회만 실행됨
      }
      const results = {};
      for (const name of COLLECTIONS) {
        results[name] = await fetchCollection(name);
      }
      window.MOCK = { colorPalette: window.MOCK.colorPalette, ...results };
    } catch (err) {
      console.error('Firestore 로드 실패, mockData.js로 진행:', err);
    }
  };
})();
