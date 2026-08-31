import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const index = read('./index.html');
const events = read('./app-events.js');
const instantUi = read('./instant-choice-grading-ui.js');
const appUpdate = read('./app-update.js');
const layout = read('./iphone-quiz-layout.css');
const serviceWorker = read('./sw.js');

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
  layout.includes('#app') &&
    layout.includes('padding-top: 0') &&
    layout.includes('.app-shell > .topbar + .page'),
  'iPhone safe area 중복 보정 스타일이 없습니다.'
);

assert.ok(
  appUpdate.includes('data-action="app-update"') &&
    appUpdate.includes('registration.update()') &&
    appUpdate.includes("window.location.reload()") &&
    appUpdate.includes("SKIP_WAITING"),
  '앱 내부 업데이트 확인과 자동 새로고침 처리가 없습니다.'
);

assert.ok(
  index.includes('./iphone-quiz-layout.css') &&
    index.includes('./app-update.js') &&
    index.indexOf('./app-v2.js') < index.indexOf('./instant-choice-grading-ui.js') &&
    index.indexOf('./instant-choice-grading-ui.js') < index.indexOf('./app-update.js') &&
    index.indexOf('./app-update.js') < index.indexOf('./app-events.js'),
  '화면 보정 또는 업데이트 파일의 로딩 순서가 올바르지 않습니다.'
);

assert.ok(
  serviceWorker.includes("bigdata-study-v8") &&
    serviceWorker.includes('./iphone-quiz-layout.css') &&
    serviceWorker.includes('./instant-choice-grading-ui.js') &&
    serviceWorker.includes('./app-update.js') &&
    serviceWorker.includes("event.data?.type === 'SKIP_WAITING'"),
  'PWA 캐시에 최신 화면·업데이트 파일이 포함되지 않았습니다.'
);

console.log('즉시 채점, 다음 버튼 이동, iPhone 화면 배치, 앱 내부 업데이트 검사를 통과했습니다.');
