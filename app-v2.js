(() => {
  const BANKS = {
    past: {
      label: '기출복원',
      title: '제12회 기출복원 80문항',
      description: '실제 시험 형식과 선택지 표현을 점검합니다.'
    },
    diagnostic: {
      label: '자가진단',
      title: '자가진단 40문항',
      description: '네 과목의 기본선과 과락 위험을 빠르게 확인합니다.'
    },
    practice: {
      label: '교재 변형',
      title: '교재 변형 95문항',
      description: 'Notion 개념·공식·보강 범위를 시험형 선택지로 다시 묻습니다.'
    }
  };

  for (const question of DATA.QUESTIONS) {
    if (!question.bank) question.bank = 'past';
    if (!question.displayId) question.displayId = `기출 ${String(question.id).padStart(2, '0')}번`;
  }

  function bankOf(question) {
    return question.bank || 'past';
  }

  function questionsForBank(bank) {
    return DATA.QUESTIONS.filter((question) => bankOf(question) === bank);
  }

  function bankProgress(bank) {
    const questions = questionsForBank(bank);
    const latest = latestAttemptByQuestion();
    const attempts = questions.map((question) => latest.get(question.id)).filter(Boolean);
    return {
      total: questions.length,
      answered: attempts.length,
      correct: attempts.filter((attempt) => attempt.status === 'correct').length
    };
  }

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }
    return result;
  }

  function unseenFirstIds(questions) {
    const latest = latestAttemptByQuestion();
    const unseen = shuffle(questions.filter((question) => !latest.has(question.id)));
    const seen = shuffle(questions.filter((question) => latest.has(question.id)));
    return [...unseen, ...seen].map((question) => question.id);
  }

  function mixedQuestionIds(total = 40) {
    const perSubject = Math.floor(total / 4);
    const selected = [];
    for (let subject = 1; subject <= 4; subject += 1) {
      const pool = unseenFirstIds(DATA.QUESTIONS.filter((question) => question.subject === subject));
      selected.push(...pool.slice(0, perSubject));
    }
    return shuffle(selected);
  }

  window.STUDY_V2 = {
    BANKS,
    questionsForBank,
    unseenFirstIds,
    mixedQuestionIds
  };

  answerCurrent = function answerCurrentV2(unknown = false) {
    const session = state.activeSession;
    const question = currentQuestion();
    if (!session || !question || currentAttempt()) return;
    const draft = session.draft || {};
    if (!unknown && (draft.answer === null || draft.answer === undefined || String(draft.answer).trim() === '')) {
      showToast('답을 고르거나 ‘모르겠음’을 눌러 주세요.');
      return;
    }

    const activeElapsed = session.questionStartedAt
      ? Math.max(0, Math.round((Date.now() - session.questionStartedAt) / 1000))
      : 0;
    const elapsedSec = Math.min(3600, (session.elapsedDraftSec || 0) + activeElapsed);
    const isCorrect = !unknown && (question.type === 'short'
      ? isShortAnswerCorrect(question, draft.answer)
      : Number(draft.answer) === Number(question.answer));

    state.attempts.push({
      id: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sessionId: session.id,
      questionId: question.id,
      conceptId: question.conceptId,
      answer: unknown ? null : draft.answer,
      status: unknown ? 'unknown' : isCorrect ? 'correct' : 'wrong',
      confidence: unknown ? 'unknown' : draft.confidence || 'unmarked',
      explanationSeen: true,
      note: '',
      elapsedSec,
      answeredAt: new Date().toISOString()
    });

    session.questionStartedAt = null;
    session.elapsedDraftSec = 0;
    session.draft = { answer: null, confidence: null };
    saveState();
    render();
  };

  recommendationForCurrent = function recommendationForCurrentV2() {
    const session = state.activeSession;
    const question = currentQuestion();
    const attempt = currentAttempt();
    if (!session || !question || !attempt) return null;

    const isWeak = (item) => item.status !== 'correct' || item.confidence === 'uncertain';
    const sessionAttempts = state.attempts.filter((item) => item.sessionId === session.id);
    const recent = sessionAttempts.slice(-5);
    const recentWeak = recent.filter(isWeak).length;
    const review = state.conceptReviews[question.conceptId];
    const reviewTime = review?.lastReviewedAt ? new Date(review.lastReviewedAt).getTime() : 0;
    const sameConceptWeak = state.attempts.filter((item) =>
      item.conceptId === question.conceptId &&
      isWeak(item) &&
      new Date(item.answeredAt).getTime() > reviewTime
    ).length;

    if (sameConceptWeak >= 2) {
      return {
        conceptId: question.conceptId,
        reason: `같은 개념에서 오답 또는 불확실한 정답이 ${sameConceptWeak}회 누적되었습니다. 문제 수를 늘리기보다 판단 기준을 다시 잡는 편이 효율적입니다.`
      };
    }

    if (recent.length >= 5 && recentWeak >= 3) {
      const counts = new Map();
      for (const item of recent.filter(isWeak)) {
        counts.set(item.conceptId, (counts.get(item.conceptId) || 0) + 1);
      }
      const conceptId = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || question.conceptId;
      return {
        conceptId,
        reason: `최근 5문항 중 ${recentWeak}문항에서 근거가 충분히 잡히지 않았습니다. 가장 많이 막힌 개념을 확인할 시점입니다.`
      };
    }

    return null;
  };

  nextQuestion = function nextQuestionV2() {
    const session = state.activeSession;
    if (!session || !currentAttempt()) {
      showToast('정답을 확인한 뒤 다음 문항으로 이동할 수 있습니다.');
      return;
    }

    session.index += 1;
    session.draft = { answer: null, confidence: null };
    session.elapsedDraftSec = 0;
    session.questionStartedAt = Date.now();

    if (session.index >= session.questionIds.length) {
      completeSession();
      return;
    }

    saveState();
    render();
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  renderHome = function renderHomeV2() {
    const progress = aggregateProgress();
    const weak = weakConcepts(4);
    const active = state.activeSession;
    const total = DATA.QUESTIONS.length;
    const unanswered = total - progress.answered;

    app.innerHTML = `
      <main class="app-shell">
        <div class="page page-v2">
          <section class="compact-header-card">
            <div class="compact-header-row">
              <div>
                <h2>빅데이터분석기사 필기</h2>
                <p>전체 ${total}문항 · 기출복원, 자가진단, 교재 변형문제</p>
              </div>
              <span class="d-day-pill">${dDayText()}</span>
            </div>
            <div class="metric-strip">
              <div class="metric-item"><strong>${progress.answered}</strong><span>푼 문항</span></div>
              <div class="metric-item"><strong>${progress.correct}</strong><span>현재 정답</span></div>
              <div class="metric-item"><strong>${progress.wrong + progress.unknown}</strong><span>다시 볼 문항</span></div>
            </div>
          </section>

          ${!isStandalone() ? `
            <section class="compact-section">
              <div class="notice notice-info"><strong>아이폰 홈 화면에 추가</strong><br />Safari의 공유 버튼에서 ‘홈 화면에 추가’를 선택하면 앱처럼 실행할 수 있습니다.</div>
            </section>
          ` : ''}

          ${active ? `
            <section class="compact-section">
              <div class="resume-card-v2">
                <div class="resume-row">
                  <div>
                    <strong>이어서 풀기</strong>
                    <p>${esc(active.label)} · ${sessionProgressIndex(active)}/${active.questionIds.length}번째 문항</p>
                  </div>
                  <button class="inline-link-button" data-action="resume">계속</button>
                </div>
                <div class="progress-track"><div class="progress-fill" style="width:${Math.round((active.index / active.questionIds.length) * 100)}%"></div></div>
              </div>
            </section>
          ` : ''}

          <section class="compact-section">
            <div class="section-head"><div><h2>통합 실전</h2><p class="section-caption">네 과목에서 10문항씩, 아직 안 푼 문제를 우선하여 구성합니다.</p></div></div>
            <div class="focus-start-card">
              <div><strong>통합 실전 40문항</strong><p>기출과 교재 변형문제를 섞어 과락 위험과 적용력을 함께 확인합니다.</p></div>
              <button class="primary-button" data-action="start-mixed">시작</button>
            </div>
          </section>

          <section class="compact-section">
            <div class="section-head"><div><h2>문제 묶음</h2><p class="section-caption">원하는 자료부터 바로 시작합니다.</p></div></div>
            <div class="bank-list">
              ${['practice', 'diagnostic', 'past'].map((bank) => {
                const config = BANKS[bank];
                const stats = bankProgress(bank);
                return `
                  <button class="bank-card" data-action="start-bank" data-bank="${bank}">
                    <span><strong>${esc(config.title)}</strong><small>${esc(config.description)}</small></span>
                    <span class="bank-count">${stats.answered}/${stats.total}</span>
                  </button>`;
              }).join('')}
            </div>
          </section>

          <section class="compact-section">
            <div class="section-head"><div><h2>과목별</h2><p class="section-caption">기출과 새 문제를 합친 전체 범위입니다.</p></div></div>
            <div class="subject-grid-v2">
              ${Object.entries(DATA.SUBJECTS).map(([id, subject]) => {
                const stats = subjectProgress(Number(id));
                return `
                  <button class="subject-card-v2" data-action="start-subject" data-subject="${id}">
                    <span class="subject-number">${id}</span>
                    <strong>${esc(subject.name)}</strong>
                    <small>${stats.answered}/${stats.total} 풀이 · ${stats.correct} 정답</small>
                  </button>`;
              }).join('')}
            </div>
          </section>

          <section class="compact-section">
            <div class="section-head"><div><h2>복습</h2><p class="section-caption">전체 ${total}문항을 기준으로 계산합니다.</p></div></div>
            <div class="compact-utility-grid">
              <button class="secondary-button" data-action="start-unanswered" ${unanswered ? '' : 'disabled'}>미풀이 ${unanswered}문항</button>
              <button class="secondary-button" data-action="start-weak" ${questionIdsForWeakReview().length ? '' : 'disabled'}>오답·헷갈림 ${questionIdsForWeakReview().length}문항</button>
              <button class="ghost-button" data-action="start-complete">전체 ${total}문항</button>
              <button class="ghost-button" data-action="concept-library">개념 설명</button>
            </div>
          </section>

          ${weak.length ? `
            <section class="compact-section">
              <div class="section-head"><div><h2>우선 복구할 개념</h2><p class="section-caption">오답과 불확실한 정답이 누적된 순서입니다.</p></div></div>
              <div class="weak-list">
                ${weak.map((item) => {
                  const concept = DATA.CONCEPTS[item.conceptId];
                  return `<button class="weak-card" data-action="open-concept" data-concept="${esc(item.conceptId)}"><span><strong>${esc(concept.title)}</strong><small>${esc(DATA.SUBJECTS[concept.subject].short)} 과목</small></span><span class="badge">${item.count}문항</span></button>`;
                }).join('')}
              </div>
            </section>
          ` : ''}

          <section class="compact-section">
            <div class="section-head"><div><h2>기록 관리</h2></div></div>
            <div class="compact-utility-grid">
              <button class="ghost-button" data-action="export">기록 내보내기</button>
              <button class="ghost-button" data-action="import">기록 불러오기</button>
              <button class="danger-button" data-action="reset" style="grid-column:1/-1;min-height:42px">모든 기록 초기화</button>
            </div>
          </section>

          <p class="footer-note">Notion의 핵심 교재, 세부 출제범위 보강, 자가진단 40문항과 제12회 기출복원을 통합한 총 ${total}문항입니다.</p>
        </div>
      </main>`;
  };

  renderQuiz = function renderQuizV2() {
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
    const bank = bankOf(question);
    const bankConfig = BANKS[bank] || BANKS.past;
    const statusLabel = attempt?.status === 'correct' ? '정답입니다.' : attempt?.status === 'wrong' ? '오답입니다.' : '모르겠음으로 기록했습니다.';
    const statusClass = attempt?.status === 'correct' ? 'result-correct' : attempt?.status === 'wrong' ? 'result-wrong' : 'result-unknown';
    const concept = DATA.CONCEPTS[question.conceptId];
    const noteSummary = attempt?.status === 'correct' && attempt?.confidence !== 'uncertain' ? '메모 남기기' : '틀리거나 헷갈린 이유 기록하기';

    app.innerHTML = `
      <main class="app-shell">
        ${renderHeader(session.label, 'open-stop')}
        <div class="page quiz-page">
          <div class="quiz-meta"><span>${session.index + 1}/${session.questionIds.length}</span><span>${pct}% 진행</span></div>
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>

          <article class="question-card question-card-v2">
            <div class="question-kicker">
              <span class="subject-pill">${question.subject}과목 · ${esc(DATA.SUBJECTS[question.subject].short)}</span>
              <span class="source-pill bank-${bank}">${esc(bankConfig.label)}</span>
              <span class="question-number">${esc(question.displayId)}${question.origin ? ` · ${esc(question.origin)}` : ''}</span>
            </div>
            <h2 class="question-stem">${esc(question.stem)}</h2>
            ${question.diagram ? renderDiagram(question.diagram) : ''}

            ${question.type === 'short' ? `
              <input class="short-answer" id="short-answer" inputmode="decimal" autocomplete="off" placeholder="답을 입력하세요" value="${attempt ? esc(attempt.answer ?? '') : esc(draft.answer ?? '')}" ${attempt ? 'disabled' : ''} />
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
                <p class="confidence-label">확신 정도는 선택 사항입니다.</p>
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
              <section class="answer-panel-v2">
                <div class="result-banner ${statusClass}">${statusLabel}<br /><small>내 답: ${answerDisplay(question, attempt)}</small></div>
                <h3 class="explanation-title">정답 ${correctAnswerDisplay(question)}</h3>
                <p class="explanation-text">${esc(question.explanation)}</p>
                ${question.sourceNote ? `<div class="source-note">자료 확인 메모: ${esc(question.sourceNote)}</div>` : ''}
                <div class="answer-meta-row"><span>풀이 시간 ${formatTime(attempt.elapsedSec)}</span><span>관련 개념 ${esc(concept?.title || '')}</span></div>

                ${recommendation ? `
                  <div class="study-nudge-v2"><strong>개념을 다시 확인할 시점입니다.</strong><p>${esc(recommendation.reason)}</p></div>
                ` : ''}

                <div class="answer-actions-v2">
                  <button class="secondary-button" data-action="review-current-concept" data-concept="${esc(recommendation?.conceptId || question.conceptId)}">${recommendation ? '개념 다시 보기' : '관련 개념 보기'}</button>
                  <button class="primary-button" data-action="next-question">${session.index + 1 >= session.questionIds.length ? '결과 보기' : '다음 문제'}</button>
                </div>

                <details class="note-disclosure">
                  <summary>${noteSummary}</summary>
                  <div class="reason-box">
                    <label for="reason-note">판단이 흔들린 지점을 한 줄로 남깁니다.</label>
                    <textarea id="reason-note" placeholder="예: 완전성과 정확성을 같은 뜻으로 생각했다.">${esc(attempt.note || '')}</textarea>
                  </div>
                </details>
              </section>
            `}
          </article>
        </div>

        <div class="sticky-actions"><button class="ghost-button full-button" data-action="open-stop">저장하고 그만 풀기</button></div>

        ${view.showStopModal ? `
          <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="stop-title">
            <div class="modal">
              <h2 id="stop-title">현재 위치를 저장했습니다.</h2>
              <p>다음에 앱을 열면 ${session.index + 1}/${session.questionIds.length}번째 문항에서 이어집니다.</p>
              <div class="button-stack">
                <button class="primary-button full-button" data-action="stop-home">홈으로</button>
                <button class="secondary-button full-button" data-action="stop-concept" data-concept="${esc(question.conceptId)}">현재 개념만 보고 끝내기</button>
                <button class="ghost-button full-button" data-action="stop-cancel">계속 풀기</button>
              </div>
            </div>
          </div>
        ` : ''}
      </main>`;
  };

  renderConcept = function renderConceptV2() {
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
        <div class="page concept-page page-v2">
          <section class="compact-header-card">
            <div class="compact-header-row">
              <div><h2>${esc(concept.title)}</h2><p>${concept.subject}과목 · ${esc(DATA.SUBJECTS[concept.subject].name)}</p></div>
              <span class="bank-count">관련 ${related.length}</span>
            </div>
          </section>

          <section class="card concept-block"><h3>이 개념은 무엇입니까?</h3><p>${esc(concept.definition)}</p></section>
          <section class="card concept-block"><h3>문제에서 무엇을 보고 판단합니까?</h3><p>${esc(concept.decision)}</p></section>
          <section class="card concept-block"><h3>헷갈리는 개념과 구분</h3><ul class="concept-list">${concept.distinctions.map((item) => `<li>${esc(item)}</li>`).join('')}</ul></section>
          <section class="card concept-block"><h3>예시</h3><p>${esc(concept.example)}</p></section>
          <section class="mini-check"><strong>가리고 답해 보기</strong><p>${esc(concept.miniCheck.q)}</p><button class="secondary-button full-button" style="margin-top:12px" data-action="show-mini-answer">정답 보기</button><div id="mini-answer" class="mini-answer" hidden>${esc(concept.miniCheck.a)}</div></section>

          <section class="compact-section">
            <button class="primary-button full-button" data-action="concept-done">${sessionReview?.stopAfter ? '개념 확인하고 오늘은 끝내기' : sessionReview?.advanceAfter ? '개념 확인하고 다음 문제' : '개념 확인 완료'}</button>
            ${!sessionReview ? `<div style="height:9px"></div><button class="secondary-button full-button" data-action="start-concept-questions" data-concept="${esc(conceptId)}">관련 문제 ${related.length}문항 풀기</button>` : ''}
          </section>
        </div>
      </main>`;
  };

  renderSummary = function renderSummaryV2() {
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
        <div class="page page-v2">
          <section class="summary-card-v2">
            <div class="summary-heading"><div><h2>${esc(summary.label)}</h2><p>오답과 불확실한 정답이 모인 개념을 우선 복습합니다.</p></div><span class="summary-rate">${rate}%</span></div>
            <div class="metric-strip">
              <div class="metric-item"><strong>${summary.correct}</strong><span>정답</span></div>
              <div class="metric-item"><strong>${summary.wrong}</strong><span>오답</span></div>
              <div class="metric-item"><strong>${summary.unknown}</strong><span>모르겠음</span></div>
            </div>
          </section>

          ${weak.length ? `
            <section class="compact-section">
              <div class="section-head"><div><h2>먼저 다시 볼 개념</h2></div></div>
              <div class="weak-list">
                ${weak.map((item) => `<button class="weak-card" data-action="open-concept" data-concept="${esc(item.conceptId)}"><span><strong>${esc(DATA.CONCEPTS[item.conceptId].title)}</strong><small>${esc(DATA.SUBJECTS[DATA.CONCEPTS[item.conceptId].subject].short)} 과목</small></span><span class="badge">${item.count}문항</span></button>`).join('')}
              </div>
            </section>` : ''}

          <section class="compact-section button-stack">
            <button class="primary-button full-button" data-action="start-weak" ${questionIdsForWeakReview().length ? '' : 'disabled'}>오답·헷갈림 다시 풀기</button>
            <button class="secondary-button full-button" data-action="home">홈으로</button>
          </section>
        </div>
      </main>`;
  };
})();
