((root) => {
  const BIGDATA_SPECIFIC_CONCEPTS = new Set([
    'platform',
    'web-collection',
    'ai-governance',
    'storage-architecture',
    'data-governance',
    'loading-distribution',
    'spatial-multivariate',
    'model-operations',
    'business-deployment',
    'leakage',
    'hyperparameter',
    'validation',
  ]);

  const isWeakAttempt = (attempt) =>
    Boolean(attempt) && (attempt.status !== 'correct' || attempt.confidence === 'uncertain');

  function latestAttemptMap(attempts) {
    const latest = new Map();
    for (const attempt of attempts || []) latest.set(attempt.questionId, attempt);
    return latest;
  }

  function stableNoise(seed, questionId) {
    const text = `${seed}:${questionId}`;
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 4294967295;
  }

  function buildConceptStats(questions, latest) {
    const questionById = new Map(questions.map((question) => [question.id, question]));
    const stats = new Map();

    for (const [questionId, attempt] of latest.entries()) {
      const question = questionById.get(questionId);
      if (!question) continue;
      const item = stats.get(question.conceptId) || {
        seen: 0,
        weak: 0,
        confidentCorrect: 0,
      };
      item.seen += 1;
      if (isWeakAttempt(attempt)) item.weak += 1;
      else item.confidentCorrect += 1;
      stats.set(question.conceptId, item);
    }

    return stats;
  }

  function bankWeight(question) {
    if (question.bank === 'practice') return 70;
    if (question.bank === 'diagnostic') return 35;
    return 10;
  }

  function candidateScore(question, latest, conceptStats, seed) {
    const attempt = latest.get(question.id);
    const concept = conceptStats.get(question.conceptId) || {
      seen: 0,
      weak: 0,
      confidentCorrect: 0,
    };
    const mastered = concept.seen > 0 && concept.weak === 0 && concept.confidentCorrect > 0;

    let score = 0;

    if (isWeakAttempt(attempt)) {
      score += 1400;
    } else if (!attempt && concept.weak > 0) {
      score += 1120;
    } else if (!attempt && concept.seen === 0) {
      score += 820;
    } else if (!attempt) {
      score += 560;
    } else {
      score += 80;
    }

    score += Math.min(concept.weak, 4) * 90;
    score += bankWeight(question);

    if (BIGDATA_SPECIFIC_CONCEPTS.has(question.conceptId)) {
      score += 190;
      if (question.subject === 1 || question.subject === 4) score += 45;
    }

    if (mastered) score -= 480;
    if (attempt && !isWeakAttempt(attempt)) score -= 650;

    return score + stableNoise(seed, question.id);
  }

  function pickTwoForSubject(subjectQuestions, latest, conceptStats, seed) {
    const scored = subjectQuestions
      .map((question) => ({
        question,
        score: candidateScore(question, latest, conceptStats, seed),
      }))
      .sort((left, right) => right.score - left.score || left.question.id - right.question.id);

    const selected = [];
    const concepts = new Set();

    for (const item of scored) {
      if (concepts.has(item.question.conceptId)) continue;
      selected.push(item);
      concepts.add(item.question.conceptId);
      if (selected.length === 2) return selected;
    }

    for (const item of scored) {
      if (selected.some((selectedItem) => selectedItem.question.id === item.question.id)) continue;
      selected.push(item);
      if (selected.length === 2) break;
    }

    return selected;
  }

  function selectDailyQuestionIds({ questions, attempts = [], seed = 'daily' }) {
    const latest = latestAttemptMap(attempts);
    const conceptStats = buildConceptStats(questions, latest);
    const selected = [];

    for (let subject = 1; subject <= 4; subject += 1) {
      const subjectQuestions = questions.filter((question) => question.subject === subject);
      selected.push(...pickTwoForSubject(subjectQuestions, latest, conceptStats, seed));
    }

    return selected
      .sort((left, right) =>
        stableNoise(`${seed}:order`, left.question.id) -
        stableNoise(`${seed}:order`, right.question.id)
      )
      .map((item) => item.question.id);
  }

  function describeDailySet({ ids, questions, attempts = [] }) {
    const latest = latestAttemptMap(attempts);
    const questionById = new Map(questions.map((question) => [question.id, question]));
    const selected = ids.map((id) => questionById.get(id)).filter(Boolean);

    return {
      total: selected.length,
      weak: selected.filter((question) => isWeakAttempt(latest.get(question.id))).length,
      unseen: selected.filter((question) => !latest.has(question.id)).length,
      bigdataSpecific: selected.filter((question) => BIGDATA_SPECIFIC_CONCEPTS.has(question.conceptId)).length,
      subjects: [1, 2, 3, 4].map((subject) =>
        selected.filter((question) => question.subject === subject).length
      ),
    };
  }

  root.DAILY_SELECTION = {
    BIGDATA_SPECIFIC_CONCEPTS,
    isWeakAttempt,
    selectDailyQuestionIds,
    describeDailySet,
  };
})(typeof window !== 'undefined' ? window : globalThis);
