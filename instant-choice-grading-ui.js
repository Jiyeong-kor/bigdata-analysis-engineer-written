(() => {
  const originalRenderQuiz = renderQuiz;
  const originalStartSession = startSession;
  const originalResumeSession = resumeSession;
  const originalNextQuestion = nextQuestion;
  const originalAnswerCurrent = answerCurrent;

  function positionQuestionAtReadingStart() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const questionCard = app.querySelector('.question-card');
        if (!questionCard) return;

        const topbar = app.querySelector('.topbar');
        const topbarBottom = topbar?.getBoundingClientRect().bottom || 0;
        const cardTop = questionCard.getBoundingClientRect().top;
        const targetTop = window.scrollY + cardTop - topbarBottom - 8;

        window.scrollTo({
          top: Math.max(0, Math.round(targetTop)),
          behavior: 'auto'
        });
      });
    });
  }

  function positionNextActionForTap() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const nextButton = app.querySelector('[data-action="next-question"]');
        if (!nextButton) return;

        const topbar = app.querySelector('.topbar');
        const stickyActions = app.querySelector('.sticky-actions');
        const viewportTop = (topbar?.getBoundingClientRect().bottom || 0) + 10;
        const stickyTop = stickyActions?.getBoundingClientRect().top || window.innerHeight;
        const viewportBottom = Math.min(window.innerHeight, stickyTop) - 10;
        const buttonRect = nextButton.getBoundingClientRect();

        if (buttonRect.top >= viewportTop && buttonRect.bottom <= viewportBottom) return;

        const delta = buttonRect.bottom > viewportBottom
          ? buttonRect.bottom - viewportBottom
          : buttonRect.top - viewportTop;

        window.scrollBy({
          top: Math.round(delta),
          behavior: 'auto'
        });
      });
    });
  }

  renderQuiz = function renderQuizWithInstantChoiceGrading() {
    originalRenderQuiz();

    const question = currentQuestion();
    if (!question || currentAttempt() || question.type === 'short') return;

    const choices = app.querySelector('.choices');
    const confidence = app.querySelector('.confidence');
    if (choices && confidence && choices.parentElement === confidence.parentElement) {
      choices.parentElement.insertBefore(confidence, choices);
      const label = confidence.querySelector('.confidence-label');
      if (label) {
        label.textContent = '필요하면 확신 정도를 먼저 표시하세요. 선지를 누르면 바로 채점됩니다.';
      }
    }

    const actions = app.querySelector('.quiz-actions');
    const checkButton = actions?.querySelector('[data-action="check-answer"]');
    if (checkButton) checkButton.remove();

    if (actions) actions.classList.add('quiz-actions-single');
    const unknownButton = actions?.querySelector('[data-action="unknown"]');
    if (unknownButton) unknownButton.classList.add('full-button');
  };

  answerCurrent = function answerCurrentAndRevealNextAction(...args) {
    const question = currentQuestion();
    const hadAttempt = Boolean(currentAttempt());

    originalAnswerCurrent(...args);

    const hasNewAttempt = !hadAttempt && Boolean(currentAttempt());
    if (question?.type !== 'short' && hasNewAttempt && view.name === 'quiz') {
      positionNextActionForTap();
    }
  };

  startSession = function startSessionAndPositionQuestion(...args) {
    originalStartSession(...args);
    if (state.activeSession && view.name === 'quiz') positionQuestionAtReadingStart();
  };

  resumeSession = function resumeSessionAndPositionQuestion(...args) {
    originalResumeSession(...args);
    if (state.activeSession && view.name === 'quiz') positionQuestionAtReadingStart();
  };

  nextQuestion = function nextQuestionAndPositionQuestion(...args) {
    const previousSessionId = state.activeSession?.id;
    const previousIndex = state.activeSession?.index;

    originalNextQuestion(...args);

    const session = state.activeSession;
    const movedToNewQuestion = session && (
      session.id !== previousSessionId || session.index !== previousIndex
    );

    if (movedToNewQuestion && view.name === 'quiz') positionQuestionAtReadingStart();
  };

  window.INSTANT_CHOICE_GRADING = Object.freeze({
    enabled: true,
    positionQuestionAtReadingStart,
    positionNextActionForTap
  });
})();
