import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const index = read('./index.html');
const events = read('./app-events.js');
const instantUi = read('./instant-choice-grading-ui.js');
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
  index.includes('./iphone-quiz-layout.css') &&
    index.indexOf('./app-v2.js') < index.indexOf('./instant-choice-grading-ui.js'),
  '화면 보정 파일의 로딩 순서가 올바르지 않습니다.'
);

assert.ok(
  serviceWorker.includes("bigdata-study-v7") &&
    serviceWorker.includes('./iphone-quiz-layout.css') &&
    serviceWorker.includes('./instant-choice-grading-ui.js'),
  'PWA 캐시에 최신 화면 보정 파일이 포함되지 않았습니다.'
);

console.log('객관식 즉시 채점, iPhone safe area, 새 문항 위치 검사를 통과했습니다.');
