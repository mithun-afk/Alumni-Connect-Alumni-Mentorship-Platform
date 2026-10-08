// Formula: Skills 40% (common skills), Domain 30% (goals/interests matching domains), Goals 20% (careerGoals matching alumni currentRole/headline), Experience 10% (scale of 0-10 years)
exports.calculateMatch = (studentProfile, mentorProfile) => {
  let skillsScore = 0;
  let domainScore = 0;
  let goalsScore = 0;
  let experienceScore = 0;

  // 1. Skills 40%
  const studentSkills = studentProfile.skills || [];
  const mentorSkills = mentorProfile.skills || [];
  if (studentSkills.length > 0 && mentorSkills.length > 0) {
    const commonSkills = studentSkills.filter(s => mentorSkills.includes(s));
    skillsScore = (commonSkills.length / studentSkills.length) * 40;
    if (skillsScore > 40) skillsScore = 40;
  }

  // 2. Domain 30%
  const studentInterests = studentProfile.interests || studentProfile.goals || [];
  const mentorDomain = mentorProfile.domain || '';
  if (mentorDomain && studentInterests.some(interest => mentorDomain.toLowerCase().includes(interest.toLowerCase()))) {
    domainScore = 30;
  }

  // 3. Goals 20%
  const studentCareerGoals = studentProfile.careerGoals || [];
  const mentorRole = mentorProfile.currentRole || mentorProfile.headline || '';
  if (Array.isArray(studentCareerGoals) && studentCareerGoals.length > 0 && mentorRole) {
    if (studentCareerGoals.some(goal => mentorRole.toLowerCase().includes(goal.toLowerCase()))) {
      goalsScore = 20;
    }
  }

  // 4. Experience 10%
  let years = mentorProfile.experienceYears || 0;
  if (!years && mentorProfile.experience && typeof mentorProfile.experience === 'number') {
    years = mentorProfile.experience;
  } else if (!years && mentorProfile.experience && mentorProfile.experience.length > 0) {
    years = mentorProfile.experience.length * 2;
  }
  
  if (years >= 10) {
    experienceScore = 10;
  } else {
    experienceScore = (years / 10) * 10;
  }

  const totalScore = Math.round(skillsScore + domainScore + goalsScore + experienceScore);

  return {
    totalScore,
    breakdown: {
      skills: Math.round(skillsScore),
      domain: Math.round(domainScore),
      goals: Math.round(goalsScore),
      experience: Math.round(experienceScore)
    }
  };
};
