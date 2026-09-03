import SectionHeader from "./SectionHeader";

const ProjectsSection = () => {
  const projects = [
    {
      name: "Recruitment Platform",
      period: "Jan 2025 — Present",
      description:
        "A recruitment platform for candidates, recruiters and administrators.",
      technologies: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    },
    {
      name: "E-commerce Application",
      period: "Jun 2024 — Dec 2024",
      description:
        "Full-stack e-commerce application with authentication and payments.",
      technologies: ["React", "Express", "MongoDB"],
    },
    {
      name: "Analytics Dashboard",
      period: "Jan 2024 — May 2024",
      description:
        "Interactive dashboard for displaying business analytics and reports.",
      technologies: ["React", "TypeScript", "Chart.js"],
    },
  ];

  return (
    <section>
      <SectionHeader
        title="Projects"
        description="Showcase your experience and the work you've done."
        buttonText="Add project"
        onClick={() => {}}
      />

      <div className="d-flex flex-column gap-3">
        {projects.map((project) => (
          <div className="card border-0 shadow-sm" key={project.name}>
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                <div className="flex-grow-1">
                  <h3 className="h5 fw-bold mb-1">{project.name}</h3>

                  <div className="text-muted small mb-3">{project.period}</div>

                  <p className="text-muted mb-3">{project.description}</p>

                  <div className="d-flex flex-wrap gap-2">
                    {project.technologies.map((technology) => (
                      <span
                        className="badge rounded-pill text-bg-light border"
                        key={technology}
                      >
                        {technology}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="d-flex align-items-start gap-2">
                  <button className="btn btn-sm btn-outline-secondary">
                    Edit
                  </button>

                  <button className="btn btn-sm btn-outline-danger">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body text-center py-5">
          <h3 className="h6 fw-bold">Build your project portfolio</h3>

          <p className="text-muted small mb-3">
            Add projects to help recruiters understand your experience.
          </p>

          <button className="btn btn-primary">+ Add project</button>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
