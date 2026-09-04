(() => {
  const data = window.STUDY_DATA;
  if (!data) throw new Error('STUDY_DATA가 생성되기 전에 Notion 학습 프로필을 적용할 수 없습니다.');

  const PROFILE_UPDATED_AT = '2026-09-04T12:31:52.274Z';

  const profile = {
    version: 3,
    updatedAt: PROFILE_UPDATED_AT,
    source: '2026-09-04 21:31 앱 학습기록과 Notion 재시험 추적',
    conceptPriority: {
      'nosql-products': 140,
      hypothesis: 520,
      clustering: -160,
      'cluster-evaluation': 300,
      'regression-evaluation': 240,
      metrics: 160,
      sampling: 180,
      'random-forest': 200,
      'association-rules': 180,
      'model-operations': 220,
      platform: -160,
      privacy: -140,
      methodology: -180,
      'data-governance': -160,
      'loading-distribution': -140,
      'business-deployment': -140,
      'neural-networks': -120,
      svm: -120,
      'variance-covariance': -100,
      'web-collection': -40,
      regularization: -100,
      'model-validation': -100,
    },
    questionPriority: {
      203: -80,
      109: -80,
      296: -160,
      297: 30,
      298: 30,
      299: 30,
      300: -80,
      301: 760,
      302: 700,
      303: 650,
      304: 600,
    },
  };

  const nosqlConceptId = 'nosql-products';
  if (!data.CONCEPTS[nosqlConceptId]) {
    data.CONCEPTS[nosqlConceptId] = {
      subject: 1,
      title: 'NoSQL 제품 구분',
      definition: 'NoSQL 제품은 데이터 모델과 운영 특성이 다릅니다. MongoDB는 문서형, Redis는 메모리 기반 키·값형, CouchDB는 JSON 문서형, DynamoDB는 AWS 관리형 키·값·문서 데이터베이스입니다.',
      decision: 'Auto-Sharding과 문서형이 함께 나오면 MongoDB, 초고속 캐시와 TTL은 Redis, JSON 문서와 HTTP API·복제는 CouchDB, AWS 완전관리형 키·값·문서는 DynamoDB를 우선 떠올립니다.',
      distinctions: [
        'MongoDB는 BSON 문서를 저장하는 문서형 NoSQL이며 샤딩을 지원합니다.',
        'Redis는 메모리 중심의 키·값 데이터 저장소로 캐시와 TTL 활용이 대표적입니다.',
        'CouchDB는 JSON 문서와 HTTP 기반 API, 복제 기능이 특징입니다.',
        'DynamoDB는 AWS가 제공하는 완전관리형 키·값 및 문서 NoSQL 데이터베이스입니다.',
        'Cassandra와 HBase는 넓은 열 계열로 분류하며, HBase는 HDFS 위에서 동작하는 분산 데이터베이스입니다.',
      ],
      example: '시험에서 문서형 NoSQL과 Auto-Sharding을 함께 묻는다면 MongoDB를 선택합니다.',
      miniCheck: {
        q: '문서형 NoSQL이며 Auto-Sharding 단서와 가장 직접적으로 연결되는 제품은 무엇입니까?',
        a: 'MongoDB입니다.',
      },
    };
  }

  const hypothesisConcept = data.CONCEPTS.hypothesis;
  if (hypothesisConcept) {
    hypothesisConcept.decision = '독립된 두 집단 평균은 독립표본 t-검정, 같은 대상의 전후 차이는 대응표본 t-검정입니다. 정규성 가정을 만족하지 않는 순위 기반 비교에서는 집단 수와 대응 여부를 먼저 확인합니다. 독립 2집단은 Mann-Whitney U, 독립 3집단 이상은 Kruskal-Wallis, 대응·반복 3조건 이상은 Friedman, 짝지어진 이분형 범주 변화는 McNemar 검정을 사용합니다.';
    hypothesisConcept.distinctions = [
      '일반 순서: 가설 설정 → 유의수준 설정 → 검정통계량·p-value 계산 → 결론',
      '독립표본과 대응표본은 조사 대상이 서로 연결되어 있는지로 구분합니다.',
      '독립 2집단 비모수 비교는 Mann-Whitney U 검정을 사용합니다.',
      '독립 3집단 이상 비모수 비교는 Kruskal-Wallis 검정을 사용합니다.',
      '같은 대상의 3조건 이상 반복 측정 비모수 비교는 Friedman 검정을 사용합니다.',
      '짝지어진 전후 이분형 범주 변화는 McNemar 검정을 사용합니다.',
    ];
    hypothesisConcept.example = '정규성을 만족하지 않는 서로 독립인 네 집단의 점수 위치 차이를 순위로 비교하면 Kruskal-Wallis 검정을 사용합니다.';
    hypothesisConcept.miniCheck = {
      q: '정규성을 만족하지 않는 서로 독립인 세 집단 이상의 순위 차이를 비교할 때 사용하는 검정은 무엇입니까?',
      a: 'Kruskal-Wallis 검정입니다.',
    };
  }

  const reinforcementQuestions = [
    {
      id: 296,
      subject: 1,
      bank: 'practice',
      source: 'Notion 학습기록 보강',
      displayId: '노션 보강 1번',
      origin: '2026-09-04 기출 2~10회 학습기록',
      stem: '문서형 NoSQL 데이터베이스이며 대규모 수평 확장을 위한 Auto-Sharding 단서와 가장 직접적으로 연결되는 제품은?',
      choices: ['Redis', 'CouchDB', 'MongoDB', 'Cassandra'],
      answer: 2,
      conceptId: nosqlConceptId,
      explanation: 'MongoDB는 문서형 NoSQL 데이터베이스이며 샤딩을 지원합니다. 시험에서 문서형과 Auto-Sharding이 함께 제시되면 MongoDB를 우선 판별합니다.',
    },
    {
      id: 297,
      subject: 1,
      bank: 'practice',
      source: 'Notion 학습기록 보강',
      displayId: '노션 보강 2번',
      origin: '2026-09-04 기출 2~10회 학습기록',
      stem: '세션과 임시 값을 메모리에 저장하고 키 단위 조회와 TTL 만료를 매우 빠르게 처리하려 한다. 가장 적합한 NoSQL 제품은?',
      choices: ['MongoDB', 'Redis', 'CouchDB', 'DynamoDB'],
      answer: 1,
      conceptId: nosqlConceptId,
      explanation: 'Redis는 메모리 중심의 키·값 데이터 저장소이며 빠른 캐시 조회와 TTL 만료 처리에 널리 사용됩니다.',
    },
    {
      id: 298,
      subject: 1,
      bank: 'practice',
      source: 'Notion 학습기록 보강',
      displayId: '노션 보강 3번',
      origin: '2026-09-04 기출 2~10회 학습기록',
      stem: 'JSON 문서를 저장하고 HTTP 기반 API와 복제 기능을 핵심 특징으로 하는 문서형 NoSQL 제품은?',
      choices: ['Cassandra', 'CouchDB', 'HBase', 'Redis'],
      answer: 1,
      conceptId: nosqlConceptId,
      explanation: 'CouchDB는 JSON 문서를 저장하고 HTTP 기반 API와 복제 기능을 제공하는 문서형 NoSQL 데이터베이스입니다.',
    },
    {
      id: 299,
      subject: 1,
      bank: 'practice',
      source: 'Notion 학습기록 보강',
      displayId: '노션 보강 4번',
      origin: '2026-09-04 기출 2~10회 학습기록',
      stem: 'AWS가 인프라 운영을 관리하며 키·값과 문서 데이터 모델을 제공하는 완전관리형 NoSQL 데이터베이스는?',
      choices: ['HBase', 'DynamoDB', 'CouchDB', 'Redis'],
      answer: 1,
      conceptId: nosqlConceptId,
      explanation: 'DynamoDB는 AWS가 제공하는 완전관리형 서버리스 NoSQL 데이터베이스이며 키·값과 문서 데이터 모델을 지원합니다.',
    },
    {
      id: 300,
      subject: 1,
      bank: 'practice',
      source: 'Notion 학습기록 보강',
      displayId: '노션 보강 5번',
      origin: '2026-09-04 기출 2~10회 학습기록',
      stem: '대규모 분산 시스템을 모니터링하면서 프레임워크 로그를 수집·분석하고 Hadoop과 유기적으로 연동하는 도구는?',
      choices: ['Sqoop', 'Chukwa', 'Flume', 'Kafka'],
      answer: 1,
      conceptId: 'web-collection',
      explanation: 'Chukwa는 대규모 분산 시스템 모니터링을 위한 데이터 수집·분석 시스템이며 Hadoop과 연동합니다. 단순히 Hadoop이라는 단어만 보지 말고 분산 시스템 모니터링과 로그 수집·분석 단서를 함께 확인합니다.',
    },
    {
      id: 301,
      subject: 2,
      bank: 'practice',
      source: 'Notion 학습기록 보강',
      displayId: '노션 보강 6번',
      origin: '2026-09-04 적응형 재시험 기록',
      stem: '정규성 가정을 만족하지 않는 서로 독립인 네 지역의 만족도 점수 위치 차이를 순위로 비교하려 한다. 가장 적절한 검정은?',
      choices: ['Mann-Whitney U 검정', 'Kruskal-Wallis 검정', 'Friedman 검정', 'McNemar 검정'],
      answer: 1,
      conceptId: 'hypothesis',
      explanation: '서로 독립인 세 집단 이상의 위치 차이를 순위로 비교하는 대표적인 비모수 검정은 Kruskal-Wallis 검정입니다. Mann-Whitney U는 독립 2집단, Friedman은 대응·반복 3조건 이상에 사용합니다.',
    },
    {
      id: 302,
      subject: 2,
      bank: 'practice',
      source: 'Notion 학습기록 보강',
      displayId: '노션 보강 7번',
      origin: '2026-09-04 적응형 재시험 기록',
      stem: '같은 참가자 24명이 세 가지 인터페이스를 모두 사용한 뒤 각각의 만족도 순위를 평가했다. 정규성을 가정하기 어렵다. 세 조건의 차이를 비교할 때 가장 적절한 검정은?',
      choices: ['Friedman 검정', 'Kruskal-Wallis 검정', 'Mann-Whitney U 검정', '카이제곱 독립성 검정'],
      answer: 0,
      conceptId: 'hypothesis',
      explanation: '같은 대상이 세 조건 이상에서 반복 측정되었고 순위 기반 비모수 비교가 필요하므로 Friedman 검정을 사용합니다. Kruskal-Wallis는 서로 독립인 세 집단 이상에 사용합니다.',
    },
    {
      id: 303,
      subject: 2,
      bank: 'practice',
      source: 'Notion 학습기록 보강',
      displayId: '노션 보강 8번',
      origin: '2026-09-04 적응형 재시험 기록',
      stem: '정규성을 만족하지 않는 서로 독립인 두 집단의 서비스 대기시간 분포 위치를 순위로 비교하려 한다. 가장 적절한 검정은?',
      choices: ['Mann-Whitney U 검정', 'Kruskal-Wallis 검정', 'Friedman 검정', 'McNemar 검정'],
      answer: 0,
      conceptId: 'hypothesis',
      explanation: '서로 독립인 두 집단을 순위로 비교하는 대표적인 비모수 검정은 Mann-Whitney U 검정입니다. 독립 집단이 세 개 이상이면 Kruskal-Wallis 검정을 고려합니다.',
    },
    {
      id: 304,
      subject: 2,
      bank: 'practice',
      source: 'Notion 학습기록 보강',
      displayId: '노션 보강 9번',
      origin: '2026-09-04 적응형 재시험 기록',
      stem: '같은 사람들에게 교육 전과 교육 후에 보안수칙 준수 여부를 각각 예·아니오로 조사했다. 전후 비율 변화가 유의한지 검정할 때 가장 적절한 것은?',
      choices: ['Mann-Whitney U 검정', 'Kruskal-Wallis 검정', 'Friedman 검정', 'McNemar 검정'],
      answer: 3,
      conceptId: 'hypothesis',
      explanation: '같은 대상의 전후 결과가 예·아니오처럼 이분형 범주 자료이면 짝지어진 범주형 자료의 변화 검정인 McNemar 검정을 사용합니다.',
    },
  ];

  const existingIds = new Set(data.QUESTIONS.map((question) => question.id));
  for (const question of reinforcementQuestions) {
    if (!existingIds.has(question.id)) data.QUESTIONS.push(question);
  }
  data.QUESTIONS.sort((left, right) => left.id - right.id);

  window.NOTION_LEARNING_PROFILE = profile;
})();
