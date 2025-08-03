export function calculateSkillCompatibility(userSkills: any[], requiredSkills: string[]): number {
  if (!userSkills || !requiredSkills || requiredSkills.length === 0) {
    return 0;
  }

  const userSkillMap = new Map(
    userSkills.map(skill => [skill.name.toLowerCase(), skill.proficiency])
  );

  let totalScore = 0;
  let matchedSkills = 0;

  for (const requiredSkill of requiredSkills) {
    const proficiency = userSkillMap.get(requiredSkill.toLowerCase());
    if (proficiency) {
      totalScore += proficiency;
      matchedSkills++;
    }
  }

  return matchedSkills > 0 ? (totalScore / requiredSkills.length) * (matchedSkills / requiredSkills.length) : 0;
}