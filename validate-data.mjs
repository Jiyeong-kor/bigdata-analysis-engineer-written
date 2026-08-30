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

assert(data.QUESTIONS.length === 80, `문항 수가 80개가 아닙니다: ${data.QUESTIONS.length}`);
assert(new Set(data.QUESTIONS.map((question) => question.id)).size === 80, '문항 ID가 중복되었습니다.');

for (let subject = 1; subject <= 4; subject += 1) {
  const count = data.QUESTIONS.filter((question) => question.subject === subject).length;
  assert(count === 20, `${subject}과목 문항 수가 20개가 아닙니다: ${count}`);
}

for (const question of data.QUESTIONS) {
  assert(data.CONCEPTS[question.conceptId], `${question.id}번의 개념 ${question.conceptId}가 없습니다.`);
  assert(Array.isArray(question.choices) && question.choices.length === 4, `${question.id}번 선택지가 4개가 아닙니다.`);
  assert(Number.isInteger(question.answer) && question.answer >= 0 && question.answer <= 3, `${question.id}번 정답 인덱스가 잘못되었습니다.`);
}

const q33 = data.QUESTIONS.find((question) => question.id === 33);
assert(q33.choices.join('|') === '25/12|35/12|35/6|49/12', '33번 보강 선택지가 반영되지 않았습니다.');
assert(q33.answer === 1, '33번 정답이 ②가 아닙니다.');

const q21 = data.QUESTIONS.find((question) => question.id === 21);
const q63 = data.QUESTIONS.find((question) => question.id === 63);
assert(q21.diagram === 'boxplot-treatment', '21번 상자그림 연결이 없습니다.');
assert(q63.diagram === 'boxplot-groups', '63번 상자그림 연결이 없습니다.');

const q31 = data.QUESTIONS.find((question) => question.id === 31);
assert(q31.answer === 1 && q31.stem.includes('대응표본'), '31번 최신 Notion 문항이 반영되지 않았습니다.');

console.log('검증 완료: 4과목 80문항, 선택지, 정답, 개념 연결, 보강 도표가 정상입니다.');
