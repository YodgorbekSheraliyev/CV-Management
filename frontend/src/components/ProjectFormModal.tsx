import { useState } from "react";
import type { Project, User } from "../models";
import { createProject, updateProject } from "../api/projectApi";

interface ProjectFormModalProps {
  initial?: Project;
  user: User;
  onClose: () => void;
  onSaved: () => void;
}

function ProjectFormModal({
  initial,
  user,
  onClose,
  onSaved,
}: ProjectFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [startDate, setStartDate] = useState(
    initial?.startDate?.slice(0, 10) ?? "",
  );
  const [endDate, setEndDate] = useState(initial?.endDate?.slice(0, 10) ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tagsInput, setTagsInput] = useState(
    initial?.tags.map((t) => t).join(", ") ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !startDate) {
      setError("Name and start date are required.");
      return;
    }

    setSaving(true);
    try {
      const payload: Project = {
        name: name.trim(),
        id: initial?.id ?? -Date.now(),
        userId: user.id,
        startDate,
        endDate: endDate || null,
        description,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (initial) {
        await updateProject(payload);
      } else {
        await createProject(payload);
      }

      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal d-block"
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content border-0 shadow"
          style={{ borderRadius: "18px", overflow: "hidden" }}
        >
          <form onSubmit={handleSubmit}>
            <div className="modal-header px-4 py-3">
              <h2 className="h5 fw-bold mb-0">
                {initial ? "Edit project" : "Add project"}
              </h2>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>

            <div className="modal-body px-4">
              <div className="mb-3">
                <label className="form-label small fw-semibold">Name</label>
                <input
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">
                    Start date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">
                    End date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Description
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="mb-2">
                <label className="form-label small fw-semibold">
                  Technology tags
                </label>
                <input
                  className="form-control"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="React, TypeScript, PostgreSQL"
                />
                <div className="form-text">Comma-separated.</div>
              </div>

              {error && (
                <div
                  className="alert alert-danger py-2 small mb-0"
                  role="alert"
                >
                  {error}
                </div>
              )}
            </div>

            <div className="modal-footer px-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProjectFormModal;
