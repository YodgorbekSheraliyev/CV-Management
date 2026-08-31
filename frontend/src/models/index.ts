import type {
  AttributeCategory,
  AttributeType,
  ComparisonType,
  UserRole,
} from "../enums/enums";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  location? : string
  imageUrl?: string;
}

export interface Attribute {
  id: number;
  name: string;
  attributeType: AttributeType;
  category: AttributeCategory;
  description: string;
  isBuiltIn: boolean;
}

export interface AttributeValue {
  id: number;
  userId: number;
  attributeId: number;
  value: string;
  attribute: Attribute;
}

export interface CV {
  id: number;
  userId: number;
  positionId?: number;
  likes: Like[];
  position?: Position;
  user: User;
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
  endDate?: string;
  description: string;
  tags: Tag[];
  userId: number;
}

export interface Tag {
  id: number;
  name: string;
}
