/* =========================================================
   목업 데이터 (1단계 전용)
   2단계에서 이 파일 대신 Firestore fetch 결과로 교체.
   Firestore 스키마와 필드명을 동일하게 맞춰둠:
     transactions: amount, merchant, category, datetime, cardLast4,
                    type(승인/취소), status(pending/done)
   ========================================================= */
(function () {
  // 카테고리 색상 팔레트 (모달 HTML과 동일)
  const colorPalette = [
    '#6C9BD1', '#6FBF8B', '#D98CB3', '#9098A8',
    '#D0A25F', '#7FB3B0', '#A398D1', '#C98A6B',
    '#5FA8A0', '#B08CD9', '#D96C6C', '#6CAF6C',
    '#C9A227', '#7A93C4', '#C48B5F', '#8FA6A0',
  ];

  // 기본 카테고리 — 변동비 10개 + 고정비 6개 (사용자 확정 목록)
  // isFixed=true면 예산 사용률 계산에서 제외되고, 고정비 접이식 섹션에서만 참고 표시됨.
  const categories = [
    // 변동비 (예산 관리 대상)
    { key: 'clothing',  label: '의류비',   color: colorPalette[0],  isFixed: false },
    { key: 'beauty',     label: '미용',     color: colorPalette[1],  isFixed: false },
    { key: 'onetime',    label: '일회성',   color: colorPalette[2],  isFixed: false },
    { key: 'food',       label: '식비',     color: colorPalette[3],  isFixed: false },
    { key: 'living',     label: '생활용품', color: colorPalette[4],  isFixed: false },
    { key: 'culture',    label: '문화생활비', color: colorPalette[5], isFixed: false },
    { key: 'meetup',     label: '모임비',   color: colorPalette[6],  isFixed: false },
    { key: 'selfdev',    label: '자기계발', color: colorPalette[7],  isFixed: false },
    { key: 'pharmacy',   label: '약국건강', color: colorPalette[8],  isFixed: false },
    { key: 'etc',        label: '기타',     color: colorPalette[9],  isFixed: false },
    // 고정비 (참고 전용, 예산 계산 제외)
    { key: 'insurance',  label: '보험료',     color: colorPalette[10], isFixed: true },
    { key: 'telecom',    label: '인터넷통신비', color: colorPalette[11], isFixed: true },
    { key: 'housing',    label: '주거관리비', color: colorPalette[12], isFixed: true },
    { key: 'loan',       label: '원리금',     color: colorPalette[13], isFixed: true },
    { key: 'transit',    label: '교통비',     color: colorPalette[14], isFixed: true },
    { key: 'subscribe',  label: '유료구독서비스', color: colorPalette[15], isFixed: true },
  ];

  // id는 임시(2단계에서 Firestore 문서 id로 대체)
  // datetime은 ISO 문자열로 통일 (스키마 datetime)
  const transactions = [
    // ----- 미분류(pending) : 접속 시 태깅 모달로 뜸 -----
    { id: 't1',  merchant: '쿠팡',        amount: 15400, category: null, datetime: '2026-08-20T23:33:00', cardLast4: '1234', type: '승인', status: 'pending' },
    { id: 't2',  merchant: '쿠팡',        amount: 9900,  category: null, datetime: '2026-08-21T00:08:00', cardLast4: '1234', type: '승인', status: 'pending' },
    { id: 't3',  merchant: 'GS25 역삼점', amount: 4800,  category: null, datetime: '2026-08-21T08:12:00', cardLast4: '1234', type: '승인', status: 'pending' },

    // ----- 변동비 (분류 완료) -----
    { id: 't4',  merchant: '올리브영',     amount: 32700, category: '미용',   datetime: '2026-08-20T19:45:00', cardLast4: '1234', type: '승인', status: 'done', memo: '선크림 + 클렌징폼' },
    { id: 't5',  merchant: '이마트 성수점', amount: 58230, category: '식비',   datetime: '2026-08-20T14:20:00', cardLast4: '1234', type: '승인', status: 'done', memo: '일주일치 장보기' },
    { id: 't6',  merchant: '스타벅스',     amount: 6100,  category: '기타',   datetime: '2026-08-19T09:30:00', cardLast4: '1234', type: '승인', status: 'done', memo: '' },
    { id: 't7',  merchant: '다이소 강남점', amount: 12000, category: '생활용품', datetime: '2026-08-19T18:05:00', cardLast4: '1234', type: '승인', status: 'done', memo: '' },
    { id: 't8',  merchant: '배달의민족',   amount: 21500, category: '식비',   datetime: '2026-08-18T20:10:00', cardLast4: '1234', type: '승인', status: 'done', memo: '저녁 치킨' },
    { id: 't9',  merchant: '쿠팡',        amount: 8900,  category: '생활용품', datetime: '2026-08-18T11:22:00', cardLast4: '1234', type: '승인', status: 'done' },
    // 취소 건 예시 (type: 취소 → 음수 처리)
    { id: 't10', merchant: '쿠팡',        amount: 8900,  category: '생활용품', datetime: '2026-08-18T13:40:00', cardLast4: '1234', type: '취소', status: 'done' },
    { id: 't11', merchant: '홈플러스',    amount: 43120, category: '식비',   datetime: '2026-08-17T16:50:00', cardLast4: '1234', type: '승인', status: 'done' },
    { id: 't12', merchant: '무신사',      amount: 39000, category: '의류비', datetime: '2026-08-15T21:15:00', cardLast4: '1234', type: '승인', status: 'done' },
    { id: 't13', merchant: '컬리',        amount: 27600, category: '식비',   datetime: '2026-08-14T07:40:00', cardLast4: '1234', type: '승인', status: 'done' },
    { id: 't14', merchant: '아리따움',    amount: 18900, category: '미용',   datetime: '2026-08-13T15:30:00', cardLast4: '1234', type: '승인', status: 'done' },
    { id: 't15', merchant: '현금-편의점', amount: 3000,  category: '기타',   datetime: '2026-08-12T12:00:00', cardLast4: null,   type: '승인', status: 'done' },
    { id: 't24', merchant: 'CGV 강남',    amount: 15000, category: '문화생활비', datetime: '2026-08-16T20:30:00', cardLast4: '1234', type: '승인', status: 'done', memo: '영화 관람' },
    { id: 't25', merchant: '친구모임 회비', amount: 50000, category: '모임비', datetime: '2026-08-09T19:00:00', cardLast4: null, type: '승인', status: 'done', memo: '동창 모임' },
    { id: 't26', merchant: '온라인 강의', amount: 99000, category: '자기계발', datetime: '2026-08-03T10:00:00', cardLast4: '1234', type: '승인', status: 'done', memo: '엑셀 실무 강의' },
    { id: 't27', merchant: '온누리약국', amount: 12000, category: '약국건강', datetime: '2026-08-11T18:20:00', cardLast4: '1234', type: '승인', status: 'done', memo: '비타민' },
    { id: 't28', merchant: '생일선물',   amount: 80000, category: '일회성', datetime: '2026-08-07T15:00:00', cardLast4: '1234', type: '승인', status: 'done', memo: '부모님 생신' },

    // ----- 고정비 (예산 사용률 계산에서 제외, 참고용 접이식 목록에만 표시) -----
    { id: 't16', merchant: 'SK텔레콤',   amount: 62000,  category: '인터넷통신비', datetime: '2026-08-05T09:00:00', cardLast4: '1234', type: '승인', status: 'done', memo: '가족결합' },
    { id: 't17', merchant: '삼성생명',   amount: 85000,  category: '보험료',     datetime: '2026-08-05T09:05:00', cardLast4: '1234', type: '승인', status: 'done', memo: '실비보험' },
    { id: 't18', merchant: '라이나생명', amount: 30000,  category: '보험료',     datetime: '2026-08-05T09:10:00', cardLast4: '1234', type: '승인', status: 'done', memo: '치아보험' },
    { id: 't19', merchant: '넷플릭스',   amount: 17000,  category: '유료구독서비스', datetime: '2026-08-05T09:15:00', cardLast4: '1234', type: '승인', status: 'done', memo: '' },
    { id: 't20', merchant: '왓챠',       amount: 9900,   category: '유료구독서비스', datetime: '2026-08-05T09:16:00', cardLast4: '1234', type: '승인', status: 'done', memo: '' },
    { id: 't21', merchant: 'e편한세상 관리비', amount: 250000, category: '주거관리비', datetime: '2026-08-05T09:20:00', cardLast4: '1234', type: '승인', status: 'done', memo: '' },
    { id: 't22', merchant: '국민은행 원리금', amount: 450000, category: '원리금', datetime: '2026-08-05T09:25:00', cardLast4: null, type: '승인', status: 'done', memo: '주담대' },
    { id: 't23', merchant: '티머니 충전', amount: 45000,  category: '교통비',   datetime: '2026-08-05T09:30:00', cardLast4: '1234', type: '승인', status: 'done', memo: '' },
  ];

  // budgets: month, category, limit  (Firestore 스키마 동일) — 변동비 카테고리만 대상
  const budgets = [
    { month: '2026-08', category: '식비',     limit: 400000 },
    { month: '2026-08', category: '생활용품', limit: 100000 },
    { month: '2026-08', category: '미용',     limit: 80000 },
    { month: '2026-08', category: '기타',     limit: 150000 },
    { month: '2026-08', category: '의류비',   limit: 100000 },
    { month: '2026-08', category: '문화생활비', limit: 60000 },
    { month: '2026-08', category: '자기계발', limit: 100000 },
    { month: '2026-08', category: '약국건강', limit: 30000 },
    // '일회성', '모임비'는 예산 미설정 → "+ 예산 설정" 상태로 데모
  ];

  // incomes: month, category(급여/기타소득), amount, memo — 예산탭 "수익금액" 섹션용
  const incomes = [
    { month: '2026-08', category: '급여',   amount: 3200000, memo: '8월 정기급여' },
    { month: '2026-08', category: '기타소득', amount: 150000, memo: '중고거래 판매' },
  ];

  // debts: 대출 원리금 상세 (Firestore 스키마 확장: name, startDate, endDate, remainingBalance,
  //   rate, paymentMethod, paymentDay, paymentAccount, memo, history[])
  const debts = [
    {
      id: 'd1',
      name: '삼성화재',
      startDate: '2024-11-20',
      endDate: '2064-11-19',
      remainingBalance: 452327339,
      rate: 4.19,
      paymentMethod: '자동이체',
      paymentDay: 15,
      paymentAccount: '토스뱅크 1000106*****',
      memo: '5년 고정금리. 매월 상환가능 상환시 금액 변경 가능',
      history: [
        { date: '2026-08-18', actualAmount: 1977229, principal: 396469, interest: 1580760 },
        { date: '2026-07-15', actualAmount: 1977229, principal: 395089, interest: 1582140 },
        { date: '2026-06-15', actualAmount: 1977229, principal: 393715, interest: 1583514 },
        { date: '2026-05-15', actualAmount: 1977229, principal: 392346, interest: 1584883 },
      ],
    },
  ];

  // cards: 보유 카드 목록 (isMain=주카드)
  const cards = [
    { key: 'card_samsung', name: '삼성카드', isMain: true },
    { key: 'card_bc',      name: 'BC카드',   isMain: false },
    { key: 'card_shinhan', name: '신한카드', isMain: false },
  ];

  // cardBills: cardName, month, expectedAmount, dueDate(결제일 N일), isPaid
  const cardBills = [
    { id: 'cb1', cardName: '삼성카드', month: '2026-08', dueDate: 10, expectedAmount: 1000000, isPaid: false },
    { id: 'cb2', cardName: '신한카드', month: '2026-08', dueDate: 20, expectedAmount: 620000,  isPaid: false },
    { id: 'cb3', cardName: 'BC카드',   month: '2026-08', dueDate: 5,  expectedAmount: 350000,  isPaid: false },
  ];

  // shoppingItems: id, name, category(living/food/beauty/etc), status(IN_STOCK/TO_BUY),
  //   quantity, purchaseDate, expiryDate, memo
  // 기준일 2026-08-21 — 유통기한 D-day 배지 데모(오늘/D-3이하/지남/여유있음 각 케이스 포함)
  const shoppingItems = [
    { id: 'sh1',  name: '계란',        category: 'food',   status: 'IN_STOCK', quantity: 10, purchaseDate: '2026-08-15', expiryDate: '2026-08-21', memo: '' },
    { id: 'sh2',  name: '우유',        category: 'food',   status: 'IN_STOCK', quantity: 1,  purchaseDate: '2026-08-18', expiryDate: '2026-08-23', memo: '' },
    { id: 'sh3',  name: '두부',        category: 'food',   status: 'IN_STOCK', quantity: 2,  purchaseDate: '2026-08-10', expiryDate: '2026-08-17', memo: '유통기한 지남, 냄새 확인' },
    { id: 'sh4',  name: '쌀',          category: 'food',   status: 'IN_STOCK', quantity: 1,  purchaseDate: '2026-07-01', expiryDate: '2026-11-01', memo: '' },
    { id: 'sh5',  name: '화장지',      category: 'living',  status: 'IN_STOCK', quantity: 3,  purchaseDate: '2026-08-01', expiryDate: null, memo: '' },
    { id: 'sh6',  name: '세제',        category: 'living',  status: 'IN_STOCK', quantity: 1,  purchaseDate: '2026-08-05', expiryDate: null, memo: '' },
    { id: 'sh7',  name: '샴푸',        category: 'beauty',  status: 'IN_STOCK', quantity: 1,  purchaseDate: '2026-07-20', expiryDate: null, memo: '' },
    { id: 'sh8',  name: '마스크팩',    category: 'beauty',  status: 'IN_STOCK', quantity: 5,  purchaseDate: '2026-08-12', expiryDate: '2027-08-12', memo: '' },
    { id: 'sh9',  name: '건전지 AA',   category: 'etc',     status: 'IN_STOCK', quantity: 4,  purchaseDate: '2026-06-15', expiryDate: null, memo: '' },
    { id: 'sh10', name: '강아지 사료', category: 'etc',     status: 'TO_BUY',   quantity: 1,  purchaseDate: null, expiryDate: null, memo: '다이어트 사료로 교체' },
    { id: 'sh11', name: '우유',        category: 'food',    status: 'TO_BUY',   quantity: 2,  purchaseDate: null, expiryDate: null, memo: '' },
    { id: 'sh12', name: '립밤',        category: 'beauty',  status: 'TO_BUY',   quantity: 1,  purchaseDate: null, expiryDate: null, memo: '' },
  ];

  window.MOCK = { colorPalette, categories, transactions, budgets, incomes, debts, cards, cardBills, shoppingItems };
})();
