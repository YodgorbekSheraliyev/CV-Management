import { useEffect, useState } from "react";

import { AttributeType } from "../enums/enums";
import type { AttributeValue, User } from "../models";

import {
  createAttributeValue,
  updateAttributeValue,
} from "../api/attributeValueApi";

import AttributeIcon from "./AttributeIcon";
import ValueField from "./ValueField";
import type { PeriodValue } from "./ValueField";
import { parsePeriod } from "../utils";

interface ValueCardProps {
  attributeValue: AttributeValue;
  user: User;
  onDelete: (attributeValue: AttributeValue) => void;
}


export default function ValueCard({
  attributeValue,
  user,
  onDelete,
}: ValueCardProps) {
  const initialValue = attributeValue.value;
  const [value, setValue] = useState(initialValue ?? "");
  const [period, setPeriod] = useState<PeriodValue>(() => parsePeriod(initialValue));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setValue(initialValue ?? "");
    setPeriod(parsePeriod(initialValue));
  }, [initialValue]);

  function handleCancel() {
    setValue(initialValue ?? "");
    setPeriod(parsePeriod(initialValue));
    setError(null);
    setEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const attrib: Omit<AttributeValue, "id" | "attribute"> =
        attributeValue.attribute.type === AttributeType.Period
          ? {
              attributeId: attributeValue.attribute.id,
              userId: user.id,
              value: period.start,
              periodEnd: period.end,
            }
          : {
              attributeId: attributeValue.attribute.id,
              userId: user.id,
              value,
            };

      if (attributeValue.id >= 0) {
        await updateAttributeValue(attrib);
      } else {
        await createAttributeValue(attrib);
      }

      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save value.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="card h-100 w-100 border-0 shadow-sm"
      style={{
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <div style={{ height: "5px" }} />

      <div className="card-body p-3 d-flex flex-column">
        <div className="d-flex align-items-center mb-3">
          <span
            className="text-uppercase fw-semibold text-secondary"
            style={{
              fontSize: "12px",
              letterSpacing: "0.5px",
            }}
          >
            {attributeValue.attribute.name}
          </span>

          <div
            className="flex-grow-1 ms-3"
            style={{
              height: "1px",
              backgroundColor: "#dee2e6",
            }}
          />
        </div>

        <div className="d-flex align-items-center gap-2 mb-3">
          <div
            className="d-flex align-items-center justify-content-center bg-primary-subtle text-primary"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "9px",
              flexShrink: 0,
            }}
          >
            <AttributeIcon type={attributeValue.attribute.type} />
          </div>

          <div className="flex-grow-1 min-w-0">
            <div className="d-flex align-items-center gap-2">
              <span
                className="badge rounded-2"
                style={{
                  backgroundColor: "#f1f3f5",
                  color: "#495057",
                  fontWeight: 500,
                  padding: "6px 8px",
                }}
              >
                {AttributeType[attributeValue.attribute.type]}
              </span>
            </div>

            {attributeValue.attribute.description && (
              <div className="small text-muted mt-1">
                {attributeValue.attribute.description}
              </div>
            )}
          </div>

          <div
            className="dropdown flex-shrink-0"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <button
              type="button"
              className="btn btn-sm btn-light"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label={`Actions for ${attributeValue.attribute.name}`}
            >
              ⋮
            </button>

            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button
                  type="button"
                  className="dropdown-item text-danger"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(attributeValue);
                  }}
                >
                  Delete
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="p-3 rounded-3 d-flex flex-column flex-grow-1"
          style={{
            backgroundColor: "#f8f9fa",
            border: "1px solid #e9ecef",
          }}
        >
          <div className="small fw-semibold text-muted mb-2">Value</div>

          <div className="flex-grow-1">
            <ValueField
              attribute={attributeValue.attribute}
              value={value}
              onChange={(newValue) => {
                setValue(newValue);
                setEditing(true);
                setError(null);
              }}
              period={period}
              onPeriodChange={(newPeriod) => {
                setPeriod(newPeriod);
                setEditing(true);
                setError(null);
              }}
            />
          </div>

          {error && (
            <div
              className="alert alert-danger py-2 px-3 small mt-3 mb-0"
              role="alert"
            >
              {error}
            </div>
          )}

          {editing && (
            <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
              <button
                type="button"
                className="btn btn-light px-3"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={handleSave}
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
          )}
        </div>
      </div>
    </div>
  );
}
