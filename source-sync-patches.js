(() => {
  const patchQuestion = (id, patch) => {
    const question = DATA.QUESTIONS.find((item) => item.id === id);
    if (question) Object.assign(question, patch);
    return question;
  };

  patchQuestion(27, {
    stem: '다음 중 데이터 전처리 기법에 대한 설명으로 적절하지 않은 것은?',
    choices: [
      '평활화는 데이터의 잡음이나 불규칙한 변동을 줄이는 방법이다.',
      '범주화는 새로운 변수를 생성하여 모델의 특징을 확장하는 방법이다.',
      '정규화는 데이터들의 값 범위를 일정하게 조정하는 방법이다.',
      '표준화는 평균과 표준편차를 이용해 데이터를 변환하는 방법이다.'
    ],
    answer: 1,
    explanation: '범주화는 연속형 값 등을 구간이나 범주로 바꾸는 기법입니다. 새로운 파생변수를 생성하여 특징을 확장한다는 설명과는 다릅니다.'
  });

  patchQuestion(31, {
    stem: '대응표본 t-검정이 사용되는 경우로 가장 적절한 것은?',
    choices: [
      '독립적인 두 모집단으로부터 추출된 두 집단의 평균 차이를 비교할 때',
      '동일한 대상에 어떤 처치를 하기 전과 후의 평균 차이를 비교할 때',
      '세 집단 이상의 연속형 변수에 대한 평균 차이를 동시에 비교할 때',
      '범주형 변수 간의 연관성이나 분포 차이가 유의미한지를 비교할 때'
    ],
    answer: 1,
    explanation: '대응표본 t-검정은 동일한 대상의 처치 전후처럼 서로 짝지어진 두 측정값의 평균 차이를 검정합니다.'
  });
  const q31 = DATA.QUESTIONS.find((question) => question.id === 31);
  if (q31) delete q31.sourceNote;

  const q33 = patchQuestion(33, {
    type: 'choice',
    choices: ['25/12', '35/12', '35/6', '49/12'],
    answer: 1,
    explanation: '1부터 6까지의 이산균등분포 분산은 (6²-1)/12=35/12이므로 정답은 ②입니다.'
  });
  if (q33) {
    delete q33.accepted;
    delete q33.sourceNote;
  }

  patchQuestion(38, {
    stem: '다음 중 데이터 전처리 과정에서 결측치를 처리하는 방법으로 가장 적절하지 않은 것은?',
    choices: [
      '완전 사례 분석은 결측치가 하나라도 있는 행을 제거하는 방법이다.',
      '평균 대치는 결측값을 평균값으로 일괄 대체하는 방법이다.',
      '회귀 대치는 변수 간 관계에서 추정된 회귀식의 예측값으로 결측값을 채우는 방법이다.',
      '데이터 증식은 데이터의 일관성을 유지하며 원래 데이터보다 더 많은 데이터를 생성한다.'
    ],
    answer: 3,
    explanation: '데이터 증식은 표본을 늘리는 방법이며 결측치를 처리하는 대표 방법이 아닙니다.'
  });

  patchQuestion(41, {
    choices: [
      '파이프라이닝(Pipelining)',
      '배치 정규화(Batch Normalization)',
      '어텐션(Attention)',
      '드롭아웃(Dropout)'
    ]
  });

  patchQuestion(58, {
    stem: '다음 중 나이브 베이즈 분류기법에 대한 설명으로 옳은 것은?',
    choices: [
      '특정 클래스가 주어졌을 때, 모델의 모든 특징들이 서로 조건부 독립이라고 가정한다.',
      '독립변수들과 무관하게 출력변수들이 서로 완전히 독립이라고 가정한다.',
      '분류에 활용되는 독립변수 간 상관관계가 강할수록 분류 정확도가 향상된다.',
      '사전확률을 전혀 사용하지 않는 분류 알고리즘이다.'
    ],
    answer: 0,
    explanation: '나이브 베이즈는 베이즈 정리를 사용하며, 클래스가 주어졌을 때 특징들이 서로 조건부 독립이라고 가정합니다.'
  });

  patchQuestion(71, {
    stem: '다음 중 선형회귀 모델이 적절한 설명력을 가지기 위한 전제 가정에 대해 잘못 설명한 것은?',
    choices: [
      '최소제곱법 하에서 오차가 한쪽으로 편향되지 않으려면 잔차의 평균은 0이어야 한다.',
      '모든 구간에서 잔차의 분산은 예측값 또는 독립변수 값의 크기와 관계없이 일정해야 한다.',
      '잔차항들 사이의 자기상관이 존재하지 않아야 한다.',
      '잔차와 종속변수 사이에는 상관관계가 있어야 한다.'
    ],
    answer: 3,
    explanation: '잔차가 종속변수와 상관되어야 한다는 조건은 선형회귀의 전제 가정이 아닙니다.'
  });

  const q74 = patchQuestion(74, {
    stem: '다음 중 카이제곱 검정에 대한 설명으로 가장 거리가 먼 것은?',
    choices: [
      '관측빈도와 기대빈도의 차이를 이용하여 검정 통계량을 계산한다.',
      '적합도 검정(Goodness of Fit)에 사용할 수 있다.',
      '두 범주형 변수 간의 독립성 검정에 사용할 수 있다.',
      '적절한 카이제곱 확률변수들의 합은 포아송 분포에 수렴한다.'
    ],
    answer: 3,
    explanation: '서로 독립인 카이제곱 확률변수의 합은 자유도를 합한 카이제곱 분포를 따릅니다. 포아송 분포에 수렴한다는 설명은 틀립니다.'
  });
  if (q74) delete q74.sourceNote;

  const originalRenderHome = renderHome;
  renderHome = function renderHomeWithLatestNotionSource() {
    originalRenderHome();
    const footer = document.querySelector('.footer-note');
    if (footer) {
      footer.innerHTML = 'Notion의 최신 제12회 기출문제 페이지에 정리된 80문항, 33번의 보강 선택지, 21번·63번의 보강 상자그림을 기준으로 구성했습니다.<br />같은 시험의 중간 정리 페이지보다 최신 완성 페이지를 우선합니다.';
    }
  };

  renderDiagram = function renderLatestNotionDiagram(type) {
    if (type === 'boxplot-treatment') {
      return `
        <div class="diagram-card" role="img" aria-label="Notion에 보강된 치료제 A와 B의 상자그림 관계">
          <svg viewBox="0 0 330 160" xmlns="http://www.w3.org/2000/svg">
            <line x1="42" y1="136" x2="312" y2="136" stroke="#8b95a8" stroke-width="1" />
            <text x="18" y="50" font-size="14" fill="#253653">A</text>
            <text x="18" y="108" font-size="14" fill="#253653">B</text>
            <line x1="62" y1="45" x2="242" y2="45" stroke="#3457d5" stroke-width="2" />
            <line x1="62" y1="35" x2="62" y2="55" stroke="#3457d5" stroke-width="2" />
            <line x1="242" y1="35" x2="242" y2="55" stroke="#3457d5" stroke-width="2" />
            <rect x="92" y="27" width="112" height="36" fill="#e9edff" stroke="#3457d5" stroke-width="2" rx="3" />
            <line x1="136" y1="27" x2="136" y2="63" stroke="#3457d5" stroke-width="3" />
            <line x1="142" y1="101" x2="250" y2="101" stroke="#117864" stroke-width="2" />
            <line x1="142" y1="91" x2="142" y2="111" stroke="#117864" stroke-width="2" />
            <line x1="250" y1="91" x2="250" y2="111" stroke="#117864" stroke-width="2" />
            <rect x="166" y="83" width="60" height="36" fill="#e4f5ef" stroke="#117864" stroke-width="2" rx="3" />
            <line x1="199" y1="83" x2="199" y2="119" stroke="#117864" stroke-width="3" />
            <circle cx="281" cy="101" r="5" fill="#b32832" />
            <circle cx="301" cy="101" r="5" fill="#b32832" />
            <text x="58" y="151" font-size="10" fill="#727d90">짧음</text>
            <text x="278" y="151" font-size="10" fill="#727d90">긺</text>
          </svg>
          <p class="diagram-caption">Notion에 보강된 SVG와 같은 판단 관계입니다. A의 중앙값은 B보다 작고, A의 IQR은 B보다 크며, B에 이상치 2개가 있습니다.</p>
        </div>`;
    }
    if (type === 'boxplot-groups') {
      return `
        <div class="diagram-card" role="img" aria-label="Notion에 보강된 그룹 A와 B의 상자그림 관계">
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
          <p class="diagram-caption">Notion에 보강된 SVG와 같은 판단 관계입니다. A의 중앙값은 B보다 크고, B의 IQR이 더 크며, 이상치는 B에만 있습니다.</p>
        </div>`;
    }
    return '';
  };
})();
