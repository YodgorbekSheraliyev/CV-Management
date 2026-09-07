import { useEffect, useState } from "react";
import SectionHeader from "./SectionHeader";
import type { Project } from "../models";
import { deleteProject, getUserProjects } from "../api/projectApi";
import { useAuth } from "../hooks/auth";
import ProjectFormModal from "./ProjectFormModal";

const ProjectsSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Project | "new" | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    setError(null);

    try {
      const res = await getUserProjects(user!.id);
      setProjects(res);
    } catch (error: any) {
      throw new Error(error.message ?? "Couldn't load your projects.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(project: Project) {
    try {
      await deleteProject(project);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <section>
      <SectionHeader
        title="Projects"
        description="Showcase your experience and the work you've done."
        buttonText="Add project"
        onClick={() => setEditing("new")}
      />

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-muted small py-4">Loading…</div>
      ) : projects.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <h3 className="h6 fw-bold">Build your project portfolio</h3>
            <p className="text-muted small mb-3">
              Add projects to help recruiters understand your experience.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setEditing("new")}
            >
              + Add project
            </button>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {projects.map((project) => (
            <div className="card border-0 shadow-sm" key={project.id}>
              <div className="card-body p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                  <div className="flex-grow-1">
                    <h3 className="h5 fw-bold mb-1">{project.name}</h3>
                    <div className="text-muted small mb-3">
                      {formatRange(project.startDate, project.endDate)}
                    </div>
                    <p className="text-muted mb-3">{project.description}</p>
                    <div className="d-flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          className="badge rounded-pill text-bg-light border"
                          key={tag}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setEditing(project)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(project)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
