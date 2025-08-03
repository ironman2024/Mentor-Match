import User from '../models/User';

export class MentorMatchingService {
  static async findMentors(studentId: string, skillsNeeded: string[], projectType?: string) {
    const student = await User.findById(studentId);
    if (!student) throw new Error('Student not found');

    const mentors = await User.aggregate([
      {
        $match: {
          role: { $in: ['alumni', 'faculty'] },
          mentorshipAvailability: true,
          _id: { $ne: student._id }
        }
      },
      {
        $addFields: {
          skillMatch: {
            $size: {
              $setIntersection: [
                '$areasOfExpertise',
                skillsNeeded
              ]
            }
          },
          experienceMatch: {
            $cond: [
              { $gt: [{ $size: '$experiences' }, 0] },
              1, 0
            ]
          }
        }
      },
      {
        $addFields: {
          matchScore: {
            $add: [
              { $multiply: ['$skillMatch', 4] },
              { $multiply: ['$mentorRating', 2] },
              { $multiply: ['$experienceMatch', 1] },
              { $divide: ['$reputation', 50] }
            ]
          }
        }
      },
      { $sort: { matchScore: -1, mentorRating: -1 } },
      { $limit: 10 }
    ]);

    return mentors.map(mentor => ({
      ...mentor,
      compatibilityReason: this.generateCompatibilityReason(mentor, skillsNeeded)
    }));
  }

  private static generateCompatibilityReason(mentor: any, skillsNeeded: string[]) {
    const matchedSkills = mentor.areasOfExpertise.filter((skill: string) => 
      skillsNeeded.includes(skill)
    );
    
    if (matchedSkills.length > 0) {
      return `Expert in ${matchedSkills.join(', ')} with ${mentor.mentorRating.toFixed(1)}⭐ rating`;
    }
    return `Experienced professional with ${mentor.mentorRating.toFixed(1)}⭐ rating`;
  }

  static async getMentorRecommendations(studentId: string) {
    const student = await User.findById(studentId);
    if (!student) throw new Error('Student not found');

    const studentSkills = student.skills.map(s => s.name);
    const mentors = await this.findMentors(studentId, studentSkills);

    return {
      topMentors: mentors.slice(0, 5),
      skillBasedMentors: mentors.filter(m => m.skillMatch > 0),
      highRatedMentors: mentors.filter(m => m.mentorRating >= 4.0)
    };
  }
}