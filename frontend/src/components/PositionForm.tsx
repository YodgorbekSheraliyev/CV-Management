import { useEffect, useMemo, useState } from "react";
import { ComparisonType } from "../enums/enums";
import type { Attribute } from "../models";
import { getDefaultComparison, getDefaultValue } from "../utils";
import SectionHeader from "./SectionHeader";
import AttributeSelector from "./AttributeSelector";
import AccessRuleEditor from "./AccessRuleEditor";
import TagSelector from "./TagSelector";

export interface AccessRule {
  attributeId: number;
  comparisonType: ComparisonType;
  value: string;
}

export interface PositionFormValues {
  title: string;
  description: string;
  attributeIds: number[];
  accessRules: AccessRule[];
  tagIds: number[];
  isPublic: boolean;
  maxProjects: number;
}

interface PositionFormProps {
  attributes: Attribute[];
  loadingAttributes: boolean;
  initialValues?: PositionFormValues;
  submitLabel: string;
  submittingLabel: string;
  saving: boolean;
  error: string | null;
  onSubmit: (values: PositionFormValues) => void;
  onCancel: () => void;
}

const EMPTY_FORM: PositionFormValues = {
  title: "",
  description: "",
  attributeIds: [],
  accessRules: [],
  tagIds: [],
  isPublic: true,
  maxProjects: 3,
};

const PositionForm = ({
  attributes,
  loadingAttributes,
  initialValues,
  submitLabel,
  submittingLabel,
  saving,
  error,
  onSubmit,
  onCancel,
}: PositionFormProps) => {
  const [form, setForm] = useState<PositionFormValues>(
    initialValues ?? EMPTY_FORM,
  );
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValues) setForm(initialValues);
  }, [initialValues]);

  const selectedAttributes = useMemo(
    () =>
      attributes.filter((attribute) =>
        form.attributeIds.includes(attribute.id),
      ),
    [attributes, form.attributeIds],
  );

  const ruleAttributes = useMemo(
    () =>
      attributes.filter((attribute) =>
        form.accessRules.some((rule) => rule.attributeId === attribute.id),
      ),
    [attributes, form.accessRules],
  );

  const updateField = <K extends keyof PositionFormValues>(
    field: K,
    value: PositionFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleAttribute = (attributeId: number) => {
    setForm((current) => {
      const exists = current.attributeIds.includes(attributeId);
      return {
        ...current,
        attributeIds: exists
          ? current.attributeIds.filter((id) => id !== attributeId)
          : [...current.attributeIds, attributeId],
      };
    });
  };

  const addAccessRule = () => {
    if (attributes.length === 0) return;

    const firstAvailable = attributes.find(
      (attribute) =>
        !form.accessRules.some((rule) => rule.attributeId === attribute.id),
    );
    if (!firstAvailable) return;

    setForm((current) => ({
      ...current,
      accessRules: [
        ...current.accessRules,
        {
          attributeId: firstAvailable.id,
          comparisonType: getDefaultComparison(firstAvailable.type),
          value: getDefaultValue(firstAvailable.type),
        },
      ],
    }));
  };
  const updateAccessRule = (index: number, changes: Partial<AccessRule>) => {
    setForm((current) => ({
      ...current,
      accessRules: current.accessRules.map((rule, i) =>
        i === index ? { ...rule, ...changes } : rule,
      ),
    }));
  };

  const removeAccessRule = (index: number) => {
    setForm((current) => ({
      ...current,
      accessRules: current.accessRules.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!form.title.trim()) {
      setLocalError("Position title is required.");
      return;
    }
    if (form.maxProjects < 0) {
      setLocalError("Maximum projects cannot be negative.");
      return;
    }

    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
    });
  };

  const displayedError = error ?? localError;

  return (
    <form onSubmit={handleSubmit}>
      {displayedError && (
        <div className="alert alert-danger" role="alert">
          {displayedError}
        </div>
      )}

      {/* BASIC INFORMATION */}
      <section className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <SectionHeader
            title="Basic information"
            description="Define the basic information displayed for this position."
          />

          <div className="mb-3">
            <label htmlFor="position-title" className="form-label fw-semibold">
              Title
            </label>
            <input
              id="position-title"
              type="text"
              className="form-control form-control-lg"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Junior Node.JS Developer"
              maxLength={200}
              required
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="position-description"
              className="form-label fw-semibold"
            >
              Short description
            </label>
            <textarea
              id="position-description"
              className="form-control"
              rows={4}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe the position..."
              maxLength={1000}
            />
          </div>
        </div>
      </section>

      {/* ACCESS */}
      <section className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <SectionHeader
            title="Access rules"
            description="Control which candidates can access this position."
          />

          <div className="form-check form-switch mb-4">
            <input
              id="public-position"
              className="form-check-input"
              type="checkbox"
              role="switch"
              checked={form.isPublic}
              onChange={(e) => updateField("isPublic", e.target.checked)}
            />
            <label
              htmlFor="public-position"
              className="form-check-label fw-semibold"
            >
              Public position
            </label>
            <div className="form-text">
              Public positions are accessible to all authenticated candidates.
            </div>
          </div>

          {!form.isPublic && (
            <div className="border rounded-3 p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div className="fw-semibold">Candidate filters</div>
                  <div className="small text-muted">
                    A candidate must satisfy the access rules to access this
                    position.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={addAccessRule}
                  disabled={
                    loadingAttributes ||
                    ruleAttributes.length >= attributes.length
                  }
                >
                  + Add rule
                </button>
              </div>

              {form.accessRules.length === 0 ? (
                <div className="text-center text-muted py-4 border rounded-3 bg-light">
                  <div className="fw-semibold mb-1">No access rules</div>
                  <div className="small">
                    Add a rule to restrict access to candidates matching
                    specific attributes.
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {form.accessRules.map((rule, index) => {
                    const attribute = attributes.find(
                      (item) => item.id === rule.attributeId,
                    );
                    if (!attribute) return null;

                    return (
                      <AccessRuleEditor
                        key={`${index}-${rule.attributeId}`}
                        rule={rule}
                        attribute={attribute}
                        attributes={attributes}
                        existingAttributeIds={form.accessRules
                          .filter((_, i) => i !== index)
                          .map((item) => item.attributeId)}
                        onChange={(changes) => updateAccessRule(index, changes)}
                        onRemove={() => removeAccessRule(index)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CV ATTRIBUTES */}
      <section className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <SectionHeader
            title="CV attributes"
            description="Select attributes from the Attribute Library that should be available in generated CVs."
          />

          {loadingAttributes ? (
            <LoadingAttributes />
          ) : attributes.length === 0 ? (
            <div className="alert alert-light border mb-0">
              No attributes are available.
            </div>
          ) : (
            <>
              <AttributeSelector
                attributes={attributes}
                selectedIds={form.attributeIds}
                onToggle={toggleAttribute}
              />

              {selectedAttributes.length > 0 && (
                <div className="mt-3">
                  <div className="small fw-semibold text-muted mb-2">
                    Selected attributes
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedAttributes.map((attribute) => (
                      <span
                        key={attribute.id}
                        className="badge rounded-pill text-bg-primary px-3 py-2"
                      >
                        {attribute.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* PROJECTS */}
      <section className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <SectionHeader
            title="Projects"
            description="Define which technology tags are used to select relevant candidate projects."
          />

          <div className="mb-3">
            <label htmlFor="max-projects" className="form-label fw-semibold">
              Maximum projects
            </label>
            <input
              id="max-projects"
              type="number"
              className="form-control"
              min={0}
              max={100}
              value={form.maxProjects}
              onChange={(e) =>
                updateField("maxProjects", Math.max(0, Number(e.target.value)))
              }
            />
            <div className="form-text">
              Maximum number of matching projects that can appear in a generated
              CV.
            </div>
          </div>

          <div>
            <label className="form-label fw-semibold">Project tags</label>
            <TagSelector
              selectedIds={form.tagIds}
              onChange={(tagIds) => updateField("tagIds", tagIds)}
            />
            <div className="form-text">
              Select technology tags used when filtering candidate projects.
            </div>
          </div>
        </div>
      </section>

      {/* ACTIONS */}
      <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-light px-4"
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
              {submittingLabel}
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
};

const LoadingAttributes = () => (
  <div className="text-center py-4 text-muted">
    <span
      className="spinner-border spinner-border-sm me-2"
      aria-hidden="true"
    />
    Loading attributes…
  </div>
);

export default PositionForm;
