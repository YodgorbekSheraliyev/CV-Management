import type { PeriodValue } from "../components/ValueField";
import { ATTRIBUTE_TYPE_LABELS } from "../constants";
import { AttributeType, ComparisonType } from "../enums/enums";

export function parsePeriod(raw: string | null | undefined): PeriodValue {
  if (!raw) {
    return {
      start: "",
      end: "",
    };
  }

  try {
    const parsed = JSON.parse(raw);

    return {
      start: parsed.start ?? "",
      end: parsed.end ?? "",
    };
  } catch {
    return {
      start: "",
      end: "",
    };
  }
}

export const getComparisonOperators = (type: AttributeType) => {
  switch (type) {
    case AttributeType.Numeric:
      return [
        {
          value: ComparisonType.Equal,
          label: "=",
        },
        {
          value: ComparisonType.NotEqual,
          label: "≠",
        },
        {
          value: ComparisonType.GreaterThan,
          label: ">",
        },
        {
          value: ComparisonType.LessThan,
          label: "<",
        },
        {
          value: ComparisonType.GreaterThanOrEqual,
          label: "≥",
        },
        {
          value: ComparisonType.LessThanOrEqual,
          label: "≤",
        },
      ];

    case AttributeType.Date:
      return [
        {
          value: ComparisonType.Equal,
          label: "On",
        },
        {
          value: ComparisonType.GreaterThan,
          label: "After",
        },
        {
          value: ComparisonType.LessThan,
          label: "Before",
        },
        {
          value: ComparisonType.GreaterThanOrEqual,
          label: "On or after",
        },
        {
          value: ComparisonType.LessThanOrEqual,
          label: "On or before",
        },
      ];

    case AttributeType.Boolean:
      return [
        {
          value: ComparisonType.Equal,
          label: "Is",
        },
      ];

    case AttributeType.Dropdown:
    case AttributeType.String:
    case AttributeType.Text:
    case AttributeType.Image:
    case AttributeType.Period:
    default:
      return [
        {
          value: ComparisonType.Equal,
          label: "Equals",
        },
        {
          value: ComparisonType.NotEqual,
          label: "Does not equal",
        },
      ];
  }
};

export const getAttributeTypeName = (type: AttributeType): string => {
  return ATTRIBUTE_TYPE_LABELS[type];
};

export const getDefaultValue = (type: AttributeType) => {
  if (type === AttributeType.Boolean) {
    return "true";
  }
  return "";
};

export const getDefaultComparison = (type: AttributeType) => {
  if (type === AttributeType.Numeric) {
    return ComparisonType.GreaterThanOrEqual;
  }
  return ComparisonType.Equal;
};

