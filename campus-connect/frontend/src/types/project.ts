export interface Project {
  id: string;
  title: string;
  description: string;
  skills: string[];
  team: string[];
  status: 'open' | 'in-progress' | 'completed';
  technicalDetails: {
    requiredSkills: string[];
    prerequisites: string[];
    complexity: 'beginner' | 'intermediate' | 'advanced';
    domain: string[];
    estimatedDuration: number;
    techStack: string[];
  };
  projectType: 'software' | 'hardware' | 'hybrid';
  resourceLinks: {
    title: string;
    url: string;
    type: 'documentation' | 'tutorial' | 'github' | 'other';
  }[];
}