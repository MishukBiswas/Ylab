export interface TeamMember {
  id: string;
  name: string;
  role: string;
  roleOrder?: number;
  bio: string;
  imageUrl: string;
  email: string;
  linkedin: string;
  twitter?: string;
  education?: string[];
  researchInterests?: string[];
  awards?: string[];
  currentPosition?: string;
  achievements?: string;
  isAlumni?: boolean;
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  volume: string;
  year: number;
  doi: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  team: string[];
  funding: string;
  status: 'active' | 'completed' | 'upcoming';
  category: string;
  startDate: string;
  endDate: string;
} 