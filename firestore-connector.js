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
/* ========== ✅ 저장 함수 추가 ========== */
  window.saveToFirestore = {
    async updateTransaction(transaction) {
      try {
        const docId = String(transaction.id);
        await db.collection('transactions').doc(docId).set(transaction);
        console.log('✅ 거래 저장:', docId, transaction);
      } catch (err) {
        console.error('❌ 거래 저장 실패:', err);
        throw err;
      }
    },
    async updateCategory(category) {
      try {
        const docId = String(category.key);
        await db.collection('categories').doc(docId).set(category);
        console.log('✅ 카테고리 저장:', docId);
      } catch (err) {
        console.error('❌ 카테고리 저장 실패:', err);
        throw err;
      }
    },
    async updateBudget(budget) {
      try {
        const docId = `${budget.month}_${budget.category}`;
        await db.collection('budgets').doc(docId).set(budget);
        console.log('✅ 예산 저장:', docId);
      } catch (err) {
        console.error('❌ 예산 저장 실패:', err);
        throw err;
      }
    },
    async updateIncome(income) {
      try {
        const docId = `${income.month}_${income.category}`;
        await db.collection('incomes').doc(docId).set(income);
        console.log('✅ 수익 저장:', docId);
      } catch (err) {
        console.error('❌ 수익 저장 실패:', err);
        throw err;
      }
    },
    async updateDebt(debt) {
      try {
        const docId = String(debt.id);
        await db.collection('debts').doc(docId).set(debt);
        console.log('✅ 대출 저장:', docId);
      } catch (err) {
        console.error('❌ 대출 저장 실패:', err);
        throw err;
      }
    },
    async updateCard(card) {
      try {
        const docId = String(card.key);
        await db.collection('cards').doc(docId).set(card);
        console.log('✅ 카드 저장:', docId);
      } catch (err) {
        console.error('❌ 카드 저장 실패:', err);
        throw err;
      }
    },
    async updateCardBill(bill) {
      try {
        const docId = String(bill.id);
        await db.collection('cardBills').doc(docId).set(bill);
        console.log('✅ 카드 결제예정 저장:', docId);
      } catch (err) {
        console.error('❌ 카드 결제예정 저장 실패:', err);
        throw err;
      }
    },
    async updateShoppingItem(item) {
      try {
        const docId = String(item.id);
        await db.collection('shoppingItems').doc(docId).set(item);
        console.log('✅ 쇼핑리스트 저장:', docId);
      } catch (err) {
        console.error('❌ 쇼핑리스트 저장 실패:', err);
        throw err;
      }
    },
    async deleteDocument(collection, docId) {
      try {
        await db.collection(collection).doc(String(docId)).delete();
        console.log('✅ 문서 삭제:', collection, docId);
      } catch (err) {
        console.error('❌ 문서 삭제 실패:', err);
        throw err;
      }
    },
    async saveMany(collection, documents) {
      try {
        const batch = db.batch();
        documents.forEach(doc => {
          const idField = { categories: 'key', transactions: 'id', debts: 'id', cards: 'key', cardBills: 'id', shoppingItems: 'id' }[collection] || 'id';
          const docId = String(doc[idField]);
          batch.set(db.collection(collection).doc(docId), doc);
        });
        await batch.commit();
        console.log(`✅ ${documents.length}개 문서 일괄 저장:`, collection);
      } catch (err) {
        console.error(`❌ ${collection} 일괄 저장 실패:`, err);
        throw err;
      }
    },
  };
