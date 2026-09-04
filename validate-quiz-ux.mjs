import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const index = read('./index.html');
const events = read('./app-events.js');
const instantUi = read('./instant-choice-grading-ui.js');
const simplification = read('./quiz-simplification.js');
const conceptLinkFix = read('./concept-link-fix.js');
const pValuePatch = read('./hypothesis-pvalue-patch.js');
const appUpdate = read('./app-update.js');
const layout = read('./iphone-quiz-layout.css');
const serviceWorker = read('./sw.js');
const subject4Bank = read('./data-bank-subject-4.js');

assert.ok(
  events.includes('state.activeSession.draft.answer = Number(button.dataset.answer);') &&
    events.includes('answerCurrent(false);'),
  '객관식 선택 즉시 채점 연결이 없습니다.'
);

assert.ok(
  instantUi.includes("question.type === 'short'") &&
    instantUi.includes('checkButton.remove()'),
  '객관식에서 정답 확인 버튼을 제거하는 처리가 없습니다.'
);

assert.ok(
  instantUi.includes('originalAnswerCurrent') &&
    instantUi.includes('positionNextActionForTap') &&
    instantUi.includes('[data-action="next-question"]'),
  '채점 후 다음 문제 버튼으로 이동하는 처리가 없습니다.'
);

assert.ok(
  instantUi.includes('originalStartSession') &&
    instantUi.includes('originalResumeSession') &&
    instantUi.includes('originalNextQuestion') &&
    instantUi.includes('positionQuestionAtReadingStart'),
  '새 문항을 문제 카드 위치로 이동하는 처리가 없습니다.'
);

assert.ok(
  simplification.includes("removes: ['elapsed-time', 'confidence', 'reason-note']") &&
    simplification.includes("app.querySelector('.confidence')?.remove()") &&
    simplification.includes("app.querySelector('.reason-box')?.remove()") &&
    simplification.includes("caption.textContent.includes('사용한 시간')") &&
    !simplification.includes('elapsedSec,') &&
    !simplification.includes('confidence:') &&
    !simplification.includes("note: ''"),
  '풀이시간, 확신도 또는 틀린 이유 메모 제거가 완전하지 않습니다.'
);

assert.ok(
  conceptLinkFix.includes('currentButton.dataset.concept = question.conceptId') &&
    conceptLinkFix.includes('현재 문제 개념 보기') &&
    conceptLinkFix.includes('recommendation.conceptId === question.conceptId'),
  '현재 문항의 개념과 개념 보기 버튼을 고정하는 처리가 없습니다.'
);

assert.ok(
  pValuePatch.includes('p값 ≤ α → 귀무가설 기각') &&
    pValuePatch.includes('p값 > α → 귀무가설을 기각하지 못함') &&
    pValuePatch.includes('0.08 > 0.05') &&
    pValuePatch.includes('question.id === 119'),
  '가설검정 개념에 p값과 유의수준 비교 규칙이 반영되지 않았습니다.'
);

assert.ok(
  subject4Bank.includes("diagnostic(131, 31, 'TP=36, FP=12, FN=24, TN=28일 때 정밀도는?'") &&
    subject4Bank.includes("2, 'metrics', '정밀도는 TP/(TP+FP)=36/(36+12)=0.75입니다.'"),
  '자가진단 31번 정밀도 문항의 개념 데이터가 metrics로 연결되어 있지 않습니다.'
);

assert.ok(
  layout.includes('#app') &&
    layout.includes('padding-top: 0') &&
    layout.includes('.app-shell > .topbar + .page'),
  'iPhone safe area 중복 보정 스타일이 없습니다.'
);

assert.ok(
  appUpdate.includes("const APP_VERSION = 'v13';") &&
    appUpdate.includes('data-action="app-update"') &&
    appUpdate.includes('registration.update()') &&
    appUpdate.includes("window.location.reload()") &&
    appUpdate.includes("SKIP_WAITING"),
  '앱 내부 업데이트 확인과 자동 새로고침 처리가 없습니다.'
);

assert.ok(
  index.includes('./iphone-quiz-layout.css') &&
    index.includes('./notion-learning-profile.js') &&
    index.includes('./hypothesis-pvalue-patch.js') &&
    index.includes('./quiz-simplification.js') &&
    index.includes('./concept-link-fix.js') &&
    index.includes('./app-update.js') &&
    index.indexOf('./data-finalize.js') < index.indexOf('./notion-learning-profile.js') &&
    index.indexOf('./notion-learning-profile.js') < index.indexOf('./daily-selection.js') &&
    index.indexOf('./app-v2.js') < index.indexOf('./quiz-simplification.js') &&
    index.indexOf('./quiz-simplification.js') < index.indexOf('./instant-choice-grading-ui.js') &&
    index.indexOf('./instant-choice-grading-ui.js') < index.indexOf('./concept-link-fix.js') &&
    index.indexOf('./concept-link-fix.js') < index.indexOf('./app-update.js') &&
    index.indexOf('./app-update.js') < index.indexOf('./app-events.js'),
  '문제풀이 단순화, Notion 학습 프로필, 화면 보정, 개념 연결 또는 업데이트 파일의 로딩 순서가 올바르지 않습니다.'
);

assert.ok(
  serviceWorker.includes("bigdata-study-v13") &&
    serviceWorker.includes('./iphone-quiz-layout.css') &&
    serviceWorker.includes('./notion-learning-profile.js') &&
    serviceWorker.includes('./hypothesis-pvalue-patch.js') &&
    serviceWorker.includes('./quiz-simplification.js') &&
    serviceWorker.includes('./instant-choice-grading-ui.js') &&
    serviceWorker.includes('./concept-link-fix.js') &&
    serviceWorker.includes('./app-update.js') &&
    serviceWorker.includes("event.data?.type === 'SKIP_WAITING'"),
  'PWA 캐시에 최신 학습 프로필·문제풀이·화면·개념·업데이트 파일이 포함되지 않았습니다.'
);

console.log('즉시 채점, 다음 버튼 이동, 불필요한 풀이 메타 제거, p값 개념, Notion 학습 프로필, 현재 문항 개념 연결, iPhone 화면 배치, 앱 내부 업데이트 검사를 통과했습니다.');
