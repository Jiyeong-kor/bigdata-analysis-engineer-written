import fs from 'node:fs';
import vm from 'node:vm';

const context = {
  window: {},
  globalThis: {},
  console,
  document: { querySelector: () => null },
  renderHome: () => {},
  renderDiagram: () => '',
};
context.globalThis = context;
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
vm.runInContext(fs.readFileSync('daily-selection.js', 'utf8'), context, {
  filename: 'daily-selection.js',
});

const daily = context.window.DAILY_SELECTION;
if (!daily) throw new Error('DAILY_SELECTION이 생성되지 않았습니다.');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const seed = '2026-08-31';
const first = daily.selectDailyQuestionIds({
  questions: data.QUESTIONS,
  attempts: [],
  seed,
});
const second = daily.selectDailyQuestionIds({
  questions: data.QUESTIONS,
  attempts: [],
  seed,
});

assert(first.length === 8, `오늘의 문제 수가 8개가 아닙니다: ${first.length}`);
assert(new Set(first).size === 8, '오늘의 8문제에 중복 문항이 있습니다.');
assert(first.join(',') === second.join(','), '같은 날짜의 오늘의 8문제가 안정적으로 재현되지 않습니다.');

const noAttemptInfo = daily.describeDailySet({
  ids: first,
  questions: data.QUESTIONS,
  attempts: [],
});
assert(noAttemptInfo.subjects.every((count) => count === 2), `과목별 2문항 구성이 아닙니다: ${noAttemptInfo.subjects.join(',')}`);
assert(noAttemptInfo.unseen === 8, '첫 세트의 8문항이 모두 미풀이 문항이 아닙니다.');
assert(noAttemptInfo.bigdataSpecific >= 4, `빅데이터분석기사 추가영역 가중치가 부족합니다: ${noAttemptInfo.bigdataSpecific}`);

const weakQuestion = data.QUESTIONS.find((question) => question.id === 47);
const weakAttempts = [{
  questionId: weakQuestion.id,
  conceptId: weakQuestion.conceptId,
  status: 'wrong',
  confidence: 'uncertain',
  answeredAt: '2026-08-30T12:00:00.000Z',
}];
const weakSet = daily.selectDailyQuestionIds({
  questions: data.QUESTIONS,
  attempts: weakAttempts,
  seed: '2026-09-01',
});
assert(weakSet.includes(weakQuestion.id), '직전 오답 문항이 다음 날 8문제에 반영되지 않았습니다.');

const weakInfo = daily.describeDailySet({
  ids: weakSet,
  questions: data.QUESTIONS,
  attempts: weakAttempts,
});
assert(weakInfo.subjects.every((count) => count === 2), '오답 반영 후 과목별 2문항 구성이 깨졌습니다.');
assert(weakInfo.weak >= 1, '오답·취약 문항 우선 원칙이 설명 정보에 반영되지 않았습니다.');

const dailyModeSource = fs.readFileSync('daily-mode.js', 'utf8');
for (const forbiddenCopy of [
  '매일학습 채팅',
  '출제 기준을 앱에 적용',
  '8문제 만들기',
  '빅분기 추가영역 우선',
  '맞힌 개념 반복 최소화',
  '정답 제출 후 해설 공개',
]) {
  assert(!dailyModeSource.includes(forbiddenCopy), `사용자 화면에 내부 구현 문구가 남아 있습니다: ${forbiddenCopy}`);
}

console.log('검증 완료: 오늘의 8문제 선정 기준과 사용자 중심 화면 문구가 정상입니다.');
