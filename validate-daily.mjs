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
  'notion-learning-profile.js',
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

assert(
  daily.weaknessScore({ status: 'unknown' }) > daily.weaknessScore({ status: 'wrong' }),
  '모르겠음이 오답보다 높은 재학습 우선순위를 가져야 합니다.'
);
assert(
  daily.weaknessScore({ status: 'wrong' }) > daily.weaknessScore({ status: 'correct' }),
  '오답이 정답보다 높은 재학습 우선순위를 가져야 합니다.'
);
assert(
  daily.weaknessScore({ status: 'correct' }) === 0,
  '정답은 취약 응답으로 계산하면 안 됩니다.'
);

const nosqlQuestion = data.QUESTIONS.find((question) => question.id === 296);
const masteredPlatformQuestion = data.QUESTIONS.find((question) => question.id === 203);
assert(
  daily.profilePriorityScore(nosqlQuestion) > daily.profilePriorityScore(masteredPlatformQuestion),
  'Notion의 미암기 NoSQL 제품 구분이 이해 완료 플랫폼 문항보다 높은 사전 우선순위를 가져야 합니다.'
);

const seed = '2026-09-04';
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
assert(noAttemptInfo.profilePriority >= 4, `Notion 취약 개념 반영 문항이 부족합니다: ${noAttemptInfo.profilePriority}`);
assert(
  first.some((id) => data.QUESTIONS.find((question) => question.id === id)?.conceptId === 'nosql-products'),
  '최신 Notion 미암기 영역인 NoSQL 제품 구분이 오늘의 8문제에 반영되지 않았습니다.'
);

const weakQuestion = data.QUESTIONS.find((question) => question.id === 47);
const weakAttempts = [{
  questionId: weakQuestion.id,
  conceptId: weakQuestion.conceptId,
  status: 'wrong',
  answeredAt: '2026-09-04T12:00:00.000Z',
}];
const weakSet = daily.selectDailyQuestionIds({
  questions: data.QUESTIONS,
  attempts: weakAttempts,
  seed: '2026-09-05',
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

console.log('검증 완료: 앱 풀이 기록을 최우선으로 두면서 2026-09-04 Notion 이해도 사전 가중치를 반영하는 오늘의 8문제 선정 기준이 정상입니다.');
