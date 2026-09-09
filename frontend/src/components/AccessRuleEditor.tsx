import { useEffect } from "react";
import type { Attribute } from "../models";
import {
  getComparisonOperators,
  getDefaultComparison,
  getDefaultValue,
} from "../utils";
import type { AccessRule } from "./PositionForm";
import RuleValueInput from "./RuleValueInput";
import type { ComparisonType } from "../enums/enums";

interface AccessRuleEditorProps {
  rule: AccessRule;
  attribute: Attribute;
  attributes: Attribute[];
  existingAttributeIds: number[];
  onChange: (changes: Partial<AccessRule>) => void;
  onRemove: () => void;
}

const AccessRuleEditor = ({
  rule,
  attribute,
  attributes,
  existingAttributeIds,
  onChange,
  onRemove,
}: AccessRuleEditorProps) => {
  const availableAttributes = attributes.filter(
    (item) =>
      item.id === rule.attributeId || !existingAttributeIds.includes(item.id),
  );

  const operators = getComparisonOperators(attribute.type);
  const operatorExists = operators.some(
    (operator) => operator.value === rule.comparisonType,
  );

  useEffect(() => {
    if (!operatorExists && operators.length > 0) {
      onChange({ comparisonType: operators[0].value });
    }
  }, [operatorExists, operators, onChange]);

  const handleAttributeChange = (attributeId: number) => {
    const newAttribute = attributes.find((item) => item.id === attributeId);
    if (!newAttribute) return;

    onChange({
      attributeId,
      comparisonType: getDefaultComparison(newAttribute.type),
      value: getDefaultValue(newAttribute.type),
    });
  };

  return (
    <div className="border rounded-3 p-3">
      <div className="row g-2 align-items-end">
        <div className="col-12 col-md-4">
          <label className="form-label small fw-semibold">Attribute</label>
          <select
            className="form-select"
            value={rule.attributeId}
            onChange={(e) => handleAttributeChange(Number(e.target.value))}
          >
            {availableAttributes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-3">
          <label className="form-label small fw-semibold">Operator</label>
          <select
            className="form-select"
            value={rule.comparisonType}
            onChange={(e) =>
              onChange({
                comparisonType: Number(e.target.value) as ComparisonType,
              })
            }
          >
            {operators.map((operator) => (
              <option key={operator.value} value={operator.value}>
                {operator.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md">
          <label className="form-label small fw-semibold">Value</label>
          <RuleValueInput
            attribute={attribute}
            value={rule.value}
            onChange={(value) => onChange({ value })}
          />
        </div>

        <div className="col-12 col-md-auto">
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={onRemove}
            aria-label="Remove access rule"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessRuleEditor;
