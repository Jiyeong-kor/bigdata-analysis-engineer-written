(() => {
  const originalRenderQuiz = renderQuiz;

  renderQuiz = function renderQuizWithCurrentConceptLink() {
    originalRenderQuiz();

    const question = currentQuestion();
    const attempt = currentAttempt();
    if (!question || !attempt) return;

    const currentConcept = DATA.CONCEPTS[question.conceptId];
    const currentButton = app.querySelector('.answer-actions-v2 [data-action="review-current-concept"]');

    if (currentButton) {
      currentButton.dataset.concept = question.conceptId;
      currentButton.textContent = currentConcept
        ? `현재 문제 개념 보기 · ${currentConcept.title}`
        : '현재 문제 개념 보기';
    }

    const recommendation = recommendationForCurrent();
    if (!recommendation || recommendation.conceptId === question.conceptId) return;

    const recommendedConcept = DATA.CONCEPTS[recommendation.conceptId];
    const nudge = app.querySelector('.study-nudge-v2');
    if (!nudge || !recommendedConcept) return;

    const recommendedButton = document.createElement('button');
    recommendedButton.type = 'button';
    recommendedButton.className = 'secondary-button full-button';
    recommendedButton.dataset.action = 'review-current-concept';
    recommendedButton.dataset.concept = recommendation.conceptId;
    recommendedButton.style.marginTop = '10px';
    recommendedButton.textContent = `별도 추천 · ${recommendedConcept.title}`;
    nudge.appendChild(recommendedButton);
  };

  window.CONCEPT_LINK_FIX = Object.freeze({ enabled: true });
})();
