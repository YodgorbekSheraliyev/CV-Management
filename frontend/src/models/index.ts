import type {
  AttributeCategory,
  AttributeType,
  ComparisonType,
  CVStatus,
  UserRole,
} from "../enums/enums";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  location?: string;
  imageUrl?: string;
}

export interface Attribute {
  id: number;
  name: string;
  category: AttributeCategory;
  type: AttributeType;
  description?: string;
  isBuiltIn: boolean;
  options?: string[];
}

export interface AttributeValue {
  id: number;
  userId: number;
  attributeId: number;
  value: string;
  attribute: Attribute;
  periodEnd?: string;
}

export interface CV extends CVSummary {
  field: CvField[];
  projects: Project[];
}

export interface CVSummary {
  id: number;
  positionId: number;
  positionTitle: string;
  likeCount: number;
  status: CVStatus;
}

interface CvField {
  attribute: Attribute;
  value?: string;
  isEmpty: boolean;
}

export interface Discussion {
  id: number;
  positionId: number;
  posts: Post[];
  position: Position;
}

export interface Like {
  id: number;
  recruiterId?: number;
  cvId: number;
  recruiter?: User;
  cv: CV;
}

export interface Position {
  id: number;
  title: string;
  description: string;
  attributes: Attribute[];
  positionAccessRules: PositionAccessRule[];
  tags?: Tag[];
  cvs?: CV[];
  discussion: Discussion;
  isPublic: boolean;
  maxProjects: number;
}

export interface PositionSummary {
  id: number;
  title: string;
  description: string;
  tags: string[];
  isPublic: boolean;
  maxProjects: number;
}

export interface PositionAccessRule {
  id: number;
  positionId: number;
  attributeId: number;
  comparisonType: ComparisonType;
  value: string;
  attribute: Attribute;
}

export interface Post {
  id: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
  discussionId: number;
  discussion: Discussion;
}

export interface Project {
  id: number;
  name: string;
  startDate: string;
  endDate?: string | null;
  description: string;
  tags: string[];
  userId: number;
}

export interface Tag {
  id: number;
  name: string;
}
