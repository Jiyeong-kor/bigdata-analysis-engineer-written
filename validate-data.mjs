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
  [1, 51],
  [2, 48],
  [3, 57],
  [4, 59],
]);
const bankOf = (question) => question.bank || 'past';

assert(data.QUESTIONS.length === 215, `문항 수가 215개가 아닙니다: ${data.QUESTIONS.length}`);
assert(new Set(data.QUESTIONS.map((question) => question.id)).size === 215, '문항 ID가 중복되었습니다.');

for (const [subject, expected] of expectedSubjectCounts.entries()) {
  const count = data.QUESTIONS.filter((question) => question.subject === subject).length;
  assert(count === expected, `${subject}과목 문항 수가 ${expected}개가 아닙니다: ${count}`);
}

const expectedBankCounts = new Map([
  ['past', 80],
  ['diagnostic', 40],
  ['practice', 95],
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
assert(practiceIds[0] === 201 && practiceIds.at(-1) === 295, '교재 변형문제 ID 범위가 201~295가 아닙니다.');
assert(practiceIds.every((id, index) => id === 201 + index), '교재 변형문제 ID 201~295 사이에 누락이 있습니다.');

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
const q295 = data.QUESTIONS.find((question) => question.id === 295);
assert(q101?.bank === 'diagnostic' && q140?.bank === 'diagnostic', '자가진단 문제은행 연결이 잘못되었습니다.');
assert(q201?.bank === 'practice' && q295?.bank === 'practice', '교재 변형 문제은행 연결이 잘못되었습니다.');

console.log('검증 완료: 4과목 215문항, 기출 80·자가진단 40·교재 변형 95, 선택지·정답·개념 연결이 정상입니다.');
