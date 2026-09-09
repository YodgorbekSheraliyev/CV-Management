import { AttributeType } from "../enums/enums";
import type { Attribute } from "../models";

interface RuleValueInputProps {
  attribute: Attribute;
  value: string;
  onChange: (value: string) => void;
}

const RuleValueInput = ({
  attribute,
  value,
  onChange,
}: RuleValueInputProps) => {
  switch (attribute.type) {
    case AttributeType.Numeric:
      return (
        <input
          type="number"
          className="form-control"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. 7.0"
        />
      );

    case AttributeType.Date:
      return (
        <input
          type="date"
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case AttributeType.Boolean:
      return (
        <select
          className="form-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="true">Checked</option>
          <option value="false">Not checked</option>
        </select>
      );

    case AttributeType.Dropdown:
      if ("options" in attribute && Array.isArray(attribute.options)) {
        return (
          <select
            className="form-select"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Select...</option>
            {attribute.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      }
      return (
        <input
          type="text"
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Value"
        />
      );

    case AttributeType.Period:
      return (
        <input
          type="text"
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Period value"
        />
      );

    default:
      return (
        <input
          type="text"
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Value"
        />
      );
  }
};

export default RuleValueInput;
