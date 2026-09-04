(() => {
  if (!window.STUDY_V2) return;

  const BANK_ID = 'chat-review';
  STUDY_V2.BANKS[BANK_ID] = {
    label: '채팅 복습',
    title: '12회 채팅 복습 14문항',
    description: '채팅에서 실제로 막히거나 다시 확인한 12회 개념을 새 상황으로 바꾸어 묻습니다.'
  };

  if (STUDY_V2.BANKS.practice) {
    STUDY_V2.BANKS.practice.title = '교재·Notion 변형 104문항';
    STUDY_V2.BANKS.practice.description = 'Notion 개념·공식·보강 범위를 시험형 선택지로 다시 묻습니다.';
  }

  function reviewProgress() {
    const questions = STUDY_V2.questionsForBank(BANK_ID);
    const latest = latestAttemptByQuestion();
    const attempts = questions.map((question) => latest.get(question.id)).filter(Boolean);
    return {
      total: questions.length,
      answered: attempts.length,
      correct: attempts.filter((attempt) => attempt.status === 'correct').length
    };
  }

  function injectChatReviewBank() {
    const bankList = app.querySelector('.bank-list');
    if (!bankList || bankList.querySelector(`[data-bank="${BANK_ID}"]`)) return;

    const config = STUDY_V2.BANKS[BANK_ID];
    const stats = reviewProgress();
    const button = document.createElement('button');
    button.className = 'bank-card';
    button.dataset.action = 'start-bank';
    button.dataset.bank = BANK_ID;
    button.innerHTML = `
      <span><strong>${esc(config.title)}</strong><small>${esc(config.description)}</small></span>
      <span class="bank-count">${stats.answered}/${stats.total}</span>`;
    bankList.prepend(button);

    const headerCopy = app.querySelector('.compact-header-card .compact-header-row p');
    if (headerCopy) headerCopy.textContent = `전체 ${DATA.QUESTIONS.length}문항 · 기출복원, 채팅 복습, 자가진단, 교재 변형`;

    const footer = app.querySelector('.footer-note');
    if (footer) {
      footer.textContent = `Notion 핵심 교재와 제12회 기출복원, 실제 채팅 학습에서 만든 복습문제를 통합한 총 ${DATA.QUESTIONS.length}문항입니다.`;
    }
  }

  const baseRenderHome = renderHome;
  renderHome = function renderHomeWithChatReview() {
    baseRenderHome();
    injectChatReviewBank();
  };

  window.CHAT_REVIEW_UI = Object.freeze({
    bankId: BANK_ID,
    injectChatReviewBank
  });
})();
