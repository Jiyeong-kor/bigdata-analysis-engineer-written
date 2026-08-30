function renderQuiz() {
  const session = state.activeSession;
  const question = currentQuestion();
  if (!session || !question) {
    view.name = 'home';
    renderHome();
    return;
  }
  const attempt = currentAttempt();
  const draft = session.draft || { answer: null, confidence: null };
  const pct = Math.round((session.index / session.questionIds.length) * 100);
  const recommendation = recommendationForCurrent();
  const statusLabel = attempt?.status === 'correct' ? '정답입니다.' : attempt?.status === 'wrong' ? '오답입니다.' : '모르겠음으로 기록했습니다.';
  const statusClass = attempt?.status === 'correct' ? 'result-correct' : attempt?.status === 'wrong' ? 'result-wrong' : 'result-unknown';

  app.innerHTML = `
    <main class="app-shell">
      ${renderHeader(session.label, 'open-stop')}
      <div class="page quiz-page">
        <div class="quiz-meta"><span>${session.index + 1}/${session.questionIds.length}</span><span>${pct}% 진행</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>

        <article class="question-card">
          <div class="question-kicker">
            <span class="subject-pill">${question.subject}과목 · ${esc(DATA.SUBJECTS[question.subject].short)}</span>
            <span class="source-pill">${esc(question.source)}</span>
            <span class="question-number">원문 ${question.id}번</span>
          </div>
          <h2 class="question-stem">${esc(question.stem)}</h2>
          ${question.diagram ? renderDiagram(question.diagram) : ''}

          ${question.type === 'short' ? `
            <input class="short-answer" id="short-answer" inputmode="decimal" autocomplete="off" placeholder="답을 입력하세요" value="${attempt ? esc(attempt.answer ?? '') : esc(draft.answer ?? '')}" ${attempt ? 'disabled' : ''} />
            ${question.sourceNote && !attempt ? `<p class="source-note">${esc(question.sourceNote)}</p>` : ''}
          ` : `
            <div class="choices">
              ${question.choices.map((choice, index) => {
                let className = 'choice';
                if (!attempt && Number(draft.answer) === index) className += ' selected';
                if (attempt) {
                  if (index === question.answer) className += ' correct';
                  if (attempt.status === 'wrong' && Number(attempt.answer) === index) className += ' incorrect';
                }
                return `
                  <button class="${className}" data-action="select-answer" data-answer="${index}" ${attempt ? 'disabled' : ''}>
                    <span class="choice-index">${numberMarks[index]}</span>
                    <span class="choice-text">${esc(choice)}</span>
                  </button>`;
              }).join('')}
            </div>
          `}

          ${!attempt ? `
            <div class="confidence">
              <p class="confidence-label">선택한 답에 대한 확신 정도는 선택 사항입니다.</p>
              <div class="segmented">
                <button class="segment ${draft.confidence === 'certain' ? 'active' : ''}" data-action="confidence" data-confidence="certain">근거가 확실함</button>
                <button class="segment ${draft.confidence === 'uncertain' ? 'active' : ''}" data-action="confidence" data-confidence="uncertain">헷갈리지만 선택함</button>
              </div>
            </div>
            <div class="quiz-actions">
              <button class="secondary-button" data-action="unknown">모르겠음</button>
              <button class="primary-button" data-action="check-answer">정답 확인</button>
            </div>
          ` : `
            <section class="answer-panel">
              <div class="result-banner ${statusClass}">${statusLabel}<br /><small>내 답: ${answerDisplay(question, attempt)}</small></div>
              <h3 class="explanation-title">정답 ${correctAnswerDisplay(question)}</h3>
              <p class="explanation-text">${esc(question.explanation)}</p>
              ${question.sourceNote ? `<div class="source-note">원본 자료 확인 메모: ${esc(question.sourceNote)}</div>` : ''}
              <p class="section-caption">이 문항에 사용한 시간: ${formatTime(attempt.elapsedSec)}</p>

              ${!attempt.explanationSeen ? `
                <div style="height:14px"></div>
                <button class="primary-button full-button" data-action="explanation-seen">해설 확인 완료</button>
              ` : `
                <div class="reason-box">
                  <label for="reason-note">내가 틀리거나 헷갈린 이유 한 줄</label>
                  <textarea id="reason-note" placeholder="예: 완전성과 정확성을 같은 뜻으로 생각했다.">${esc(attempt.note || '')}</textarea>
                </div>

                ${recommendation ? `
                  <div class="intervention">
                    <strong>문제보다 개념을 다시 볼 시점입니다.</strong>
                    <p>${esc(recommendation.reason)}</p>
                    <div class="button-stack">
                      <button class="primary-button full-button" data-action="review-recommended" data-concept="${esc(recommendation.conceptId)}">${esc(DATA.CONCEPTS[recommendation.conceptId].title)} 다시 이해하기</button>
                      <button class="ghost-button full-button" data-action="dismiss-recommendation">그래도 다음 문제 계속 풀기</button>
                    </div>
                  </div>
                ` : `
                  <div style="height:14px"></div>
                  <div class="button-row">
                    <button class="secondary-button" data-action="review-current-concept" data-concept="${esc(question.conceptId)}">관련 개념 보기</button>
                    <button class="primary-button" data-action="next-question">${session.index + 1 >= session.questionIds.length ? '결과 보기' : '다음 문제'}</button>
                  </div>
                `}
              `}
            </section>
          `}
        </article>
      </div>
      <div class="sticky-actions"><button class="ghost-button full-button" data-action="open-stop">저장하고 그만 풀기</button></div>

      ${view.showStopModal ? `
        <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="stop-title">
          <div class="modal">
            <h2 id="stop-title">여기까지 자동 저장했습니다.</h2>
            <p>다음에 앱을 열면 ${session.index + 1}/${session.questionIds.length}번째 문항에서 그대로 이어집니다. 답을 확인한 문항의 메모도 보존됩니다.</p>
            <div class="button-stack">
              <button class="primary-button full-button" data-action="stop-home">지금 그만하고 홈으로</button>
              <button class="secondary-button full-button" data-action="stop-concept" data-concept="${esc(question.conceptId)}">현재 개념만 정리하고 끝내기</button>
              <button class="ghost-button full-button" data-action="stop-cancel">계속 풀기</button>
            </div>
          </div>
        </div>
      ` : ''}
    </main>
  `;
}

function renderConcept() {
  const sessionReview = state.activeSession?.conceptReview;
  const conceptId = sessionReview?.conceptId || view.conceptId;
  const concept = DATA.CONCEPTS[conceptId];
  if (!concept) {
    view.name = 'home';
    renderHome();
    return;
  }
  const related = questionIdsForConcept(conceptId);
  app.innerHTML = `
    <main class="app-shell">
      ${renderHeader('개념 다시 이해하기', sessionReview ? 'concept-back-quiz' : view.conceptReturn === 'library' ? 'concept-library' : 'home')}
      <div class="page concept-page">
        <section class="concept-hero">
          <small>${concept.subject}과목 · ${esc(DATA.SUBJECTS[concept.subject].name)}</small>
          <h2>${esc(concept.title)}</h2>
        </section>

        <section class="card concept-block">
          <h3>이 개념은 무엇입니까?</h3>
          <p>${esc(concept.definition)}</p>
        </section>
        <section class="card concept-block">
          <h3>문제에서 무엇을 보고 판단합니까?</h3>
          <p>${esc(concept.decision)}</p>
        </section>
        <section class="card concept-block">
          <h3>헷갈리는 개념과 구분</h3>
          <ul class="concept-list">${concept.distinctions.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
        </section>
        <section class="card concept-block">
          <h3>예시</h3>
          <p>${esc(concept.example)}</p>
        </section>
        <section class="mini-check">
          <strong>가리고 답해 보기</strong>
          <p>${esc(concept.miniCheck.q)}</p>
          <button class="secondary-button full-button" style="margin-top:12px" data-action="show-mini-answer">정답 보기</button>
          <div id="mini-answer" class="mini-answer" hidden>${esc(concept.miniCheck.a)}</div>
        </section>

        <section class="section">
          <button class="primary-button full-button" data-action="concept-done">${sessionReview?.stopAfter ? '개념 확인하고 오늘은 끝내기' : sessionReview?.advanceAfter ? '개념 확인하고 다음 문제' : '개념 확인 완료'}</button>
          ${!sessionReview ? `<div style="height:9px"></div><button class="secondary-button full-button" data-action="start-concept-questions" data-concept="${esc(conceptId)}">관련 기출 ${related.length}문항 풀기</button>` : ''}
        </section>
      </div>
    </main>
  `;
}

function renderConceptLibrary() {
  const groups = Object.entries(DATA.SUBJECTS).map(([subjectId, subject]) => {
    const concepts = Object.entries(DATA.CONCEPTS).filter(([, concept]) => concept.subject === Number(subjectId));
    return `
      <section class="concept-group">
        <h2 class="concept-group-title">${subjectId}과목 · ${esc(subject.name)}</h2>
        <div class="card" style="padding:0;overflow:hidden">
          ${concepts.map(([id, concept]) => `<button class="concept-link" data-action="open-concept-library" data-concept="${esc(id)}"><span>${esc(concept.title)}</span><b>›</b></button>`).join('')}
        </div>
      </section>`;
  }).join('');
  app.innerHTML = `
    <main class="app-shell">
      ${renderHeader('개념 설명', 'home')}
      <div class="page">
        <div class="notice notice-info">개념 이름만 외우는 페이지가 아닙니다. 정의, 문제 판단 기준, 헷갈리는 개념과의 차이, 예시를 순서대로 확인합니다.</div>
        <div class="concept-groups section">${groups}</div>
      </div>
    </main>`;
}

function renderSummary() {
  const summary = state.lastSummary;
  if (!summary) {
    view.name = 'home';
    renderHome();
    return;
  }
  const weak = weakConcepts(3);
  const rate = summary.total ? Math.round((summary.correct / summary.total) * 100) : 0;
  app.innerHTML = `
    <main class="app-shell">
      ${renderHeader('학습 결과', 'home')}
      <div class="page">
        <section class="hero">
          <p class="hero-kicker">${esc(summary.label)} 완료</p>
          <h2>정답률 ${rate}%</h2>
          <p>점수보다 다음 학습 결정이 중요합니다. 오답과 ‘모르겠음’이 같은 개념에 모였는지 확인하세요.</p>
        </section>
        <section class="card section">
          <div class="summary-grid">
            <div class="summary-cell"><strong>${summary.correct}</strong><span>정답</span></div>
            <div class="summary-cell"><strong>${summary.wrong}</strong><span>오답</span></div>
            <div class="summary-cell"><strong>${summary.unknown}</strong><span>모르겠음</span></div>
          </div>
        </section>
        ${weak.length ? `
          <section class="section">
            <div class="section-head"><div><h2>먼저 다시 볼 개념</h2><p class="section-caption">문제를 더 풀기 전에 판단 기준을 정리할 후보입니다.</p></div></div>
            <div class="weak-list">
              ${weak.map((item) => `<button class="weak-card" data-action="open-concept" data-concept="${esc(item.conceptId)}"><span><strong>${esc(DATA.CONCEPTS[item.conceptId].title)}</strong><small>${esc(DATA.SUBJECTS[DATA.CONCEPTS[item.conceptId].subject].short)} 과목</small></span><span class="badge">${item.count}문항</span></button>`).join('')}
            </div>
          </section>` : ''}
        <section class="section button-stack">
          <button class="primary-button full-button" data-action="start-weak" ${questionIdsForWeakReview().length ? '' : 'disabled'}>오답·모르겠음 다시 풀기</button>
          <button class="secondary-button full-button" data-action="home">홈으로</button>
        </section>
      </div>
    </main>`;
}

function render() {
  if (state.activeSession?.conceptReview) {
    view.name = 'concept';
    renderConcept();
    return;
  }
  if (view.name === 'quiz') renderQuiz();
  else if (view.name === 'concept') renderConcept();
  else if (view.name === 'concept-library') renderConceptLibrary();
  else if (view.name === 'summary') renderSummary();
  else renderHome();
}
