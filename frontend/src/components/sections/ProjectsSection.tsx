import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import SectionHeader from "../SectionHeader";
import type { Project } from "../../models";
import { deleteProject, getUserProjects } from "../../api/projectApi";
import { useAuth } from "../../hooks/auth";
import ProjectFormModal from "../ProjectFormModal";

const ProjectsSection = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Project | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (openMenu === null) return;

    function closeMenu(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, [openMenu]);

  async function loadProjects() {
    setLoading(true);
    setError(null);

    try {
      const res = await getUserProjects(user!.id);
      setProjects(res);
    } catch (err: any) {
      setError(err.message ?? t("projectsSection.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return;

    setDeleting(true);

    try {
      await deleteProject(confirmDelete);
      setProjects((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (err: any) {
      setError(err.message ?? t("projectsSection.deleteFailed"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section>
      <SectionHeader
        title={t("projectsSection.title")}
        description={t("projectsSection.description")}
        buttonText={t("projectsSection.addProject")}
        onClick={() => setEditing("new")}
      />

      {error && (
        <div
          className="alert alert-danger d-flex align-items-center gap-2 py-2 small"
          role="alert"
        >
          <i className="bi bi-exclamation-circle" />
          <span className="flex-grow-1">{error}</span>
          <button
            type="button"
            className="btn-close"
            aria-label={t("common.dismiss")}
            onClick={() => setError(null)}
          />
        </div>
      )}

      <div className="card border-0 shadow-sm">
        {loading ? (
          <div className="card-body py-5">
            <div className="d-flex flex-column align-items-center text-muted small">
              <span
                className="spinner-border spinner-border-sm mb-2"
                aria-hidden="true"
              />
              {t("projectsSection.loading")}
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="card-body text-center py-5">
            <i className="bi bi-kanban fs-2 text-muted d-block mb-2" />
            <h3 className="h6 fw-bold mb-1">{t("projectsSection.emptyTitle")}</h3>
            <p className="text-muted small mb-3">
              {t("projectsSection.emptyDescription")}
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setEditing("new")}
            >
              <i className="bi bi-plus-lg me-1" />
              {t("projectsSection.addProject")}
            </button>
          </div>
        ) : (
          <div ref={menuRef} className="list-group list-group-flush">
            {projects.map((project) => (
              <div className="list-group-item p-3 p-md-4" key={project.id}>
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h3 className="h6 fw-bold mb-0">{project.name}</h3>
                      <span className="badge text-bg-light border text-muted fw-normal">
                        <i className="bi bi-calendar3 me-1" />
                        {formatRange(project.startDate, project.endDate ?? undefined)}
                      </span>
                    </div>

                    {project.description && (
                      <p className="text-muted small mb-2">
                        {project.description}
                      </p>
                    )}

                    {project.tags.length > 0 && (
                      <div className="d-flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span
                            className="badge rounded-pill text-bg-primary-subtle text-primary-emphasis"
                            key={tag}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="dropdown flex-shrink-0">
                    <button
                      type="button"
                      className="btn btn-sm btn-light border"
                      aria-label={`${project.name} actions`}
                      aria-expanded={openMenu === project.id}
                      onClick={() =>
                        setOpenMenu((current) =>
                          current === project.id ? null : project.id,
                        )
                      }
                    >
                      <i className="bi bi-three-dots-vertical" />
                    </button>
                    {openMenu === project.id && (
                      <div className="dropdown-menu dropdown-menu-end show">
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => {
                            setOpenMenu(null);
                            setEditing(project);
                          }}
                        >
                          <i className="bi bi-pencil me-2" />
                          {t("common.edit")}
                        </button>
                        <button
                          type="button"
                          className="dropdown-item text-danger"
                          onClick={() => {
                            setOpenMenu(null);
                            setConfirmDelete(project);
                          }}
                        >
                          <i className="bi bi-trash me-2" />
                          {t("common.delete")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <ProjectFormModal
          initial={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          user={user!}
          onSaved={() => {
            setEditing(null);
            loadProjects();
          }}
        />
      )}

      {confirmDelete && (
        <div
          className="modal d-block bg-dark bg-opacity-50"
          tabIndex={-1}
          role="dialog"
          onClick={() => !deleting && setConfirmDelete(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-body p-4 text-center">
                <div className="d-inline-flex align-items-center justify-content-center bg-danger-subtle text-danger rounded-circle p-3 mb-3">
                  <i className="bi bi-trash fs-4" />
                </div>
                <h3 className="h6 fw-bold mb-2">{t("projectsSection.deleteTitle")}</h3>
                <p className="text-muted small mb-0">
                  {t("projectsSection.deleteDescription", { name: confirmDelete.name })}
                </p>
              </div>
              <div className="modal-footer border-0 p-3 pt-0 justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-light px-4"
                  onClick={() => setConfirmDelete(null)}
                  disabled={deleting}
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                      {t("projectsSection.deleting")}
                    </>
                  ) : (
                    t("common.delete")
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

function formatRange(start: string, end?: string) {
  const s = new Date(start).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
  });
  const e = end
    ? new Date(end).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
      })
    : "Present";
  return `${s} — ${e}`;
}

export default ProjectsSection;