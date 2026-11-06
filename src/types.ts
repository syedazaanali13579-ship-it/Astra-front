export interface WebsiteContent {
  heroHeadline: string;
  heroSubhead: string;
  thesisHeading: string;
  thesisLeft: string;
  thesisRight: string;
  wedges: string[];
  stackIntro: string;
  teamMembers: TeamMember[];
  [key: string]: unknown;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  affiliations: string[];
  linkedinUrl: string;
}

export interface Submission {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  company: string;
  companyUrl: string;
  stage: string;
  message: string;
}

export interface NewSubmission extends Omit<Submission, 'id' | 'createdAt'> {}

export interface LpInquiry {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  organization: string;
  message: string;
}

export interface NewLpInquiry extends Omit<LpInquiry, 'id' | 'createdAt'> {}
