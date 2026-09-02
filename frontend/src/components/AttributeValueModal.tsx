import { useEffect, useState } from "react";
import { AttributeType } from "../enums/enums";
import AttributeIcon from "./AttributeIcon";
import type { PeriodValue } from "./ValueField";
import ValueField from "./ValueField";
import type { Attribute } from "../models";

interface AttributeValueModalProps {
  attribute: Attribute;
  initialValue?: string | null;
  onSave: (value: string) => void;
  onCancel: () => void;
  saving?: boolean;
  error?: string | null;
}

function parsePeriod(raw: string | null | undefined): PeriodValue {
  if (!raw) {
    return { start: "", end: "" };
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

function AttributeValueModal({
  attribute,
  initialValue,
  onSave,
  onCancel,
  saving = false,
  error = null,
}: AttributeValueModalProps) {
  const [value, setValue] = useState(initialValue ?? "");

  const [period, setPeriod] = useState<PeriodValue>(() =>
    parsePeriod(initialValue),
  );

  useEffect(() => {
    setValue(initialValue ?? "");
    setPeriod(parsePeriod(initialValue));
  }, [initialValue]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (attribute.type === AttributeType.Period) {
      onSave(
        JSON.stringify({
          start: period.start,
          end: period.end || null,
        }),
      );

      return;
    }

    onSave(value);
  }

  return (
    <div
      className="modal d-block"
      tabIndex={-1}
      role="dialog"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.55)",
      }}
      onClick={onCancel}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        role="document"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="modal-content border-0 shadow-lg"
          style={{
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="modal-header px-4 py-3 border-bottom">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center bg-primary-subtle text-primary"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    flexShrink: 0,
                  }}
                >
                  <AttributeIcon type={attribute.type} />
                </div>

                <div>
                  <h2 className="h5 fw-semibold mb-1">{attribute.name}</h2>

                  {attribute.description && (
                    <p className="text-muted small mb-0">
                      {attribute.description}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onCancel}
                disabled={saving}
              />
            </div>

            {/* Body */}
            <div className="modal-body px-4 py-4">
              <div className="mb-2">
                <label className="form-label fw-semibold mb-2">Value</label>
              </div>

              <ValueField
                attribute={attribute}
                value={value}
                onChange={setValue}
                period={period}
                onPeriodChange={setPeriod}
              />

              {error && (
                <div
                  className="alert alert-danger py-2 px-3 small mt-3 mb-0"
                  role="alert"
                >
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer px-4 py-3 border-top">
              <button
                type="button"
                className="btn btn-light px-3"
                onClick={onCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AttributeValueModal;
