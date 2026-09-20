import { AttributeType } from "../enums/enums";
import type { Attribute } from "../models";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  switch (attribute.type) {
    case AttributeType.Numeric:
      return (
        <input
          type="number"
          className="form-control"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("ruleValue.numericPlaceholder")}
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
          <option value="true">{t("ruleValue.checked")}</option>
          <option value="false">{t("ruleValue.notChecked")}</option>
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
            <option value="">{t("ruleValue.select")}</option>
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
          placeholder={t("common.value")}
        />
      );

    case AttributeType.Period:
      return (
        <input
          type="text"
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("ruleValue.periodValue")}
        />
      );

    default:
      return (
        <input
          type="text"
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("common.value")}
        />
      );
  }
};

export default RuleValueInput;
