(() => {
  const hypothesisConcept = DATA.CONCEPTS.hypothesis;
  if (hypothesisConcept) {
    Object.assign(hypothesisConcept, {
      definition: '가설검정에서는 귀무가설을 세운 뒤 p값(p-value)과 유의수준 α를 직접 비교해 귀무가설을 기각할지 판단합니다.',
      decision: 'p값 ≤ α이면 귀무가설을 기각합니다. p값 > α이면 귀무가설을 기각하지 못합니다. 독립된 두 집단 평균은 독립표본 t-검정, 같은 대상의 전후 평균은 대응표본 t-검정을 사용합니다.',
      distinctions: [
        'p값 ≤ α → 귀무가설 기각',
        'p값 > α → 귀무가설을 기각하지 못함',
        '예: α=0.05, p값=0.08 → 0.08 > 0.05 → 귀무가설을 기각할 근거가 충분하지 않음',
        'p값은 귀무가설이 참일 확률이 아닙니다. 귀무가설이 참이라고 가정했을 때 현재 결과와 같거나 더 극단적인 결과가 나올 확률입니다.',
        '유의수준 α는 귀무가설이 참인데도 기각하는 제1종 오류를 허용하는 기준입니다.',
        '독립표본과 대응표본은 조사 대상이 서로 독립인지, 같은 대상이 짝지어졌는지로 구분합니다.'
      ],
      example: '유의수준이 0.05이고 p값이 0.08이면 0.08 > 0.05이므로 귀무가설을 기각하지 못합니다.',
      miniCheck: {
        q: '유의수준 α=0.05에서 p값=0.08이면 어떤 결론을 내립니까?',
        a: 'p값 > α이므로 귀무가설을 기각할 근거가 충분하지 않습니다.'
      }
    });
  }

  const diagnosticQuestion = DATA.QUESTIONS.find((question) => question.id === 119);
  if (diagnosticQuestion) {
    diagnosticQuestion.explanation = 'p값 0.08 > 유의수준 α 0.05이므로 귀무가설을 기각하지 못합니다. 따라서 귀무가설이 참일 확률이 8%라고 해석하거나 효과가 없음을 증명했다고 말할 수 없습니다.';
  }
})();
