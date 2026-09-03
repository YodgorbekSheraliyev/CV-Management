import { AttributeCategory, AttributeType } from "../enums/enums";

export const CATEGORY_LABELS: Record<AttributeCategory, string> = {
  [AttributeCategory.Certification]: "Certification",
  [AttributeCategory.DomainKnowledge]: "Domain Knowledge",
  [AttributeCategory.PersonalInformation]: "Personal Information",
  [AttributeCategory.SoftSkills]: "Soft Skills",
  [AttributeCategory.TechnicalSkills]: "Technical Skills",
  [AttributeCategory.Education]: "Education",
  [AttributeCategory.WorkAuthorization]: "Work Authorization",
  [AttributeCategory.WorkPreference]: "Work Preference",
  [AttributeCategory.Salary]: "Salary",
};

export const ATTRIBUTE_TYPE_LABELS: Record<AttributeType, string> = {
  [AttributeType.String]: "String",
  [AttributeType.Text]: "Text",
  [AttributeType.Image]: "Image",
  [AttributeType.Numeric]: "Numeric",
  [AttributeType.Date]: "Date",
  [AttributeType.Period]: "Period",
  [AttributeType.Boolean]: "Boolean",
  [AttributeType.Dropdown]: "Dropdown",
};