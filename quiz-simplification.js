(() => {
  const weakByStatus = (attempt) => Boolean(attempt && attempt.status !== 'correct');

  pauseTimer = function pauseTimerDisabled() {};
  resumeTimer = function resumeTimerDisabled() {};

  startSession = function startSessionWithoutMeta(questionIds, mode, label) {
    if (!questionIds.length) {
      showToast('지금 다시 풀 문항이 없습니다.');
      return;
    }

    state.activeSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      mode,
      label,
      questionIds,
      index: 0,
      startedAt: new Date().toISOString(),
      draft: { answer: null },
      dismissedPrompts: {},
      conceptReview: null,
    };
    saveState();
    view.name = 'quiz';
    render();
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  resumeSession = function resumeSessionWithoutTimer() {
    if (!state.activeSession) return;
    view.name = 'quiz';
    render();
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  answerCurrent = function answerCurrentWithoutMeta(unknown = false) {
    const session = state.activeSession;
    const question = currentQuestion();
    if (!session || !question || currentAttempt()) return;

    const draft = session.draft || {};
    if (!unknown && (draft.answer === null || draft.answer === undefined || String(draft.answer).trim() === '')) {
      showToast('답을 고르거나 ‘모르겠음’을 눌러 주세요.');
      return;
    }

    const isCorrect = !unknown && (question.type === 'short'
      ? isShortAnswerCorrect(question, draft.answer)
      : Number(draft.answer) === Number(question.answer));

    state.attempts.push({
      id: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sessionId: session.id,
      questionId: question.id,
      conceptId: question.conceptId,
      answer: unknown ? null : draft.answer,
      status: unknown ? 'unknown' : isCorrect ? 'correct' : 'wrong',
      explanationSeen: true,
      answeredAt: new Date().toISOString(),
    });

    delete session.questionStartedAt;
    delete session.elapsedDraftSec;
    session.draft = { answer: null };
    saveState();
    render();
  };

  weakConcepts = function weakConceptsWithoutConfidence(limit = 5) {
    const latest = latestAttemptByQuestion();
    const score = new Map();

    for (const [questionId, attempt] of latest.entries()) {
      if (!weakByStatus(attempt)) continue;
      const question = DATA.QUESTIONS.find((item) => item.id === questionId);
      if (!question) continue;
      const points = attempt.status === 'unknown' ? 3 : 2;
      const item = score.get(question.conceptId) || { conceptId: question.conceptId, points: 0, count: 0 };
      item.points += points;
      item.count += 1;
      score.set(question.conceptId, item);
    }

    return [...score.values()]
      .sort((a, b) => b.points - a.points || b.count - a.count)
      .slice(0, limit);
  };

  questionIdsForWeakReview = function questionIdsForWeakReviewWithoutConfidence() {
    const latest = latestAttemptByQuestion();
    return DATA.QUESTIONS
      .filter((question) => weakByStatus(latest.get(question.id)))
      .map((question) => question.id);
  };

  recommendationForCurrent = function recommendationWithoutConfidence() {
    const session = state.activeSession;
    const question = currentQuestion();
    const attempt = currentAttempt();
    if (!session || !question || !attempt) return null;

    const sessionAttempts = state.attempts.filter((item) => item.sessionId === session.id);
    const recent = sessionAttempts.slice(-5);
    const recentWeak = recent.filter(weakByStatus).length;
    const review = state.conceptReviews[question.conceptId];
    const reviewTime = review?.lastReviewedAt ? new Date(review.lastReviewedAt).getTime() : 0;
    const sameConceptWeak = state.attempts.filter((item) =>
      item.conceptId === question.conceptId &&
      weakByStatus(item) &&
      new Date(item.answeredAt).getTime() > reviewTime
    ).length;

    if (sameConceptWeak >= 2) {
      return {
        conceptId: question.conceptId,
        reason: `같은 개념에서 오답 또는 ‘모르겠음’이 ${sameConceptWeak}회 누적되었습니다. 문제 수를 늘리기보다 판단 기준을 다시 잡는 편이 효율적입니다.`,
      };
    }

    if (recent.length >= 5 && recentWeak >= 3) {
      const counts = new Map();
      for (const item of recent.filter(weakByStatus)) {
        counts.set(item.conceptId, (counts.get(item.conceptId) || 0) + 1);
      }
      const conceptId = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || question.conceptId;
      return {
        conceptId,
        reason: `최근 5문항 중 ${recentWeak}문항이 오답 또는 ‘모르겠음’이었습니다. 가장 많이 막힌 개념을 확인할 시점입니다.`,
      };
    }

    return null;
  };

  nextQuestion = function nextQuestionWithoutTimer() {
    const session = state.activeSession;
    if (!session || !currentAttempt()) {
      showToast('정답을 확인한 뒤 다음 문항으로 이동할 수 있습니다.');
      return;
    }

    session.index += 1;
    session.draft = { answer: null };
    delete session.questionStartedAt;
    delete session.elapsedDraftSec;

    if (session.index >= session.questionIds.length) {
      completeSession();
      return;
    }

    saveState();
    render();
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const originalRenderQuiz = renderQuiz;
  renderQuiz = function renderQuizWithoutMetaUi() {
    originalRenderQuiz();

    app.querySelector('.confidence')?.remove();
    app.querySelector('.reason-box')?.remove();

    for (const caption of app.querySelectorAll('.section-caption')) {
      if (caption.textContent.includes('사용한 시간')) caption.remove();
    }
  };

  const originalRenderHome = renderHome;
  renderHome = function renderHomeWithoutConfidenceCopy() {
    originalRenderHome();
    const walker = document.createTreeWalker(app, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      node.nodeValue = node.nodeValue
        .replaceAll('오답·헷갈림', '오답·모르겠음')
        .replaceAll('오답과 불확실한 정답', '오답과 모르겠음')
        .replaceAll('오답 또는 불확실한 정답', '오답 또는 모르겠음');
    }
  };

  window.BIGDATA_QUIZ_SIMPLIFICATION = Object.freeze({
    enabled: true,
    removes: ['elapsed-time', 'confidence', 'reason-note'],
  });
})();