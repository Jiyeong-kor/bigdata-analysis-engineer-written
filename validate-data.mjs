import fs from 'node:fs';
import vm from 'node:vm';

const context = {
  window: {},
  console,
  document: { querySelector: () => null },
  renderHome: () => {},
  renderDiagram: () => '',
};
vm.createContext(context);

for (const file of [
  'data-subject-1.js',
  'data-subject-2.js',
  'data-subject-3.js',
  'data-subject-4.js',
  'data-bank-subject-1.js',
  'data-bank-subject-2.js',
  'data-bank-subject-3.js',
  'data-bank-subject-4.js',
  'data-finalize.js',
  'notion-learning-profile.js',
  'chat-review-12th.js',
]) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}

const data = context.window.STUDY_DATA;
if (!data) throw new Error('STUDY_DATA가 생성되지 않았습니다.');
context.DATA = data;
vm.runInContext(fs.readFileSync('source-sync-patches.js', 'utf8'), context, {
  filename: 'source-sync-patches.js',
});

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const expectedSubjectCounts = new Map([
  [1, 60],
  [2, 52],
  [3, 57],
  [4, 69],
]);
const bankOf = (question) => question.bank || 'past';

assert(data.QUESTIONS.length === 238, `문항 수가 238개가 아닙니다: ${data.QUESTIONS.length}`);
assert(new Set(data.QUESTIONS.map((question) => question.id)).size === 238, '문항 ID가 중복되었습니다.');

for (const [subject, expected] of expectedSubjectCounts.entries()) {
  const count = data.QUESTIONS.filter((question) => question.subject === subject).length;
  assert(count === expected, `${subject}과목 문항 수가 ${expected}개가 아닙니다: ${count}`);
}

const expectedBankCounts = new Map([
  ['past', 80],
  ['diagnostic', 40],
  ['practice', 104],
  ['chat-review', 14],
]);
for (const [bank, expected] of expectedBankCounts.entries()) {
  const count = data.QUESTIONS.filter((question) => bankOf(question) === bank).length;
  assert(count === expected, `${bank} 문제 수가 ${expected}개가 아닙니다: ${count}`);
}

for (const question of data.QUESTIONS) {
  assert(data.CONCEPTS[question.conceptId], `${question.id}번의 개념 ${question.conceptId}가 없습니다.`);
  assert(Array.isArray(question.choices) && question.choices.length === 4, `${question.id}번 선택지가 4개가 아닙니다.`);
  assert(Number.isInteger(question.answer) && question.answer >= 0 && question.answer <= 3, `${question.id}번 정답 인덱스가 잘못되었습니다.`);
  assert(typeof question.stem === 'string' && question.stem.trim().length > 0, `${question.id}번 문제 문장이 비어 있습니다.`);
  assert(typeof question.explanation === 'string' && question.explanation.trim().length > 0, `${question.id}번 해설이 비어 있습니다.`);
}

for (const [conceptId, concept] of Object.entries(data.CONCEPTS)) {
  assert(concept.title && concept.definition && concept.decision, `${conceptId} 개념의 핵심 설명이 부족합니다.`);
  assert(Array.isArray(concept.distinctions) && concept.distinctions.length > 0, `${conceptId} 개념의 구분 기준이 없습니다.`);
  assert(concept.miniCheck?.q && concept.miniCheck?.a, `${conceptId} 개념의 미니 확인문제가 없습니다.`);
}

const diagnosticIds = data.QUESTIONS.filter((question) => bankOf(question) === 'diagnostic').map((question) => question.id).sort((a, b) => a - b);
assert(diagnosticIds[0] === 101 && diagnosticIds.at(-1) === 140, '자가진단 ID 범위가 101~140이 아닙니다.');

const practiceIds = data.QUESTIONS.filter((question) => bankOf(question) === 'practice').map((question) => question.id).sort((a, b) => a - b);
assert(practiceIds[0] === 201 && practiceIds.at(-1) === 304, '교재·노션 변형문제 ID 범위가 201~304가 아닙니다.');
assert(practiceIds.every((id, index) => id === 201 + index), '교재·노션 변형문제 ID 201~304 사이에 누락이 있습니다.');

const chatReviewIds = data.QUESTIONS.filter((question) => bankOf(question) === 'chat-review').map((question) => question.id).sort((a, b) => a - b);
assert(chatReviewIds.length === 14, `12회 채팅 복습 문항이 14개가 아닙니다: ${chatReviewIds.length}`);
assert(chatReviewIds[0] === 305 && chatReviewIds.at(-1) === 318, '12회 채팅 복습 ID 범위가 305~318이 아닙니다.');
assert(chatReviewIds.every((id, index) => id === 305 + index), '12회 채팅 복습 ID 305~318 사이에 누락이 있습니다.');
assert(data.QUESTIONS.filter((question) => bankOf(question) === 'chat-review' && question.subject === 1).length === 4, '12회 채팅 복습 1과목 문항 수가 4개가 아닙니다.');
assert(data.QUESTIONS.filter((question) => bankOf(question) === 'chat-review' && question.subject === 4).length === 10, '12회 채팅 복습 4과목 문항 수가 10개가 아닙니다.');

const q33 = data.QUESTIONS.find((question) => question.id === 33);
assert(q33.choices.join('|') === '25/12|35/12|35/6|49/12', '33번 보강 선택지가 반영되지 않았습니다.');
assert(q33.answer === 1, '33번 정답이 ②가 아닙니다.');

const q21 = data.QUESTIONS.find((question) => question.id === 21);
const q63 = data.QUESTIONS.find((question) => question.id === 63);
assert(q21.diagram === 'boxplot-treatment', '21번 상자그림 연결이 없습니다.');
assert(q63.diagram === 'boxplot-groups', '63번 상자그림 연결이 없습니다.');

const q31 = data.QUESTIONS.find((question) => question.id === 31);
assert(q31.answer === 1 && q31.stem.includes('대응표본'), '31번 최신 Notion 문항이 반영되지 않았습니다.');

const q101 = data.QUESTIONS.find((question) => question.id === 101);
const q140 = data.QUESTIONS.find((question) => question.id === 140);
const q201 = data.QUESTIONS.find((question) => question.id === 201);
const q304 = data.QUESTIONS.find((question) => question.id === 304);
assert(q101?.bank === 'diagnostic' && q140?.bank === 'diagnostic', '자가진단 문제은행 연결이 잘못되었습니다.');
assert(q201?.bank === 'practice' && q304?.bank === 'practice', '교재·노션 변형 문제은행 연결이 잘못되었습니다.');

const notionProfile = context.window.NOTION_LEARNING_PROFILE;
assert(notionProfile?.version === 3, '최신 적응형 학습 프로필 버전이 반영되지 않았습니다.');
assert(notionProfile?.updatedAt === '2026-09-04T12:31:52.274Z', '최신 앱 학습기록의 정확한 스냅샷 시각이 반영되지 않았습니다.');
assert(Date.parse(notionProfile.updatedAt) > 0, '학습 프로필 시각을 파싱할 수 없습니다.');
for (const id of [296, 297, 298, 299]) {
  const question = data.QUESTIONS.find((item) => item.id === id);
  assert(question?.conceptId === 'nosql-products', `${id}번 NoSQL 제품 구분 보강문제가 없습니다.`);
}
assert(data.QUESTIONS.find((question) => question.id === 300)?.conceptId === 'web-collection', '300번 Chukwa 보강문제가 없습니다.');
for (const id of [301, 302, 303, 304]) {
  const question = data.QUESTIONS.find((item) => item.id === id);
  assert(question?.conceptId === 'hypothesis', `${id}번 비모수 검정 보강문제가 없습니다.`);
}

const chatChecks = [
  [305, 'storage-architecture', 1],
  [306, 'nosql-products', 1],
  [307, 'web-collection', 1],
  [308, 'privacy', 2],
  [309, 'metrics', 0],
  [310, 'boxplot', 3],
  [311, 'visualization', 2],
  [312, 'visualization', 2],
  [313, 'visualization', 1],
  [314, 'regression', 0],
  [315, 'regression', 0],
  [316, 'model-operations', 3],
  [317, 'task-metrics', 2],
  [318, 'regression', 3],
];
for (const [id, conceptId, answer] of chatChecks) {
  const question = data.QUESTIONS.find((item) => item.id === id);
  assert(question?.bank === 'chat-review', `${id}번이 12회 채팅 복습 문제은행에 연결되지 않았습니다.`);
  assert(question?.conceptId === conceptId, `${id}번 개념 연결이 ${conceptId}가 아닙니다.`);
  assert(question?.answer === answer, `${id}번 정답 인덱스가 잘못되었습니다.`);
  assert(question?.source === '12회 채팅 복습', `${id}번 출처 표시가 잘못되었습니다.`);
}

console.log('검증 완료: 4과목 238문항, 기출 80·자가진단 40·교재/노션 변형 104·12회 채팅 복습 14문항의 정답·개념·문제은행 연결이 정상입니다.');
