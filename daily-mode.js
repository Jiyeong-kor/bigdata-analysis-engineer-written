(() => {
  const DAILY_CRITERIA_VERSION = 1;

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
    section.innerHTML = `
      <div class="section-head">
        <div>
          <h2>오늘의 8문제</h2>
          <p class="section-caption">매일학습 채팅의 출제 기준을 앱에 적용합니다.</p>
        </div>
      </div>
      <div class="daily-card-v2">
        <div class="daily-card-main">
          <strong>네 과목에서 2문항씩</strong>
          <p>${info
            ? `오늘 세트: 오답·불확실 ${info.weak}문항 · 미풀이 ${info.unseen}문항 · 빅분기 추가영역 ${info.bigdataSpecific}문항`
            : '오답·모르겠음·불확실한 정답을 먼저 보강하고, 자신 있게 맞힌 개념의 반복은 뒤로 미룹니다.'}</p>
        </div>
        <button class="primary-button" data-action="start-daily">${info ? '오늘 세트 풀기' : '8문제 만들기'}</button>
        <div class="daily-rule-list">
          <span>오답을 다음 세트에 반영</span>
          <span>맞힌 개념 반복 최소화</span>
          <span>빅분기 추가영역 우선</span>
          <span>정답 제출 후 해설 공개</span>
        </div>
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
