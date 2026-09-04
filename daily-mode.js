(() => {
  const DAILY_CRITERIA_VERSION = 3;

  function seoulDateKey() {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }

  function validDailySet(entry) {
    if (!entry || entry.criteriaVersion !== DAILY_CRITERIA_VERSION) return false;
    if (!Array.isArray(entry.ids) || entry.ids.length !== 8) return false;
    const knownIds = new Set(DATA.QUESTIONS.map((question) => question.id));
    return entry.ids.every((id) => knownIds.has(id));
  }

  function pruneDailySets() {
    state.dailySets ||= {};
    const keys = Object.keys(state.dailySets).sort().reverse();
    for (const oldKey of keys.slice(21)) delete state.dailySets[oldKey];
  }

  function getOrCreateDailyIds() {
    const key = seoulDateKey();
    state.dailySets ||= {};
    const existing = state.dailySets[key];
    if (validDailySet(existing)) return [...existing.ids];

    const ids = DAILY_SELECTION.selectDailyQuestionIds({
      questions: DATA.QUESTIONS,
      attempts: state.attempts,
      seed: key,
    });

    state.dailySets[key] = {
      ids,
      criteriaVersion: DAILY_CRITERIA_VERSION,
      createdAt: new Date().toISOString(),
    };
    pruneDailySets();
    saveState();
    return [...ids];
  }

  function existingDailyInfo() {
    const key = seoulDateKey();
    const entry = state.dailySets?.[key];
    if (!validDailySet(entry)) return null;
    return DAILY_SELECTION.describeDailySet({
      ids: entry.ids,
      questions: DATA.QUESTIONS,
      attempts: state.attempts,
    });
  }

  STUDY_V2.getOrCreateDailyIds = getOrCreateDailyIds;
  STUDY_V2.seoulDateKey = seoulDateKey;

  const baseRenderHome = renderHome;
  renderHome = function renderHomeWithDailyEight() {
    baseRenderHome();

    const mixedButton = app.querySelector('[data-action="start-mixed"]');
    const mixedSection = mixedButton?.closest('.compact-section');
    const page = app.querySelector('.page-v2');
    if (!page || !mixedSection) return;

    const info = existingDailyInfo();
    const section = document.createElement('section');
    section.className = 'compact-section';
    const focusCopy = info?.profilePriority ? ` · 집중 복습 ${info.profilePriority}개` : '';
    section.innerHTML = `
      <div class="section-head">
        <div>
          <h2>오늘의 8문제</h2>
          <p class="section-caption">앱 기록과 정리 기록 중 더 최근에 갱신된 학습 상태를 기준으로 출제합니다.</p>
        </div>
      </div>
      <div class="daily-card-v2">
        <div class="daily-card-main">
          <strong>과목별 2문제</strong>
          <p>${info
            ? `처음 푸는 문제 ${info.unseen}개 · 다시 볼 문제 ${info.weak}개${focusCopy}`
            : '오늘 풀 문제를 바로 시작합니다.'}</p>
        </div>
        <button class="primary-button" data-action="start-daily">풀기</button>
      </div>`;

    page.insertBefore(section, mixedSection);
  };

  app.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="start-daily"]');
    if (!button || button.disabled) return;
    event.stopImmediatePropagation();

    const ids = getOrCreateDailyIds();
    const key = seoulDateKey();
    startSession(ids, `daily-${key}`, '오늘의 8문제');
    if (state.activeSession) {
      state.activeSession.dailyKey = key;
      saveState();
    }
  });
})();
