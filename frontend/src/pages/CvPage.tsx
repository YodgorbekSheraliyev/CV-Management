import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/navbar/NavBar";
import ToastNotification from "../components/notifications/ToastNotification";
import ValueField from "../components/fields/ValueField";
import type { PeriodValue } from "../components/fields/ValueField";
import { useAuth } from "../hooks/auth";
import type { CV, CvAttribute } from "../models";
import { AttributeCategory, AttributeType, CVStatus, UserRole } from "../enums/enums";
import { CATEGORY_LABELS } from "../constants";
import { parsePeriod } from "../utils";
import {
  getCvById,
  updateCvAttributeValue,
  deleteCv,
  publishCv,
} from "../api/cvApi";

const groupAttributes = (attributes: CvAttribute[]) => {
  const byCategory = new Map<number, CvAttribute[]>();

  for (const attribute of attributes) {
    const category = attribute.attribute.category;

    if (!byCategory.has(category)) {
      byCategory.set(category, []);
    }

    byCategory.get(category)!.push(attribute);
  }

  const sections: {
    title: string;
    attributes: CvAttribute[];
  }[] = [];

  for (const [category, attributesForCategory] of byCategory) {
    sections.push({
      title:
        CATEGORY_LABELS[category as AttributeCategory] ?? "Other",
      attributes: attributesForCategory,
    });
  }

  return sections;
};

const displayValue = (attribute: CvAttribute): string => {
  if (!attribute.value) {
    return "";
  }

  if (attribute.attribute.type === AttributeType.Period) {
    const { start, end } = parsePeriod(attribute.value);

    if (!start && !end) {
      return "";
    }

    return `${start || "?"} → ${end || "Present"}`;
  }

  if (attribute.attribute.type === AttributeType.Boolean) {
    return attribute.value === "true" ? "Yes" : "No";
  }

  return attribute.value;
};

const isAttributeFilled = (attribute: CvAttribute): boolean => {
  if (!attribute.value) {
    return false;
  }

  if (attribute.attribute.type === AttributeType.Period) {
    const { start, end } = parsePeriod(attribute.value);

    return !!start || !!end;
  }

  return attribute.value.trim() !== "";
};

const CvPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cv, setCv] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);

  const [editingAttributeId, setEditingAttributeId] = useState<number | null>(
    null,
  );

  const [draftValue, setDraftValue] = useState("");

  const [draftPeriod, setDraftPeriod] = useState<PeriodValue>({
    start: "",
    end: "",
  });

  const [savingAttributeId, setSavingAttributeId] = useState<number | null>(
    null,
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const canEdit = user?.role !== UserRole.Recruiter;

  useEffect(() => {
    if (!id || !user) {
      return;
    }

    const load = async () => {
      setLoading(true);

      try {
        const cvId = Number(id);

        if (Number.isNaN(cvId)) {
          throw new Error("Invalid CV id.");
        }

        const result = await getCvById(cvId, user.id);

        setCv(result);
      } catch (err: any) {
        setToast({
          message: err.message ?? "Could not load this CV.",
          type: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, user?.id]);

  const startEditing = (attribute: CvAttribute) => {
    if (!canEdit) {
      return;
    }

    setEditingAttributeId(attribute.attributeId);

    if (attribute.attribute.type === AttributeType.Period) {
      setDraftPeriod(parsePeriod(attribute.value));
      setDraftValue("");
      return;
    }

    if (attribute.attribute.type === AttributeType.Boolean) {
      setDraftValue(attribute.value === "true" ? "true" : "false");
      return;
    }

    setDraftValue(attribute.value ?? "");
  };

  const cancelEditing = () => {
    setEditingAttributeId(null);

    setDraftValue("");

    setDraftPeriod({
      start: "",
      end: "",
    });
  };

  const saveAttribute = async (attribute: CvAttribute) => {
    if (!cv || !user) {
      return;
    }

    const valueToSave =
      attribute.attribute.type === AttributeType.Period
        ? JSON.stringify(draftPeriod)
        : draftValue;

    /*
     * IMPORTANT:
     *
     * attribute.id       = AttributeValue ID
     * attribute.attributeId = Attribute definition ID
     *
     * The update API needs the AttributeValue ID.
     */
    setSavingAttributeId(attribute.attributeId);

    try {
      await updateCvAttributeValue(
        {
          cvId: cv.id,
          attributeValueId: attribute.id,
          value: valueToSave,
        },
        user.id,
      );

      setCv((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          attributes: current.attributes.map((item) =>
            item.attributeId === attribute.attributeId
              ? {
                  ...item,
                  value: valueToSave,
                  isEmpty: !isAttributeFilled({
                    ...item,
                    value: valueToSave,
                  }),
                }
              : item,
          ),
        };
      });

      setToast({
        message: "Attribute updated.",
        type: "success",
      });

      cancelEditing();
    } catch (err: any) {
      setToast({
        message: err.message ?? "Could not update this attribute.",
        type: "danger",
      });
    } finally {
      setSavingAttributeId(null);
    }
  };

  const handleDeleteCv = async () => {
    if (!cv || !user || deleting) {
      return;
    }

    setDeleting(true);

    try {
      await deleteCv(cv.id, user.id);
      navigate("/");
    } catch (err: any) {
      setToast({
        message: err.message ?? "Could not delete this CV.",
        type: "danger",
      });

      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handlePublish = async () => {
    if (!cv || !user || publishing) {
      return;
    }

    setPublishing(true);

    try {
      const updated = await publishCv({
        id: cv.id,
        userId: user.id,
      });

      setCv(updated);

      setToast({
        message: "CV published.",
        type: "success",
      });
    } catch (err: any) {
      setToast({
        message: err.message ?? "Could not publish this CV.",
        type: "danger",
      });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <NavBar />

        <main className="container py-5 text-center text-muted">
          Loading CV…
        </main>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-vh-100 bg-light">
        <NavBar />

        <ToastNotification toast={toast} onClose={() => setToast(null)} />

        <main className="container py-5 text-center">
          <p className="text-danger mb-3">CV not found.</p>

          <Link to="/cvs" className="btn btn-outline-secondary">
            Back to my CVs
          </Link>
        </main>
      </div>
    );
  }

  const attributes = cv.attributes ?? [];
  const projects = cv.projects ?? [];

  const sections = groupAttributes(attributes);

  const allFilled = attributes.every(isAttributeFilled);

  const isDraft = cv.status === CVStatus.Draft;
  const isPublished = cv.status === CVStatus.Published;

  return (
    <div className="min-vh-100 bg-light">
      <NavBar />

      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <main className="container py-4 py-md-5" style={{ maxWidth: 860 }}>
        {/* Header actions */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <div className="d-flex align-items-center gap-2">
            <span
              className={`badge rounded-pill px-3 py-2 ${
                isDraft
                  ? "text-bg-warning"
                  : isPublished
                    ? "text-bg-success"
                    : "text-bg-secondary"
              }`}
            >
              {isDraft ? "Draft" : isPublished ? "Published" : "Other"}
            </span>
          </div>

          <div className="d-flex gap-2">
            <Link
              to={`/positions/${cv.positionId}`}
              className="btn btn-outline-secondary btn-sm px-3"
            >
              View position
            </Link>

            {canEdit && isDraft && (
              <button
                type="button"
                className="btn btn-success btn-sm px-3"
                onClick={handlePublish}
                disabled={publishing || !allFilled}
                title={
                  !allFilled
                    ? "Fill in every attribute before publishing"
                    : undefined
                }
              >
                {publishing ? "Publishing…" : "Publish"}
              </button>
            )}

            {canEdit && (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm px-3"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <i className="bi bi-trash me-1" />
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Publish warning */}
        {canEdit && isDraft && !allFilled && (
          <div className="alert alert-warning py-2 px-3 small mb-4">
            Fill in every highlighted field below before you can publish this CV
            to recruiters.
          </div>
        )}

        {/* CV */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5">
            {/* CV header */}
            <header className="text-center mb-5 pb-4 border-bottom">
              <h1 className="h3 fw-bold mb-1">
                {cv.positionTitle ?? "Untitled position"}
              </h1>

              <p className="text-muted mb-0">
                {cv.likeCount ?? 0} like
                {cv.likeCount === 1 ? "" : "s"}
              </p>
            </header>

            {/* Attributes */}
            {sections.map((section) => (
              <section key={section.title} className="mb-5">
                <h2 className="h6 text-uppercase text-muted fw-bold mb-3 pb-2 border-bottom">
                  {section.title}
                </h2>

                <div className="row g-4">
                  {section.attributes.map((attribute) => {
                    const isEditing = editingAttributeId === attribute.attributeId;
                    const isSaving = savingAttributeId === attribute.attributeId;
                    const isEmpty = !isAttributeFilled(attribute);
                    const shown = displayValue(attribute);

                    const isWide =
                      attribute.attribute.type === AttributeType.Text ||
                      attribute.attribute.type === AttributeType.Image ||
                      attribute.attribute.type === AttributeType.Period;

                    return (
                      <div
                        className={isWide ? "col-12" : "col-12 col-md-6"}
                        key={attribute.attributeId}
                      >
                        {/* Label */}
                        <div className="small text-muted mb-1">
                          {attribute.attribute.name}
                        </div>

                        {isEditing ? (
                          <div>
                            <ValueField
                              attribute={attribute.attribute}
                              value={draftValue}
                              onChange={setDraftValue}
                              period={draftPeriod}
                              onPeriodChange={setDraftPeriod}
                            />

                            <div className="d-flex gap-2 mt-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                disabled={isSaving}
                                onClick={() => saveAttribute(attribute)}
                              >
                                {isSaving ? "Saving…" : "Save"}
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                disabled={isSaving}
                                onClick={cancelEditing}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`fw-semibold d-flex align-items-center gap-2 ${
                              canEdit ? "cv-editable-value" : ""
                            } ${isEmpty ? "text-danger" : ""}`}
                            role={canEdit ? "button" : undefined}
                            onClick={() => canEdit && startEditing(attribute)}
                          >
                            {attribute.attribute.type === AttributeType.Image &&
                            !isEmpty ? (
                              <img
                                src={attribute.value}
                                alt={attribute.attribute.name}
                                style={{
                                  maxWidth: 120,
                                  maxHeight: 120,
                                  borderRadius: 8,
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <span
                                style={{
                                  whiteSpace:
                                    attribute.attribute.type ===
                                    AttributeType.Text
                                      ? "pre-wrap"
                                      : "normal",
                                }}
                              >
                                {isEmpty ? "Not filled in" : shown}
                              </span>
                            )}

                            {canEdit && (
                              <i className="bi bi-pencil text-muted small" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            {/* Projects */}
            {projects.length > 0 && (
              <section>
                <h2 className="h6 text-uppercase text-muted fw-bold mb-3 pb-2 border-bottom">
                  Relevant projects
                </h2>

                <div className="d-flex flex-column gap-4">
                  {projects.map((project) => (
                    <div key={project.id}>
                      <div className="d-flex justify-content-between align-items-baseline flex-wrap gap-2">
                        <div className="fw-bold">{project.name}</div>

                        <div className="text-muted small">
                          {project.startDate}

                          {project.endDate
                            ? ` – ${project.endDate}`
                            : " – Present"}
                        </div>
                      </div>

                      {project.description && (
                        <p className="text-muted small mb-2 mt-1">
                          {project.description}
                        </p>
                      )}

                      {project.tags.length > 0 && (
                        <div className="d-flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="badge rounded-pill text-bg-primary-subtle text-primary border border-primary-subtle"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete this CV?</h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                />
              </div>

              <div className="modal-body">
                <p className="mb-0">
                  This will permanently delete your CV for{" "}
                  <strong>{cv.positionTitle ?? "this position"}</strong>. This
                  action cannot be undone.
                </p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteCv}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete CV"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cv-editable-value {
          cursor: pointer;
          border-radius: 4px;
          padding: 2px 4px;
          margin: -2px -4px;
        }

        .cv-editable-value:hover {
          background: rgba(13, 110, 253, 0.08);
        }
      `}</style>
    </div>
  );
};

export default CvPage;
