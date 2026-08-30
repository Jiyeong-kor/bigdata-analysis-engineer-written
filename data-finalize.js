(() => {
  const SUBJECTS = {};
  const CONCEPTS = {};
  const QUESTIONS = [];
  for (const part of window.STUDY_DATA_PARTS || []) {
    SUBJECTS[part.subjectId] = part.subject;
    Object.assign(CONCEPTS, part.concepts);
    QUESTIONS.push(...part.questions);
  }
  QUESTIONS.sort((a, b) => a.id - b.id);
  window.STUDY_DATA = { SUBJECTS, CONCEPTS, QUESTIONS };
  delete window.STUDY_DATA_PARTS;
})();
