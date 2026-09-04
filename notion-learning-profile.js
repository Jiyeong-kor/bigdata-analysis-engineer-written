(() => {
  const data = window.STUDY_DATA;
  if (!data) throw new Error('STUDY_DATA가 생성되기 전에 Notion 학습 프로필을 적용할 수 없습니다.');

  const PROFILE_UPDATED_AT = '2026-09-04';

  const profile = {
    version: 1,
    updatedAt: PROFILE_UPDATED_AT,
    conceptPriority: {
      'nosql-products': 520,
      hypothesis: 240,
      clustering: 230,
      'cluster-evaluation': 260,
      'regression-evaluation': 220,
      metrics: 60,
      platform: -160,
      privacy: -140,
      methodology: -100,
      'data-governance': -80,
      'web-collection': -40,
      regularization: -100,
      'model-validation': -100,
    },
    questionPriority: {
      203: -80,
      109: -80,
      296: 120,
      297: 90,
      298: 90,
      299: 90,
      300: -80,
    },
  };

  const conceptId = 'nosql-products';
  if (!data.CONCEPTS[conceptId]) {
    data.CONCEPTS[conceptId] = {
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
      conceptId,
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
      conceptId,
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
      conceptId,
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
      conceptId,
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
  ];

  const existingIds = new Set(data.QUESTIONS.map((question) => question.id));
  for (const question of reinforcementQuestions) {
    if (!existingIds.has(question.id)) data.QUESTIONS.push(question);
  }
  data.QUESTIONS.sort((left, right) => left.id - right.id);

  window.NOTION_LEARNING_PROFILE = profile;
})();
