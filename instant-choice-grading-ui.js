(() => {
  const originalRenderQuiz = renderQuiz;

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

    if (actions) actions.style.gridTemplateColumns = '1fr';
    const unknownButton = actions?.querySelector('[data-action="unknown"]');
    if (unknownButton) unknownButton.classList.add('full-button');
  };

  window.INSTANT_CHOICE_GRADING = Object.freeze({ enabled: true });
})();
