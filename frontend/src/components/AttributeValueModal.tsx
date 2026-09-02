import { useState } from "react";
import type { Attribute } from "../models";
import { AttributeType } from "../enums/enums";

interface AttributeValueModalProps {
  attribute: Attribute;
  initialValue?: string | null;
  onSave: (value: string) => void;
  onCancel: () => void;
  saving?: boolean;
  error?: string | null;
}

interface PeriodValue {
  start: string;
  end: string;
}

function parsePeriod(raw: string | null | undefined): PeriodValue {
  if (!raw) return { start: "", end: "" };
  try {
    const parsed = JSON.parse(raw);
    return { start: parsed.start ?? "", end: parsed.end ?? "" };
  } catch {
    return { start: "", end: "" };
  }
}

export default function AttributeValueModal({
  attribute,
  initialValue,
  onSave,
  onCancel,
  saving = false,
  error = null,
}: AttributeValueModalProps) {
  const [value, setValue] = useState(initialValue ?? "");
  const [period, setPeriod] = useState<PeriodValue>(() => parsePeriod(initialValue));

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (attribute.type === AttributeType.Period) {
      onSave(JSON.stringify({ start: period.start, end: period.end || null }));
      return;
    }

    onSave(value);
  }

  return (
    <div
      className="modal d-block"
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
      onClick={onCancel}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        role="document"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="modal-content border-0 shadow"
          style={{ borderRadius: "18px", overflow: "hidden" }}
        >
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="modal-header px-4 py-3">
              <div>
                <h2 className="h5 fw-bold mb-1">{attribute.name}</h2>
                {attribute.description && (
                  <p className="text-muted small mb-0">{attribute.description}</p>
                )}
              </div>

              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onCancel}
              />
            </div>

            {/* Body */}
            <div className="modal-body px-4">
              <ValueField attribute={attribute} value={value} onChange={setValue} period={period} onPeriodChange={setPeriod} />

              {error && (
                <div className="alert alert-danger py-2 small mt-3 mb-0" role="alert">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer px-4">
              <button type="button" className="btn btn-light" onClick={onCancel} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface ValueFieldProps {
  attribute: Attribute;
  value: string;
  onChange: (value: string) => void;
  period: PeriodValue;
  onPeriodChange: (value: PeriodValue) => void;
}

function ValueField({ attribute, value, onChange, period, onPeriodChange }: ValueFieldProps) {
  switch (attribute.type) {
    case AttributeType.String:
      return (
        <input
          type="text"
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
      );

    case AttributeType.Text:
      return (
        <textarea
          className="form-control"
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Markdown formatting supported…"
          autoFocus
        />
      );

    case AttributeType.Image:
      // Drag-and-drop-to-cloud-storage upload isn't wired up yet — direct URL as a placeholder.
      return (
        <input
          type="url"
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          autoFocus
        />
      );

    case AttributeType.Numeric:
      return (
        <input
          type="number"
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          step="any"
          autoFocus
        />
      );

    case AttributeType.Date:
      return (
        <input
          type="date"
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
      );

    case AttributeType.Period:
      return (
        <div className="d-flex align-items-center gap-2">
          <input
            type="date"
            className="form-control"
            value={period.start}
            onChange={(e) => onPeriodChange({ ...period, start: e.target.value })}
            autoFocus
          />
          <span className="text-muted small">to</span>
          <input
            type="date"
            className="form-control"
            value={period.end}
            onChange={(e) => onPeriodChange({ ...period, end: e.target.value })}
          />
        </div>
      );

    case AttributeType.Boolean:
      return (
        <div className="form-check form-switch">
          <input
            type="checkbox"
            className="form-check-input"
            id="attribute-value-boolean"
            checked={value === "true"}
            onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          />
          <label className="form-check-label" htmlFor="attribute-value-boolean">
            {value === "true" ? "Yes" : "No"}
          </label>
        </div>
      );

    case AttributeType.Dropdown:
      // Attribute doesn't carry a modeled options list yet — falling back to free text
      // until dropdown options are added to the model, same gap flagged earlier.
      return (
        <input
          type="text"
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter one of the allowed options…"
          autoFocus
        />
      );

    default:
      return null;
  }
}