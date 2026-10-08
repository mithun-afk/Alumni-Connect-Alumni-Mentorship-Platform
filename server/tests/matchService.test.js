const matchService = require('../src/services/matchService');

describe('Match Service', () => {
  it('should calculate accurate match score', () => {
    const student = {
      skills: ['React', 'Node.js', 'MongoDB'],
      interests: ['Web Development'],
      careerGoals: 'Frontend Engineer'
    };

    const mentor = {
      skills: ['React', 'Node.js', 'AWS', 'Docker'],
      domain: 'Web Development',
      currentRole: 'Frontend Engineer',
      experienceYears: 5
    };

    const match = matchService.calculateMatch(student, mentor);
    
    // Skills: 2 common ('React', 'Node.js') out of 3 = 66% of 40 = 26.6 -> 27
    // Domain: 'Web Development' matches = 30
    // Goals: 'Frontend Engineer' matches = 20
    // Experience: 5 years out of 10 = 5
    // Total: 27 + 30 + 20 + 5 = 82

    expect(match.totalScore).toBeGreaterThan(0);
    expect(match.breakdown.domain).toBe(30);
    expect(match.breakdown.goals).toBe(20);
    expect(match.breakdown.experience).toBe(5);
  });
});
