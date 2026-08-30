app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;

  if (action === 'home') {
    pauseTimer();
    view.name = 'home';
    view.showStopModal = false;
    render();
  } else if (action === 'resume') {
    resumeSession();
  } else if (action === 'start-all') {
    startSession(DATA.QUESTIONS.map((q) => q.id), 'all', '제12회 기출복원 80문항');
  } else if (action === 'start-unanswered') {
    const latest = latestAttemptByQuestion();
    startSession(DATA.QUESTIONS.filter((q) => !latest.has(q.id)).map((q) => q.id), 'unanswered', '아직 안 푼 문항');
  } else if (action === 'start-weak') {
    startSession(questionIdsForWeakReview(), 'weak', '오답·모르겠음 다시 풀기');
  } else if (action === 'start-subject') {
    const subject = Number(button.dataset.subject);
    startSession(DATA.QUESTIONS.filter((q) => q.subject === subject).map((q) => q.id), `subject-${subject}`, `${subject}과목 ${DATA.SUBJECTS[subject].name}`);
  } else if (action === 'select-answer') {
    if (!state.activeSession || currentAttempt()) return;
    state.activeSession.draft ||= { answer: null, confidence: null };
    state.activeSession.draft.answer = Number(button.dataset.answer);
    saveState();
    render();
  } else if (action === 'confidence') {
    if (!state.activeSession || currentAttempt()) return;
    state.activeSession.draft ||= { answer: null, confidence: null };
    const next = button.dataset.confidence;
    state.activeSession.draft.confidence = state.activeSession.draft.confidence === next ? null : next;
    saveState();
    render();
  } else if (action === 'check-answer') {
    answerCurrent(false);
  } else if (action === 'unknown') {
    answerCurrent(true);
  } else if (action === 'explanation-seen') {
    markExplanationSeen();
  } else if (action === 'next-question') {
    nextQuestion(false);
  } else if (action === 'review-current-concept' || action === 'review-recommended') {
    openConcept(button.dataset.concept, { type: 'quiz', advanceAfter: action === 'review-recommended' });
  } else if (action === 'dismiss-recommendation') {
    dismissRecommendation();
  } else if (action === 'open-concept') {
    openConcept(button.dataset.concept, 'home');
  } else if (action === 'open-concept-library') {
    openConcept(button.dataset.concept, 'library');
  } else if (action === 'concept-library') {
    view.name = 'concept-library';
    render();
    window.scrollTo({ top: 0, behavior: 'auto' });
  } else if (action === 'concept-back-quiz') {
    if (state.activeSession) state.activeSession.conceptReview = null;
    saveState();
    view.name = 'quiz';
    render();
  } else if (action === 'concept-done') {
    completeConceptReview();
  } else if (action === 'start-concept-questions') {
    const conceptId = button.dataset.concept;
    startSession(questionIdsForConcept(conceptId), `concept-${conceptId}`, `${DATA.CONCEPTS[conceptId].title} 관련 기출`);
  } else if (action === 'show-mini-answer') {
    const answer = document.getElementById('mini-answer');
    if (answer) {
      answer.hidden = !answer.hidden;
      button.textContent = answer.hidden ? '정답 보기' : '정답 가리기';
    }
  } else if (action === 'open-stop') {
    view.showStopModal = true;
    pauseTimer();
    render();
  } else if (action === 'stop-cancel') {
    view.showStopModal = false;
    resumeTimer();
    render();
  } else if (action === 'stop-home') {
    saveAndStop();
  } else if (action === 'stop-concept') {
    view.showStopModal = false;
    openConcept(button.dataset.concept, { type: 'quiz', stopAfter: true });
  } else if (action === 'export') {
    exportBackup();
  } else if (action === 'import') {
    importInput.click();
  } else if (action === 'reset') {
    resetProgress();
  }
});

app.addEventListener('input', (event) => {
  if (event.target.id === 'short-answer' && state.activeSession && !currentAttempt()) {
    state.activeSession.draft ||= { answer: null, confidence: null };
    state.activeSession.draft.answer = event.target.value;
    saveState();
  }
  if (event.target.id === 'reason-note') {
    const attempt = currentAttempt();
    if (attempt) {
      attempt.note = event.target.value;
      saveState();
    }
  }
});

importInput.addEventListener('change', () => {
  const file = importInput.files?.[0];
  if (file) importBackup(file);
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') pauseTimer();
  else resumeTimer();
});
window.addEventListener('pagehide', pauseTimer);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => console.error('서비스 워커 등록 실패', error));
  });
}

if (state.activeSession?.conceptReview) view.name = 'concept';
render();
resumeTimer();
