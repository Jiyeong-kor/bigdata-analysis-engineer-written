((root) => {
  const BIGDATA_SPECIFIC_CONCEPTS = new Set([
    'platform',
    'nosql-products',
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

  const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key);

  function timestampMs(value) {
    const parsed = Date.parse(value || '');
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function weaknessScore(attempt) {
    if (!attempt) return 0;
    if (attempt.status === 'unknown') return 4;
    if (attempt.status === 'wrong') return 3;
    return 0;
  }

  const isWeakAttempt = (attempt) => weaknessScore(attempt) > 0;

  function latestAttemptMap(attempts) {
    const latest = new Map();
    for (const attempt of attempts || []) {
      const previous = latest.get(attempt.questionId);
      if (!previous || timestampMs(attempt.answeredAt) >= timestampMs(previous.answeredAt)) {
        latest.set(attempt.questionId, attempt);
      }
    }
    return latest;
  }

  function hasProfileState(question) {
    const profile = root.NOTION_LEARNING_PROFILE;
    if (!profile) return false;
    return hasOwn(profile.conceptPriority, question.conceptId) || hasOwn(profile.questionPriority, question.id);
  }

  function rawProfilePriorityScore(question) {
    const profile = root.NOTION_LEARNING_PROFILE;
    if (!profile) return 0;
    const conceptScore = Number(profile.conceptPriority?.[question.conceptId] || 0);
    const questionScore = Number(profile.questionPriority?.[question.id] || 0);
    return conceptScore + questionScore;
  }

  function buildRecencyContext(questions, attempts = []) {
    const rawLatest = latestAttemptMap(attempts);
    const questionById = new Map(questions.map((question) => [question.id, question]));
    const profileAt = timestampMs(root.NOTION_LEARNING_PROFILE?.updatedAt);
    const conceptLatestAppAt = new Map();

    for (const [questionId, attempt] of rawLatest.entries()) {
      const question = questionById.get(questionId);
      if (!question) continue;
      const at = timestampMs(attempt.answeredAt);
      if (at > (conceptLatestAppAt.get(question.conceptId) || 0)) {
        conceptLatestAppAt.set(question.conceptId, at);
      }
    }

    const effectiveLatest = new Map();
    for (const [questionId, attempt] of rawLatest.entries()) {
      const question = questionById.get(questionId);
      if (!question) continue;
      if (!hasProfileState(question) || profileAt === 0) {
        effectiveLatest.set(questionId, attempt);
        continue;
      }

      const conceptAppAt = conceptLatestAppAt.get(question.conceptId) || 0;
      const attemptAt = timestampMs(attempt.answeredAt);
      if (conceptAppAt > profileAt && attemptAt > profileAt) {
        effectiveLatest.set(questionId, attempt);
      }
    }

    return {
      rawLatest,
      effectiveLatest,
      conceptLatestAppAt,
      profileAt,
    };
  }

  function latestSourceForQuestion(question, recency) {
    const conceptAppAt = recency?.conceptLatestAppAt?.get(question.conceptId) || 0;
    const profileAt = recency?.profileAt || 0;
    if (hasProfileState(question) && profileAt >= conceptAppAt) return 'notion';
    if (conceptAppAt > 0) return 'app';
    if (hasProfileState(question)) return 'notion';
    return 'none';
  }

  function profilePriorityScore(question, recency = null) {
    const score = rawProfilePriorityScore(question);
    if (!recency || score === 0) return score;
    return latestSourceForQuestion(question, recency) === 'notion' ? score : 0;
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
        weakSeverity: 0,
        correct: 0,
      };
      const severity = weaknessScore(attempt);
      item.seen += 1;
      if (severity > 0) {
        item.weak += 1;
        item.weakSeverity += severity;
      } else {
        item.correct += 1;
      }
      stats.set(question.conceptId, item);
    }

    return stats;
  }

  function bankWeight(question) {
    if (question.bank === 'practice') return 70;
    if (question.bank === 'diagnostic') return 35;
    return 10;
  }

  function candidateScore(question, recency, conceptStats, seed) {
    const attempt = recency.effectiveLatest.get(question.id);
    const historicalAttempt = recency.rawLatest.get(question.id);
    const attemptSeverity = weaknessScore(attempt);
    const concept = conceptStats.get(question.conceptId) || {
      seen: 0,
      weak: 0,
      weakSeverity: 0,
      correct: 0,
    };
    const mastered = concept.seen > 0 && concept.weak === 0 && concept.correct > 0;

    let score = 0;

    if (attemptSeverity > 0) {
      score += 1200 + attemptSeverity * 120;
    } else if (!attempt && concept.weak > 0) {
      score += 940 + Math.min(concept.weakSeverity, 12) * 45;
    } else if (!attempt && !historicalAttempt && concept.seen === 0) {
      score += 820;
    } else if (!attempt && concept.seen === 0) {
      score += 300;
    } else if (!attempt) {
      score += 560;
    } else {
      score += 80;
    }

    score += Math.min(concept.weak, 4) * 110;
    score += Math.min(concept.weakSeverity, 12) * 30;
    if (concept.weak >= 2) score += 180;
    score += bankWeight(question);
    score += profilePriorityScore(question, recency);

    if (BIGDATA_SPECIFIC_CONCEPTS.has(question.conceptId)) {
      score += 190;
      if (question.subject === 1 || question.subject === 4) score += 45;
    }

    if (mastered) score -= 480;
    if (attempt && attemptSeverity === 0) score -= 650;

    return score + stableNoise(seed, question.id);
  }

  function pickTwoForSubject(subjectQuestions, recency, conceptStats, seed) {
    const scored = subjectQuestions
      .map((question) => ({
        question,
        score: candidateScore(question, recency, conceptStats, seed),
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
    const recency = buildRecencyContext(questions, attempts);
    const conceptStats = buildConceptStats(questions, recency.effectiveLatest);
    const selected = [];

    for (let subject = 1; subject <= 4; subject += 1) {
      const subjectQuestions = questions.filter((question) => question.subject === subject);
      selected.push(...pickTwoForSubject(subjectQuestions, recency, conceptStats, seed));
    }

    return selected
      .sort((left, right) =>
        stableNoise(`${seed}:order`, left.question.id) -
        stableNoise(`${seed}:order`, right.question.id)
      )
      .map((item) => item.question.id);
  }

  function describeDailySet({ ids, questions, attempts = [] }) {
    const recency = buildRecencyContext(questions, attempts);
    const questionById = new Map(questions.map((question) => [question.id, question]));
    const selected = ids.map((id) => questionById.get(id)).filter(Boolean);

    return {
      total: selected.length,
      weak: selected.filter((question) => isWeakAttempt(recency.effectiveLatest.get(question.id))).length,
      unseen: selected.filter((question) => !recency.rawLatest.has(question.id)).length,
      bigdataSpecific: selected.filter((question) => BIGDATA_SPECIFIC_CONCEPTS.has(question.conceptId)).length,
      profilePriority: selected.filter((question) => profilePriorityScore(question, recency) > 0).length,
      profileDate: root.NOTION_LEARNING_PROFILE?.updatedAt || null,
      subjects: [1, 2, 3, 4].map((subject) =>
        selected.filter((question) => question.subject === subject).length
      ),
    };
  }

  root.DAILY_SELECTION = {
    BIGDATA_SPECIFIC_CONCEPTS,
    weaknessScore,
    isWeakAttempt,
    buildRecencyContext,
    latestSourceForQuestion,
    profilePriorityScore,
    selectDailyQuestionIds,
    describeDailySet,
  };
})(typeof window !== 'undefined' ? window : globalThis);
