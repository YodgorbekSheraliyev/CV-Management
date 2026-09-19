import { useEffect, useState } from "react";
import { parsePeriod } from "../../utils";
import type { PeriodValue } from "../fields/ValueField";
import {
  createAttributeValue,
  updateAttributeValue,
} from "../../api/attributeValueApi";
import AttributeIcon from "../icons/AttributeIcon";
import ValueField from "../fields/ValueField";
import type { AttributeValue } from "../../models";
import { AttributeType } from "../../enums/enums";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

interface AttributeRowProps {
  attributeValue: AttributeValue;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: (attributeValue: AttributeValue) => void;
  onChange: () => void;
}

function formatDisplayValue(attributeValue: AttributeValue): string {
  const { attribute, value, periodEnd } = attributeValue;

  if (!value) return "Not set";

  switch (attribute.type) {
    case AttributeType.Boolean:
      return value === "true" ? "Yes" : "No";
    case AttributeType.Period:
      return periodEnd ? `${value} → ${periodEnd}` : `${value} → Present`;
    default:
      return value;
  }
}

export default function AttributeRow({
  attributeValue,
  isOpen,
  onToggle,
  onDelete,
  onChange,
}: AttributeRowProps) {
  const initialValue = attributeValue.value;
  const [value, setValue] = useState(initialValue ?? "");
  const [period, setPeriod] = useState<PeriodValue>(() =>
    parsePeriod(initialValue),
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    setValue(initialValue ?? "");
    setPeriod(parsePeriod(initialValue));
    setIsChanged(false);
  }, [initialValue]);

  function handleCancel() {
    setValue(initialValue ?? "");
    setPeriod(parsePeriod(initialValue));
    setError(null);
    setIsChanged(false);
    onToggle();
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const attrib =
        attributeValue.attribute.type === AttributeType.Period
          ? {
              attributeId: attributeValue.attribute.id,
              value: period.start,
              periodEnd: period.end,
            }
          : {
              attributeId: attributeValue.attribute.id,
              value,
            };

      if (attributeValue.id >= 0) {
        await updateAttributeValue(attrib);
      } else {
        await createAttributeValue(attrib);
      }

      setIsChanged(false);
      onToggle();
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save value.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="list-group-item p-0">
      {/* Header */}
      <div className="d-flex align-items-center gap-3 p-3">
        <button
          type="button"
          className="btn btn-link text-decoration-none text-reset p-0 flex-grow-1 text-start d-flex align-items-center gap-3"
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          <span className="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle p-2">
            <AttributeIcon type={attributeValue.attribute.type} />
          </span>

          <span className="flex-grow-1 min-w-0">
            <span className="d-block fw-semibold">
              {attributeValue.attribute.name}
            </span>
            {attributeValue.attribute.type === AttributeType.Text ? (
              <div className="small text-muted">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {formatDisplayValue(attributeValue)}
                </ReactMarkdown>
              </div>
            ) : attributeValue.attribute.type == AttributeType.Image ? null : (
              <span className="d-block small text-muted text-truncate">
                {formatDisplayValue(attributeValue)}
              </span>
            )}
          </span>

          <i
            className={`bi ${isOpen ? "bi-chevron-up" : "bi-chevron-down"} text-muted`}
          />
        </button>

        {/* Actions */}
        <div className="dropdown flex-shrink-0">
          <button
            type="button"
            className="btn btn-sm btn-light"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            aria-label={`Actions for ${attributeValue.attribute.name}`}
          >
            <i className="bi bi-three-dots-vertical" />
          </button>

          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button
                type="button"
                className="dropdown-item"
                onClick={onToggle}
              >
                <i className="bi bi-pencil me-2" />
                Edit
              </button>
            </li>
            <li>
              <button
                type="button"
                className="dropdown-item text-danger"
                onClick={() => onDelete(attributeValue)}
              >
                <i className="bi bi-trash me-2" />
                Delete
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Editor */}
      {isOpen && (
        <div className="border-top bg-light-subtle p-3">
          {attributeValue.attribute.description && (
            <p className="small text-muted mb-3">
              {attributeValue.attribute.description}
            </p>
          )}

          <ValueField
            attribute={attributeValue.attribute}
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
              setIsChanged(true);
              setError(null);
            }}
            period={period}
            onPeriodChange={(newPeriod) => {
              setPeriod(newPeriod);
              setIsChanged(true);
              setError(null);
            }}
          />

          {error && (
            <div className="alert alert-danger py-2 px-3 small mt-3 mb-0">
              {error}
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={saving || !isChanged}
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
                <>
                  <i className="bi bi-check-lg me-1" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
