import { AttributeType } from "../enums/enums";
import type { Attribute } from "../models";
import CalendarIcon from "./CalendarIcon";
import ImageField from "./ImageField";
import MarkdownField from "./MarkdownField";

export interface PeriodValue {
  start: string;
  end: string;
}

interface ValueFieldProps {
  attribute: Attribute;
  value: string;
  onChange: (value: string) => void;
  period: PeriodValue;
  onPeriodChange: (value: PeriodValue) => void;
}

function ValueField({
  attribute,
  value,
  onChange,
  period,
  onPeriodChange,
}: ValueFieldProps) {
  switch (attribute.type) {
    /*
     * STRING
     */
    case AttributeType.String:
      return (
        <div className="value-field">
          <input
            type="text"
            className="form-control form-control-lg"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter a value..."
            autoFocus
          />

          <div className="form-text">Enter a short text value.</div>
        </div>
      );

    /*
     * TEXT / MARKDOWN
     */
    case AttributeType.Text:
      return <MarkdownField value={value} onChange={onChange} />;

    /*
     * IMAGE
     */
    case AttributeType.Image:
      return <ImageField value={value} onChange={onChange} />;

    /*
     * NUMERIC
     */
    case AttributeType.Numeric:
      return (
        <div className="value-field">
          <div className="input-group input-group-lg">
            <span className="input-group-text">#</span>

            <input
              type="number"
              className="form-control"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="0"
              step="any"
              autoFocus
            />
          </div>

          <div className="form-text">Enter a numeric value.</div>
        </div>
      );

    /*
     * DATE
     */
    case AttributeType.Date:
      return (
        <div className="value-field">
          <div className="input-group input-group-lg">
            <span className="input-group-text">
              <CalendarIcon />
            </span>

            <input
              type="date"
              className="form-control"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      );

    /*
     * PERIOD
     */
    case AttributeType.Period:
      return (
        <div className="value-field">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-sm-5">
              <label className="form-label small fw-semibold text-muted">
                Start date
              </label>

              <input
                type="date"
                className="form-control form-control-lg"
                value={period.start}
                onChange={(e) =>
                  onPeriodChange({
                    ...period,
                    start: e.target.value,
                  })
                }
                autoFocus
              />
            </div>

            <div className="col-12 col-sm-2 text-center d-none d-sm-block">
              <span className="text-muted fs-5">→</span>
            </div>

            <div className="col-12 col-sm-5">
              <label className="form-label small fw-semibold text-muted">
                End date
              </label>

              <input
                type="date"
                className="form-control form-control-lg"
                value={period.end}
                min={period.start || undefined}
                onChange={(e) =>
                  onPeriodChange({
                    ...period,
                    end: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="form-text mt-2">
            Leave the end date empty for an ongoing period.
          </div>
        </div>
      );
    /*
     * BOOLEAN
     */
    case AttributeType.Boolean:
      const checked = value === "true";

      return (
        <div className="value-field">
          <div className="form-check form-switch fs-5">
            <input
              id="boolean-value"
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={checked}
              onChange={(e) => onChange(e.target.checked ? "true" : "false")}
            />

            <label className="form-check-label" htmlFor="boolean-value">
              {checked ? "Yes" : "No"}
            </label>
          </div>

          <div className="form-text">
            Select whether this value is true or false.
          </div>
        </div>
      );

    /*
     * DROPDOWN
     */
    case AttributeType.Dropdown:
      if ("options" in attribute && Array.isArray(attribute.options)) {
        return (
          <select
            className="form-select form-select-lg"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          >
            <option value="">Select a value...</option>

            {attribute.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      }

      return (
        <div className="alert alert-warning mb-0">
          <div className="fw-semibold mb-1">
            Dropdown options are not configured
          </div>

          <div className="small">
            Add an options list to the Attribute model before using a dropdown.
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default ValueField;
