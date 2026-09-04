(() => {
  const data = window.STUDY_DATA;
  if (!data) throw new Error('STUDY_DATA가 생성되기 전에 12회 채팅 복습문제를 추가할 수 없습니다.');

  const questions = [
    {
      id: 305,
      subject: 1,
      bank: 'chat-review',
      source: '12회 채팅 복습',
      displayId: '채팅 복습 1번',
      origin: '제12회 HDFS·HBase 학습 기록',
      stem: '대용량 파일을 블록 단위로 나누어 여러 서버에 분산 저장하고 복제하여 장애에 대비하려 한다. 가장 직접적으로 해당하는 기술은?',
      choices: ['HBase', 'HDFS', 'MongoDB', 'Cassandra'],
      answer: 1,
      conceptId: 'storage-architecture',
      explanation: 'HDFS는 대용량 파일을 여러 노드에 분산 저장하는 파일 시스템입니다. HBase는 HDFS 위에서 동작하는 분산 데이터베이스이므로 파일 시스템 자체와 구분해야 합니다.'
    },
    {
      id: 306,
      subject: 1,
      bank: 'chat-review',
      source: '12회 채팅 복습',
      displayId: '채팅 복습 2번',
      origin: '제12회 13번 학습 기록',
      stem: 'JSON과 유사한 문서 구조를 저장하고 데이터 증가에 따라 여러 노드로 수평 분할하여 확장하는 기능과 가장 직접적으로 연결되는 NoSQL 제품은?',
      choices: ['Redis', 'MongoDB', 'HBase', 'Chukwa'],
      answer: 1,
      conceptId: 'nosql-products',
      explanation: 'MongoDB는 문서형 NoSQL이며 샤딩을 이용한 수평 확장을 지원합니다. 사용자가 제12회 13번을 풀면서 별도로 암기한 판단 기준입니다.'
    },
    {
      id: 307,
      subject: 1,
      bank: 'chat-review',
      source: '12회 채팅 복습',
      displayId: '채팅 복습 3번',
      origin: '제12회 Sqoop·Chukwa 학습 기록',
      stem: '관계형 데이터베이스의 대용량 테이블을 Hadoop 환경으로 정기적으로 옮기려 한다. 가장 적절한 도구는?',
      choices: ['Chukwa', 'Sqoop', 'Flume', 'MongoDB'],
      answer: 1,
      conceptId: 'web-collection',
      explanation: 'Sqoop은 관계형 데이터베이스와 Hadoop 사이의 대량 데이터 이동에 사용합니다. Chukwa는 Hadoop 기반 분산 시스템의 로그 수집과 모니터링에 초점이 있습니다.'
    },
    {
      id: 308,
      subject: 1,
      bank: 'chat-review',
      source: '12회 채팅 복습',
      displayId: '채팅 복습 4번',
      origin: '제12회 개인정보 판단 학습 기록',
      stem: '다음 중 특정 이용자 계정과 연결되어 저장될 때 개인정보로 판단할 가능성이 가장 직접적인 것은?',
      choices: ['상품 카탈로그의 정가', '서버의 CPU 모델명', '정보통신 서비스 이용 내역', '매장 의자의 개수'],
      answer: 2,
      conceptId: 'privacy',
      explanation: '특정 개인의 서비스 이용 기록은 개인의 행동·이용 이력과 연결되므로 개인정보에 해당할 수 있습니다. 단순 사물 정보와 개인의 이용 기록을 구분합니다.'
    },
    {
      id: 309,
      subject: 4,
      bank: 'chat-review',
      source: '12회 채팅 복습',
      displayId: '채팅 복습 5번',
      origin: '제12회 62번 학습 기록',
      stem: 'ROC 곡선을 그리는 방법에 대한 설명으로 가장 적절한 것은?',
      choices: ['분류 임계값을 변화시키며 x축에 FPR, y축에 TPR을 표시한다.', '하나의 고정 임계값에서 x축에 TPR, y축에 FPR을 표시한다.', '임계값과 관계없이 정밀도와 재현율만 표시한다.', '회귀모형의 잔차와 예측값을 표시한다.'],
      answer: 0,
      conceptId: 'metrics',
      explanation: 'ROC 곡선은 임계값을 바꾸면서 FPR과 TPR의 변화를 그립니다. x축은 FPR이고 y축은 TPR입니다.'
    },
    {
      id: 310,
      subject: 4,
      bank: 'chat-review',
      source: '12회 채팅 복습',
      displayId: '채팅 복습 6번',
      origin: '제12회 63번 학습 기록',
      stem: '일반적인 상자그림 두 개만 보고 직접 판단하기 가장 어려운 정보는 무엇입니까?',
      choices: ['중앙값의 상대적 위치', '사분위 범위의 상대적 크기', '이상치 후보의 존재', '각 집단의 표본 개수 대소'],
      answer: 3,
      conceptId: 'boxplot',
      explanation: '일반적인 상자그림은 중앙값, 사분위 범위와 이상치 후보를 보여 주지만 각 집단의 데이터 개수 대소를 직접 나타내지 않습니다.'
    },
    {
      id: 311,
      subject: 4,
      bank: 'chat-review',
      source: '12회 채팅 복습',
      displayId: '채팅 복습 7번',
      origin: '제12회 64번 학습 기록',
      stem: '여러 개의 수치형 변수를 서로 평행한 축으로 배치하고, 한 관측값의 각 변수 값을 선으로 이어 다변량 패턴과 이상치를 살펴보려 한다. 가장 적절한 시각화는?',
      choices: ['히트맵', '레이더 차트', '평행좌표계', 'Chernoff Face'],
      answer: 2,
      conceptId: 'visualization',
      explanation: '평행좌표계는 여러 변수 축을 평행하게 배치하고 관측값을 선으로 이어 다변량 패턴, 군집, 변수 관계와 이상치를 살펴보는 데 사용합니다.'
    },
    {
      id: 312,
      subject: 4,
      bank: 'chat-review',
      source: '12회 채팅 복습',
      displayId: '채팅 복습 8번',
      origin: '제12회 65번 학습 기록',
      stem: '인포그래픽을 설계할 때 가장 부적절한 원칙은 무엇입니까?',
      choices: ['핵심 메시지를 명확히 제시한다.', '정보 흐름을 쉽게 이해할 수 있도록 구성한다.', '정확한 정보 전달보다 화려한 그래픽 요소를 우선한다.', '핵심 수치를 시각적으로 강조한다.'],
      answer: 2,
      conceptId: 'visualization',
      explanation: '인포그래픽은 장식 자체보다 정보의 정확성과 명확한 전달을 우선해야 합니다.'
    },
    {
      id: 313,
      subject: 4,
      bank: 'chat-review',
      source: '12회 채팅 복습',
      displayId: '채팅 복습 9번',
      origin: '제12회 66번 학습 기록',
      stem: '키와 몸무게처럼 두 수치형 변수의 관계를 보면서 전체 점들의 흐름에서 크게 벗어난 관측치도 함께 찾으려 한다. 가장 적절한 그래프는?',
      choices: ['원그래프', '산점도', '누적 막대그래프', '상자그림 하나'],
      answer: 1,
      conceptId: 'visualization',
      explanation: '산점도는 두 수치형 변수의 관계를 점으로 나타내므로 상관관계와 함께 분포에서 크게 벗어난 이상치도 시각적으로 확인하기 좋습니다.'
    },
    {
      id: 314,
      subject: 4,
      bank: 'chat-review',
      source: '12회 채팅 복습',
      displayId: '채팅 복습 10번',
      origin: '제12회 67번 학습 기록',
      stem: '회귀모형의 잔차와 예측값을 그렸더니 예측값이 커질수록 잔차의 퍼짐도 점점 커지는 깔때기 모양이 나타났다. 가장 직접적으로 의심할 문제는?',
      choices: ['등분산성 위반', '종속변수의 범주형 변환', '독립변수의 단위 불일치', '표본 수가 반드시 부족함'],
      answer: 0,
      conceptId: 'regression',
      explanation: '등분산성은 독립변수 또는 예측값 전 구간에서 잔차 분산이 일정해야 한다는 가정입니다. 잔차의 퍼짐이 구간에 따라 달라지면 이분산성을 의심합니다.'
    },
    {
      id: 315,
      subject: 4,
      bank: 'chat-review',
      source: '12회 채팅 복습',
      displayId: '채팅 복습 11번',
      origin: '제12회 68번 학습 기록',
      stem: '여러 독립변수가 서로 강하게 상관되어 회귀계수의 부호와 크기가 표본에 따라 크게 흔들리고 표준오차도 커졌다. 가장 직접적인 원인은?',
      choices: ['다중공선성', '과소표집', '계층적 군집화', '데이터 누출'],
      answer: 0,
      conceptId: 'regression',
      explanation: '다중공선성은 독립변수 사이의 강한 상관 때문에 회귀계수 추정을 불안정하게 하고 표준오차를 크게 만들 수 있습니다.'
    },
    {
      id: 316,
      subject: 4,
      bank: 'chat-review',
      source: '12회 채팅 복습',
      displayId: '채팅 복습 12번',
      origin: '제12회 69번 학습 기록',
      stem: '운영 중 성능이 떨어진 예측모형을 다시 개선하는 리모델링 방법으로 보기 가장 어려운 것은?',
      choices: ['최신 데이터로 다시 학습한다.', '새 변수를 추가하거나 알고리즘을 변경한다.', '하이퍼파라미터를 다시 튜닝한다.', '외부기관의 정보보안 내규 문구만 수정한다.'],
      answer: 3,
      conceptId: 'model-operations',
      explanation: '최신 데이터 재학습, 변수·알고리즘 변경, 하이퍼파라미터 재튜닝은 모델 자체를 개선하는 리모델링 방법입니다. 정보보안 내규 수정은 운영 거버넌스 활동과 구분합니다.'
    },
    {
      id: 317,
      subject: 4,
      bank: 'chat-review',
      source: '12회 채팅 복습',
      displayId: '채팅 복습 13번',
      origin: '제12회 70번 학습 기록',
      stem: '다음 중 예측 문제와 대표 평가지표의 연결로 가장 적절한 것은?',
      choices: ['다음 달 매출액 예측은 분류이며 F1을 사용한다.', '고객 이탈 여부 예측은 회귀이며 RMSE를 사용한다.', '주택 가격 예측은 회귀이며 MAE나 RMSE를 사용할 수 있다.', '회귀와 분류는 목표변수 형태와 관계없이 같은 지표를 사용한다.'],
      answer: 2,
      conceptId: 'task-metrics',
      explanation: '회귀는 연속형 수치를 예측하며 MAE, MSE, RMSE, R² 등을 사용합니다. 분류는 범주를 예측하며 정확도, 정밀도, 재현율, F1, ROC-AUC 등을 사용합니다.'
    },
    {
      id: 318,
      subject: 4,
      bank: 'chat-review',
      source: '12회 채팅 복습',
      displayId: '채팅 복습 14번',
      origin: '제12회 71번 학습 기록',
      stem: '선형회귀의 잔차 진단에서 기본 전제 가정으로 직접 요구하기 가장 어려운 것은?',
      choices: ['잔차의 합이 0에 가깝다.', '예측값 구간에 따라 잔차 분산이 크게 달라지지 않는다.', '관측값 사이에 자기상관이 없어야 한다.', '잔차와 관측된 종속변수의 상관계수가 반드시 정확히 0이어야 한다.'],
      answer: 3,
      conceptId: 'regression',
      explanation: '선형회귀의 잔차 진단에서는 등분산성과 독립성, 예측값·독립변수와의 체계적 패턴 부재 등을 확인합니다. 잔차와 관측된 종속변수의 상관계수가 반드시 정확히 0이어야 한다는 조건을 기본 가정으로 직접 두지는 않습니다.'
    }
  ];

  const existingIds = new Set(data.QUESTIONS.map((question) => question.id));
  for (const question of questions) {
    if (!existingIds.has(question.id)) data.QUESTIONS.push(question);
  }
  data.QUESTIONS.sort((left, right) => left.id - right.id);

  window.CHAT_REVIEW_12TH = Object.freeze({
    version: 1,
    sourceDate: '2026-09-05',
    questionIds: questions.map((question) => question.id)
  });
})();
