app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;

  if (action === 'start-mixed') {
    event.stopImmediatePropagation();
    startSession(STUDY_V2.mixedQuestionIds(40), 'mixed', '통합 실전 40문항');
    return;
  }

  if (action === 'start-bank') {
    event.stopImmediatePropagation();
    const bank = button.dataset.bank;
    const config = STUDY_V2.BANKS[bank];
    const ids = STUDY_V2.questionsForBank(bank)
      .sort((a, b) => a.id - b.id)
      .map((question) => question.id);
    startSession(ids, `bank-${bank}`, config?.title || '문제 묶음');
    return;
  }

  if (action === 'start-complete') {
    event.stopImmediatePropagation();
    const ids = [...DATA.QUESTIONS].sort((a, b) => a.id - b.id).map((question) => question.id);
    startSession(ids, 'complete', `전체 ${ids.length}문항`);
    return;
  }

  if (action === 'start-concept-questions') {
    event.stopImmediatePropagation();
    const conceptId = button.dataset.concept;
    startSession(questionIdsForConcept(conceptId), `concept-${conceptId}`, `${DATA.CONCEPTS[conceptId].title} 관련 문제`);
  }
});
