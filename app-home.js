function renderHome() {
  const progress = aggregateProgress();
  const weak = weakConcepts(4);
  const active = state.activeSession;
  const overallPct = Math.round((progress.answered / DATA.QUESTIONS.length) * 100);
  const suggested = progress.answered === 0
    ? '개념을 먼저 외우지 말고 1번 문제부터 풀어 현재 빈칸을 드러내세요.'
    : weak.length
      ? `현재는 ‘${DATA.CONCEPTS[weak[0].conceptId].title}’에서 판단 기준을 다시 잡는 편이 가장 효율적입니다.`
      : '지금까지 푼 문항에서는 뚜렷한 취약 개념이 없습니다. 남은 문항을 이어서 진단하세요.';

  app.innerHTML = `
    <main class="app-shell">
      <div class="page">
        <section class="hero">
          <p class="hero-kicker">2026년 제13회 필기 · ${dDayText()}</p>
          <h2>문제로 진단하고,<br />막히면 개념으로 돌아갑니다.</h2>
          <p>답안과 이어풀기 위치는 이 기기에 자동 저장됩니다. 문제를 맞혀도 해설을 확인해야 다음 문항으로 넘어갑니다.</p>
          <div class="hero-grid">
            <div class="hero-stat"><strong>${progress.answered}</strong><span>푼 문항</span></div>
            <div class="hero-stat"><strong>${progress.correct}</strong><span>현재 정답</span></div>
            <div class="hero-stat"><strong>${progress.wrong + progress.unknown}</strong><span>다시 볼 문항</span></div>
          </div>
        </section>

        ${!isStandalone() ? `
          <section class="section">
            <div class="notice notice-info"><strong>아이폰에서 앱처럼 사용하기</strong><br />Safari의 공유 버튼을 누른 뒤 ‘홈 화면에 추가’를 선택하세요. 한 번 연 뒤에는 주요 화면과 문제를 오프라인에서도 사용할 수 있습니다.</div>
          </section>
        ` : ''}

        ${active ? `
          <section class="section">
            <div class="card resume-card">
              <h2 class="resume-title">멈춘 지점부터 이어서 풀기</h2>
              <p class="resume-meta">${esc(active.label)} · ${sessionProgressIndex(active)}/${active.questionIds.length}번째 문항에서 저장됨</p>
              <div class="progress-track"><div class="progress-fill" style="width:${Math.round((active.index / active.questionIds.length) * 100)}%"></div></div>
              <div style="height:12px"></div>
              <button class="primary-button full-button" data-action="resume">이어서 풀기</button>
            </div>
          </section>
        ` : ''}

        <section class="section">
          <div class="section-head">
            <div><h2>지금 시작</h2><p class="section-caption">사용자가 선호한 방식대로 문제를 먼저 제시합니다.</p></div>
          </div>
          <div class="button-stack">
            <button class="primary-button full-button" data-action="start-all">제12회 기출복원 80문항 ${progress.answered ? '새 회차로 풀기' : '시작'}</button>
            <button class="secondary-button full-button" data-action="start-unanswered" ${progress.answered >= 80 ? 'disabled' : ''}>아직 안 푼 문항만 시작</button>
            <button class="secondary-button full-button" data-action="start-weak" ${questionIdsForWeakReview().length ? '' : 'disabled'}>오답·모르겠음·헷갈림 다시 풀기</button>
          </div>
        </section>

        <section class="section">
          <div class="section-head"><div><h2>과목별 진단</h2><p class="section-caption">과목당 20문항을 원래 순서대로 풉니다.</p></div></div>
          <div class="subject-grid">
            ${Object.entries(DATA.SUBJECTS).map(([id, subject]) => {
              const p = subjectProgress(Number(id));
              return `
                <button class="subject-card" data-action="start-subject" data-subject="${id}">
                  <span class="subject-number">${id}</span>
                  <strong>${esc(subject.name)}</strong>
                  <small>${p.answered}/${p.total} 풀이 · ${p.correct} 정답</small>
                </button>`;
            }).join('')}
          </div>
        </section>

        <section class="section">
          <div class="section-head"><div><h2>현재 판단</h2><p class="section-caption">정답률만 보지 않고 오답과 ‘모르겠음’의 개념을 묶어서 봅니다.</p></div></div>
          <div class="notice ${progress.answered ? 'notice-warning' : 'notice-info'}">${esc(suggested)}</div>
        </section>

        ${weak.length ? `
          <section class="section">
            <div class="section-head"><div><h2>다시 이해할 개념</h2><p class="section-caption">오답과 헷갈림이 누적된 순서입니다.</p></div><button class="ghost-button" data-action="concept-library">전체 보기</button></div>
            <div class="weak-list">
              ${weak.map((item) => {
                const concept = DATA.CONCEPTS[item.conceptId];
                return `<button class="weak-card" data-action="open-concept" data-concept="${esc(item.conceptId)}"><span><strong>${esc(concept.title)}</strong><small>${esc(DATA.SUBJECTS[concept.subject].short)} 과목</small></span><span class="badge">${item.count}문항</span></button>`;
              }).join('')}
            </div>
          </section>
        ` : `
          <section class="section">
            <button class="secondary-button full-button" data-action="concept-library">개념 설명 전체 보기</button>
          </section>
        `}

        <section class="section">
          <div class="section-head"><div><h2>기록 관리</h2><p class="section-caption">Safari 데이터가 지워질 상황에 대비해 파일로 보관할 수 있습니다.</p></div></div>
          <div class="utility-list">
            <button class="utility-button" data-action="export"><span>학습 기록 내보내기</span><small>JSON</small></button>
            <button class="utility-button" data-action="import"><span>학습 기록 불러오기</span><small>파일 선택</small></button>
            <button class="utility-button" data-action="reset"><span>모든 학습 기록 초기화</span><small>주의</small></button>
          </div>
        </section>

        <p class="footer-note">Notion에 정리된 제12회 기출복원 80문항과 핵심 해설을 재사용했습니다.<br />33번은 원본 선택지가 없어 단답형으로 제공하며, 원문 오류가 확인된 해설은 표시 후 교정했습니다.</p>
      </div>
    </main>
  `;
}

function renderDiagram(type) {
  if (type === 'boxplot-treatment') {
    return `
      <div class="diagram-card" role="img" aria-label="치료제 A와 B의 상자그림 재구성">
        <svg viewBox="0 0 330 150" xmlns="http://www.w3.org/2000/svg">
          <line x1="38" y1="128" x2="312" y2="128" stroke="#8b95a8" stroke-width="1" />
          <text x="18" y="50" font-size="14" fill="#253653">A</text>
          <text x="18" y="105" font-size="14" fill="#253653">B</text>
          <line x1="65" y1="45" x2="235" y2="45" stroke="#3457d5" stroke-width="2" />
          <line x1="65" y1="35" x2="65" y2="55" stroke="#3457d5" stroke-width="2" />
          <line x1="235" y1="35" x2="235" y2="55" stroke="#3457d5" stroke-width="2" />
          <rect x="95" y="27" width="100" height="36" fill="#e9edff" stroke="#3457d5" stroke-width="2" rx="3" />
          <line x1="137" y1="27" x2="137" y2="63" stroke="#3457d5" stroke-width="3" />
          <line x1="140" y1="100" x2="250" y2="100" stroke="#117864" stroke-width="2" />
          <line x1="140" y1="90" x2="140" y2="110" stroke="#117864" stroke-width="2" />
          <line x1="250" y1="90" x2="250" y2="110" stroke="#117864" stroke-width="2" />
          <rect x="165" y="82" width="58" height="36" fill="#e4f5ef" stroke="#117864" stroke-width="2" rx="3" />
          <line x1="198" y1="82" x2="198" y2="118" stroke="#117864" stroke-width="3" />
          <circle cx="285" cy="100" r="5" fill="#b32832" />
          <text x="62" y="143" font-size="10" fill="#727d90">짧음</text>
          <text x="276" y="143" font-size="10" fill="#727d90">긺</text>
        </svg>
        <p class="diagram-caption">Notion 원문 설명을 바탕으로 학습용으로 다시 그린 도표입니다. 상자그림만으로 평균의 대소는 확정할 수 없습니다.</p>
      </div>`;
  }
  if (type === 'boxplot-groups') {
    return `
      <div class="diagram-card" role="img" aria-label="그룹 A와 B의 상자그림 재구성">
        <svg viewBox="0 0 330 150" xmlns="http://www.w3.org/2000/svg">
          <line x1="38" y1="128" x2="312" y2="128" stroke="#8b95a8" stroke-width="1" />
          <text x="18" y="50" font-size="14" fill="#253653">A</text>
          <text x="18" y="105" font-size="14" fill="#253653">B</text>
          <line x1="135" y1="45" x2="265" y2="45" stroke="#3457d5" stroke-width="2" />
          <line x1="135" y1="35" x2="135" y2="55" stroke="#3457d5" stroke-width="2" />
          <line x1="265" y1="35" x2="265" y2="55" stroke="#3457d5" stroke-width="2" />
          <rect x="170" y="27" width="60" height="36" fill="#e9edff" stroke="#3457d5" stroke-width="2" rx="3" />
          <line x1="208" y1="27" x2="208" y2="63" stroke="#3457d5" stroke-width="3" />
          <line x1="55" y1="100" x2="265" y2="100" stroke="#117864" stroke-width="2" />
          <line x1="55" y1="90" x2="55" y2="110" stroke="#117864" stroke-width="2" />
          <line x1="265" y1="90" x2="265" y2="110" stroke="#117864" stroke-width="2" />
          <rect x="95" y="82" width="125" height="36" fill="#e4f5ef" stroke="#117864" stroke-width="2" rx="3" />
          <line x1="150" y1="82" x2="150" y2="118" stroke="#117864" stroke-width="3" />
          <circle cx="292" cy="100" r="5" fill="#b32832" />
          <text x="51" y="143" font-size="10" fill="#727d90">작음</text>
          <text x="274" y="143" font-size="10" fill="#727d90">큼</text>
        </svg>
        <p class="diagram-caption">Notion 원문 설명에 맞춰 중앙값, IQR, 이상치 관계를 재구성했습니다. 일반적인 상자그림의 폭만으로 표본 수를 비교할 수 없습니다.</p>
      </div>`;
  }
  return '';
}
