import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Project, User } from "../models";
import { createProject, updateProject } from "../api/projectApi";
import TagSelector from "./TagSelector";
import ToastNotification from "./notifications/ToastNotification";

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
  const { t } = useTranslation();
  const [name, setName] = useState(initial?.name ?? "");
  const [startDate, setStartDate] = useState(
    initial?.startDate?.slice(0, 10) ?? "",
  );
  const [endDate, setEndDate] = useState(initial?.endDate?.slice(0, 10) ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tags, setTags] = useState(initial?.tags ?? []);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !startDate) {
      setToast({
        message: t("projectForm.nameAndStartRequired"),
        type: "danger",
      });
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
        tags,
      };

      if (initial) {
        await updateProject(payload);
      } else {
        await createProject(payload);
      }

      onSaved();
    } catch (err: any) {
      setToast({
        message: err.message ?? t("projectForm.saveFailed"),
        type: "danger",
      });
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
          style={{ borderRadius: "18px" }}
        >
          <form onSubmit={handleSubmit}>
            <div className="modal-header px-4 py-3">
              <h2 className="h5 fw-bold mb-0">
                {initial ? t("projectForm.editTitle") : t("projectForm.addTitle")}
              </h2>
              <button
                type="button"
                className="btn-close"
                aria-label={t("common.close")}
                onClick={onClose}
              />
            </div>

            <div className="modal-body px-4">
              <div className="mb-3">
                <label className="form-label small fw-semibold">{t("projectForm.name")}</label>
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
                    {t("projectForm.startDate")}
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
                    {t("projectForm.endDate")}
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
                    {t("projectForm.description")}
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
                    {t("projectForm.technologyTags")}
                </label>
                <TagSelector
                  selectedTagNames={tags}
                  onNamesChange={setTags}
                  onError={(message) =>
                    setToast({
                      message: message || t("projectForm.tagsLoadFailed"),
                      type: "danger",
                    })
                  }
                />
              </div>
            </div>

            <div className="modal-footer px-4">
              <button
                type="button"
                className="btn btn-light"
                onClick={onClose}
                disabled={saving}
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? t("projectForm.saving") : t("common.save")}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default ProjectFormModal;
