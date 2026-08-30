'use strict';

const DATA = window.STUDY_DATA;
if (!DATA) {
  document.getElementById('app').textContent = '학습 데이터를 불러오지 못했습니다.';
  throw new Error('학습 데이터를 불러오지 못했습니다.');
}

const STORAGE_KEY = 'bigdata-study-state-v1';
const STATE_VERSION = 1;
const EXAM_AT = new Date('2026-09-05T10:00:00+09:00');
const app = document.getElementById('app');
const toastEl = document.getElementById('toast');
const importInput = document.getElementById('backup-import');
const numberMarks = ['①', '②', '③', '④'];

let state = loadState();
let view = { name: 'home', conceptId: null, conceptReturn: 'home' };
let toastTimer = null;

function freshState() {
  const now = new Date().toISOString();
  return {
    version: STATE_VERSION,
    createdAt: now,
    updatedAt: now,
    activeSession: null,
    attempts: [],
    conceptReviews: {},
    completedSessions: [],
    lastSummary: null,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STATE_VERSION || !Array.isArray(parsed.attempts)) {
      return freshState();
    }
    return { ...freshState(), ...parsed };
  } catch (error) {
    console.error(error);
    return freshState();
  }
}

function saveState() {
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function dDayText() {
  const now = new Date();
  const seoulToday = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const examLocal = new Date(EXAM_AT.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const start = new Date(seoulToday.getFullYear(), seoulToday.getMonth(), seoulToday.getDate());
  const end = new Date(examLocal.getFullYear(), examLocal.getMonth(), examLocal.getDate());
  const days = Math.ceil((end - start) / 86400000);
  if (days > 0) return `D-${days}`;
  if (days === 0) return 'D-DAY';
  return `D+${Math.abs(days)}`;
}

function latestAttemptByQuestion() {
  const map = new Map();
  for (const attempt of state.attempts) map.set(attempt.questionId, attempt);
  return map;
}

function aggregateProgress() {
  const latest = latestAttemptByQuestion();
  let correct = 0;
  let wrong = 0;
  let unknown = 0;
  for (const attempt of latest.values()) {
    if (attempt.status === 'correct') correct += 1;
    else if (attempt.status === 'wrong') wrong += 1;
    else if (attempt.status === 'unknown') unknown += 1;
  }
  return { answered: latest.size, correct, wrong, unknown };
}

function subjectProgress(subject) {
  const ids = DATA.QUESTIONS.filter((q) => q.subject === subject).map((q) => q.id);
  const latest = latestAttemptByQuestion();
  const attempts = ids.map((id) => latest.get(id)).filter(Boolean);
  return {
    total: ids.length,
    answered: attempts.length,
    correct: attempts.filter((a) => a.status === 'correct').length,
  };
}

function weakConcepts(limit = 5) {
  const latest = latestAttemptByQuestion();
  const score = new Map();
  for (const [questionId, attempt] of latest.entries()) {
    if (attempt.status === 'correct' && attempt.confidence !== 'uncertain') continue;
    const question = DATA.QUESTIONS.find((q) => q.id === questionId);
    if (!question) continue;
    const points = attempt.status === 'correct' ? 1 : 2;
    const item = score.get(question.conceptId) || { conceptId: question.conceptId, points: 0, count: 0 };
    item.points += points;
    item.count += 1;
    score.set(question.conceptId, item);
  }
  return [...score.values()]
    .sort((a, b) => b.points - a.points || b.count - a.count)
    .slice(0, limit);
}

function currentQuestion() {
  const session = state.activeSession;
  if (!session) return null;
  const id = session.questionIds[session.index];
  return DATA.QUESTIONS.find((q) => q.id === id) || null;
}

function currentAttempt() {
  const session = state.activeSession;
  const question = currentQuestion();
  if (!session || !question) return null;
  for (let i = state.attempts.length - 1; i >= 0; i -= 1) {
    const attempt = state.attempts[i];
    if (attempt.sessionId === session.id && attempt.questionId === question.id) return attempt;
  }
  return null;
}

function sessionProgressIndex(session = state.activeSession) {
  if (!session) return 0;
  return Math.min(session.index + 1, session.questionIds.length);
}

function pauseTimer() {
  const session = state.activeSession;
  if (!session || !session.questionStartedAt) return;
  const elapsed = Math.max(0, Math.round((Date.now() - session.questionStartedAt) / 1000));
  session.elapsedDraftSec = (session.elapsedDraftSec || 0) + Math.min(elapsed, 3600);
  session.questionStartedAt = null;
  saveState();
}

function resumeTimer() {
  const session = state.activeSession;
  if (!session || currentAttempt()) return;
  if (!session.questionStartedAt) {
    session.questionStartedAt = Date.now();
    saveState();
  }
}

function startSession(questionIds, mode, label) {
  if (!questionIds.length) {
    showToast('지금 다시 풀 문항이 없습니다.');
    return;
  }
  const id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  state.activeSession = {
    id,
    mode,
    label,
    questionIds,
    index: 0,
    startedAt: new Date().toISOString(),
    questionStartedAt: Date.now(),
    elapsedDraftSec: 0,
    draft: { answer: null, confidence: null },
    dismissedPrompts: {},
    conceptReview: null,
  };
  saveState();
  view.name = 'quiz';
  render();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function resumeSession() {
  if (!state.activeSession) return;
  view.name = 'quiz';
  resumeTimer();
  render();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function questionIdsForWeakReview() {
  const latest = latestAttemptByQuestion();
  return DATA.QUESTIONS
    .filter((q) => {
      const a = latest.get(q.id);
      return a && (a.status !== 'correct' || a.confidence === 'uncertain');
    })
    .map((q) => q.id);
}

function questionIdsForConcept(conceptId) {
  return DATA.QUESTIONS.filter((q) => q.conceptId === conceptId).map((q) => q.id);
}

function normalizedShort(value) {
  return String(value ?? '').trim().replaceAll(' ', '').replaceAll(',', '.').toLowerCase();
}

function isShortAnswerCorrect(question, value) {
  const normalized = normalizedShort(value);
  if (!normalized) return false;
  if ((question.accepted || []).some((answer) => normalizedShort(answer) === normalized)) return true;
  const numeric = Number(normalized);
  if (Number.isFinite(numeric) && Math.abs(numeric - 35 / 12) < 0.001) return true;
  return false;
}

function answerCurrent(unknown = false) {
  const session = state.activeSession;
  const question = currentQuestion();
  if (!session || !question || currentAttempt()) return;
  const draft = session.draft || {};
  if (!unknown && (draft.answer === null || draft.answer === undefined || String(draft.answer).trim() === '')) {
    showToast('답을 고르거나 ‘모르겠음’을 눌러 주세요.');
    return;
  }
  const activeElapsed = session.questionStartedAt
    ? Math.max(0, Math.round((Date.now() - session.questionStartedAt) / 1000))
    : 0;
  const elapsedSec = Math.min(3600, (session.elapsedDraftSec || 0) + activeElapsed);
  let isCorrect = false;
  if (!unknown) {
    isCorrect = question.type === 'short'
      ? isShortAnswerCorrect(question, draft.answer)
      : Number(draft.answer) === Number(question.answer);
  }
  const attempt = {
    id: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sessionId: session.id,
    questionId: question.id,
    conceptId: question.conceptId,
    answer: unknown ? null : draft.answer,
    status: unknown ? 'unknown' : isCorrect ? 'correct' : 'wrong',
    confidence: unknown ? 'unknown' : draft.confidence || 'unmarked',
    explanationSeen: false,
    note: '',
    elapsedSec,
    answeredAt: new Date().toISOString(),
  };
  state.attempts.push(attempt);
  session.questionStartedAt = null;
  session.elapsedDraftSec = 0;
  session.draft = { answer: null, confidence: null };
  saveState();
  render();
}

function markExplanationSeen() {
  const attempt = currentAttempt();
  if (!attempt) return;
  attempt.explanationSeen = true;
  saveState();
  render();
}

function recommendationForCurrent() {
  const session = state.activeSession;
  const question = currentQuestion();
  const attempt = currentAttempt();
  if (!session || !question || !attempt || !attempt.explanationSeen) return null;
  const key = `${session.index}:${question.conceptId}`;
  if (session.dismissedPrompts?.[key]) return null;

  const sessionAttempts = state.attempts.filter((a) => a.sessionId === session.id);
  const recent = sessionAttempts.slice(-5);
  const recentWeak = recent.filter((a) => a.status !== 'correct').length;
  const review = state.conceptReviews[question.conceptId];
  const reviewTime = review?.lastReviewedAt ? new Date(review.lastReviewedAt).getTime() : 0;
  const sameConceptWeak = state.attempts.filter((a) =>
    a.conceptId === question.conceptId &&
    a.status !== 'correct' &&
    new Date(a.answeredAt).getTime() > reviewTime
  ).length;

  if (sameConceptWeak >= 2) {
    return {
      conceptId: question.conceptId,
      reason: `같은 개념에서 오답 또는 ‘모르겠음’이 ${sameConceptWeak}회 누적되었습니다. 지금은 문제 수를 늘리기보다 판단 기준을 다시 잡는 편이 효율적입니다.`,
    };
  }
  if (recent.length >= 5 && recentWeak >= 3) {
    const counts = new Map();
    for (const item of recent.filter((a) => a.status !== 'correct')) {
      counts.set(item.conceptId, (counts.get(item.conceptId) || 0) + 1);
    }
    const conceptId = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || question.conceptId;
    return {
      conceptId,
      reason: `최근 5문항 중 ${recentWeak}문항에서 정답 근거가 잡히지 않았습니다. 계속 밀어붙이기보다 가장 많이 막힌 개념을 한 번 정리할 시점입니다.`,
    };
  }
  return null;
}

function nextQuestion(skipRecommendation = false) {
  const session = state.activeSession;
  const attempt = currentAttempt();
  if (!session || !attempt || !attempt.explanationSeen) {
    showToast('해설을 확인한 뒤 다음 문항으로 이동할 수 있습니다.');
    return;
  }
  const recommendation = recommendationForCurrent();
  if (recommendation && !skipRecommendation) {
    openConcept(recommendation.conceptId, { type: 'quiz', advanceAfter: true });
    return;
  }
  session.index += 1;
  session.draft = { answer: null, confidence: null };
  session.elapsedDraftSec = 0;
  session.questionStartedAt = Date.now();
  if (session.index >= session.questionIds.length) {
    completeSession();
    return;
  }
  saveState();
  render();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function completeSession() {
  const session = state.activeSession;
  if (!session) return;
  const attempts = state.attempts.filter((a) => a.sessionId === session.id);
  const summary = {
    id: session.id,
    label: session.label,
    total: session.questionIds.length,
    correct: attempts.filter((a) => a.status === 'correct').length,
    wrong: attempts.filter((a) => a.status === 'wrong').length,
    unknown: attempts.filter((a) => a.status === 'unknown').length,
    completedAt: new Date().toISOString(),
  };
  state.completedSessions.push(summary);
  state.lastSummary = summary;
  state.activeSession = null;
  saveState();
  view.name = 'summary';
  render();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function dismissRecommendation() {
  const session = state.activeSession;
  const question = currentQuestion();
  if (!session || !question) return;
  session.dismissedPrompts ||= {};
  session.dismissedPrompts[`${session.index}:${question.conceptId}`] = true;
  saveState();
  nextQuestion(true);
}

function openConcept(conceptId, returnInfo = 'home') {
  if (!DATA.CONCEPTS[conceptId]) return;
  if (typeof returnInfo === 'object' && state.activeSession) {
    state.activeSession.conceptReview = {
      conceptId,
      fromIndex: state.activeSession.index,
      advanceAfter: Boolean(returnInfo.advanceAfter),
      stopAfter: Boolean(returnInfo.stopAfter),
    };
    saveState();
  } else {
    view.conceptId = conceptId;
    view.conceptReturn = returnInfo;
  }
  view.name = 'concept';
  render();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function completeConceptReview() {
  const session = state.activeSession;
  const inSession = session?.conceptReview;
  const conceptId = inSession?.conceptId || view.conceptId;
  if (!conceptId) return;
  const current = state.conceptReviews[conceptId] || { count: 0 };
  state.conceptReviews[conceptId] = {
    count: current.count + 1,
    lastReviewedAt: new Date().toISOString(),
  };

  if (inSession) {
    const { advanceAfter, stopAfter } = inSession;
    session.conceptReview = null;
    saveState();
    if (stopAfter) {
      view.name = 'home';
      render();
      return;
    }
    view.name = 'quiz';
    if (advanceAfter) nextQuestion(true);
    else render();
    return;
  }
  saveState();
  view.name = view.conceptReturn === 'library' ? 'concept-library' : 'home';
  render();
}

function saveAndStop() {
  pauseTimer();
  view.name = 'home';
  view.showStopModal = false;
  render();
}

function exportBackup() {
  pauseTimer();
  const payload = {
    app: '빅분기 공부',
    exportedAt: new Date().toISOString(),
    state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `빅분기-학습기록-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  showToast('학습 기록 파일을 만들었습니다.');
}

async function importBackup(file) {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const imported = parsed.state || parsed;
    if (!imported || imported.version !== STATE_VERSION || !Array.isArray(imported.attempts)) {
      throw new Error('지원하지 않는 기록 형식입니다.');
    }
    state = { ...freshState(), ...imported };
    saveState();
    view = { name: 'home', conceptId: null, conceptReturn: 'home' };
    render();
    showToast('학습 기록을 불러왔습니다.');
  } catch (error) {
    console.error(error);
    showToast('학습 기록을 불러오지 못했습니다.');
  } finally {
    importInput.value = '';
  }
}

function resetProgress() {
  const confirmed = window.confirm('모든 답안, 오답, 메모, 이어풀기 위치를 삭제할까요? 이 작업은 되돌릴 수 없습니다.');
  if (!confirmed) return;
  state = freshState();
  saveState();
  view = { name: 'home', conceptId: null, conceptReturn: 'home' };
  render();
  showToast('학습 기록을 초기화했습니다.');
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 60) return `${Math.max(0, seconds || 0)}초`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}분 ${sec}초`;
}

function answerDisplay(question, attempt) {
  if (attempt.status === 'unknown') return '모르겠음';
  if (question.type === 'short') return esc(attempt.answer);
  const index = Number(attempt.answer);
  return `${numberMarks[index] || ''} ${esc(question.choices[index] || '')}`;
}

function correctAnswerDisplay(question) {
  if (question.type === 'short') return esc(question.answer);
  return `${numberMarks[question.answer]} ${esc(question.choices[question.answer])}`;
}

function renderHeader(title, leftAction = 'home', rightAction = null) {
  return `
    <header class="topbar">
      <button class="icon-button" data-action="${esc(leftAction)}" aria-label="뒤로 가기">‹</button>
      <h1>${esc(title)}</h1>
      ${rightAction ? `<button class="icon-button" data-action="${esc(rightAction)}" aria-label="메뉴">⋯</button>` : '<span></span>'}
    </header>
  `;
}
