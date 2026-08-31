(() => {
  function hasExplicitAnswer(draft) {
    const answer = draft?.answer;
    return answer !== null && answer !== undefined && String(answer).trim() !== '';
  }

  const originalRenderQuiz = renderQuiz;

  renderQuiz = function renderQuizWithExplicitSelectionOnly() {
    originalRenderQuiz();

    const session = state.activeSession;
    if (!session || currentAttempt() || hasExplicitAnswer(session.draft)) return;

    app.querySelectorAll('.choice.selected').forEach((choice) => {
      choice.classList.remove('selected');
    });
  };

  window.ANSWER_SELECTION_FIX = Object.freeze({ hasExplicitAnswer });
})();
