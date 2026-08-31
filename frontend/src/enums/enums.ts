export enum AttributeType {
  String,
  Text,
  Image,
  Numeric,
  Date,
  Period,
  Boolean,
  Dropdown,
}

export enum AttributeCategory {
  Certification,
  DomainKnowledge,
  PersonalInformation,
  SoftSkills,
  TechnicalSkills,
  Education,
  WorkAuthorization,
  WorkPreference,
  Salary,
}

export enum UserRole {
  Candidate = "Candidate",
  Recruiter = "Recruited",
  Administrator = "Administrator",
}

export enum ComparisonType {
  LessThan,
  LessThanOrEqual,
  GreaterThan,
  GreaterThanOrEqual,
  Equal,
}
