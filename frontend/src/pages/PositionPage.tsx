import { Link, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import type { Position } from "../models";
import { ComparisonType } from "../enums/enums";
import { useAuth } from "../hooks/auth";
import { useState } from "react";

// Backend's ComparisonType enum: LessThan, LessThanOrEqual, GreaterThan, GreaterThanOrEqual, Equal
// (mirrors the C# enum member names exactly) — adjust this map if your enums.ts names differ.
const OPERATOR_SYMBOLS: Partial<Record<ComparisonType, string>> = {
  [ComparisonType.Equal]: "=",
  [ComparisonType.GreaterThan]: ">",
  [ComparisonType.LessThan]: "<",
  [ComparisonType.GreaterThanOrEqual]: "≥",
  [ComparisonType.LessThanOrEqual]: "≤",
};

const PositionPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const role = user?.role.toString();
  const isRecruiterOrAdmin = role === "Recruiter" || role === "Administrator";
  const isCandidate = role === "Candidate";
  const [position, setPosition] = useState<Position | null>(null);

  // Mock data — replace with API data later. Shaped exactly as `Position` from models.ts,
  // no invented fields (no Company/Level/createdAt/updatedAt — none of those exist on the
  // backend model). `accessible` below is intentionally NOT part of Position: it's a
  // per-viewer computed result (depends on the current candidate's attribute values), not
  // a property of the position entity itself, so it's kept as a separate mock value.
  setPosition({
    id: Number(id ?? 1),
    title: "Senior Frontend Developer",
    description:
      "Build modern and scalable web applications for our recruitment platform, working closely with designers, backend engineers and product managers.",
    isPublic: true,
    maxProjects: 3,
    tags: [
      { id: 1, name: "React" },
      { id: 2, name: "TypeScript" },
      { id: 3, name: "Node.js" },
      { id: 4, name: "PostgreSQL" },
    ],
    attributes: [
      {
        id: 1,
        name: "IELTS Score",
        type: "Numeric" as any,
        category: "PersonalInformation" as any,
        isBuiltIn: false,
      },
      {
        id: 2,
        name: "Presentation Skills",
        type: "Dropdown" as any,
        category: "SoftSkills" as any,
        isBuiltIn: false,
        options: ["Basic", "Intermediate", "Advanced"],
      },
      {
        id: 3,
        name: "Remote Work Availability",
        type: "Boolean" as any,
        category: "WorkPreference" as any,
        isBuiltIn: false,
      },
      {
        id: 4,
        name: "Years of Experience",
        type: "Numeric" as any,
        category: "DomainKnowledge" as any,
        isBuiltIn: false,
      },
    ],
    positionAccessRules: [
      {
        id: 1,
        positionId: Number(id ?? 1),
        attributeId: 1,
        comparisonType: ComparisonType.GreaterThan,
        value: "7.0",
        attribute: {
          id: 1,
          name: "IELTS Score",
          type: "Numeric" as any,
          category: "PersonalInformation" as any,
          isBuiltIn: false,
        },
      },
      {
        id: 2,
        positionId: Number(id ?? 1),
        attributeId: 3,
        comparisonType: ComparisonType.Equal,
        value: "true",
        attribute: {
          id: 3,
          name: "Remote Work Availability",
          type: "Boolean" as any,
          category: "WorkPreference" as any,
          isBuiltIn: false,
        },
      },
      {
        id: 3,
        positionId: Number(id ?? 1),
        attributeId: 2,
        comparisonType: ComparisonType.Equal,
        value: "Advanced",
        attribute: {
          id: 2,
          name: "Presentation Skills",
          type: "Dropdown" as any,
          category: "SoftSkills" as any,
          isBuiltIn: false,
          options: ["Basic", "Intermediate", "Advanced"],
        },
      },
    ],
    cvs: new Array(86)
      .fill(null)
      .map((_, i) => ({ id: i, userId: i, likes: [] }) as any), // stand-in for a real count until an endpoint exists
    discussion: {
      id: 1,
      positionId: Number(id ?? 1),
      posts: [
        {
          id: 1,
          authorId: 10,
          authorName: "Sarah Johnson",
          content:
            "We're particularly interested in candidates with strong experience building large React applications.",
          createdAt: new Date().toISOString(),
          discussionId: 1,
        } as any,
        {
          id: 2,
          authorId: 20,
          authorName: "Michael Smith",
          content:
            "Would experience with Next.js also be considered for this position?",
          createdAt: new Date().toISOString(),
          discussionId: 1,
        } as any,
        {
          id: 3,
          authorId: 10,
          authorName: "Sarah Johnson",
          content:
            "Yes. Next.js experience is definitely relevant for this position.",
          createdAt: new Date().toISOString(),
          discussionId: 1,
        } as any,
      ],
    } as any,
  })

  // Not on the Position model — computed server-side per viewer, kept separate on purpose.
  const accessible = true;
  const cvCount = position.cvs?.length ?? 0;

  return (
    <div className="min-vh-100 bg-light">
      <NavBar />

      <main className="container py-4 py-md-5">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">
                Home
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/positions" className="text-decoration-none">
                Positions
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {position.title}
            </li>
          </ol>
        </nav>

        {/* Position Header */}
        <section className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4 p-md-5">
            <div className="d-flex flex-column flex-lg-row justify-content-between gap-4">
              <div className="flex-grow-1">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span
                    className={`badge rounded-pill px-3 py-2 ${position.isPublic ? "text-bg-success" : "text-bg-warning"}`}
                  >
                    {position.isPublic ? "Public" : "Restricted"}
                  </span>
                </div>

                <h1 className="display-6 fw-bold mb-2">{position.title}</h1>

                {isRecruiterOrAdmin && (
                  <div className="d-flex flex-wrap gap-3 text-muted mb-4">
                    <span>
                      <i className="bi bi-file-earmark-text me-1" />
                      {cvCount} CVs
                    </span>
                  </div>
                )}

                <p className="lead text-muted mb-0">{position.description}</p>
              </div>

              {isCandidate && (
                <div className="d-flex flex-column gap-2 flex-shrink-0">
                  <Link
                    to={`/positions/${position.id}/cv`}
                    className="btn btn-primary px-4"
                  >
                    Create CV
                  </Link>
                </div>
              )}

              {isRecruiterOrAdmin && (
                <div className="d-flex flex-column gap-2 flex-shrink-0">
                  <Link
                    to={`/positions/${position.id}/edit`}
                    className="btn btn-outline-secondary px-4"
                  >
                    Edit position
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="row g-4">
          {/* Left column */}
          <div className="col-lg-8">
            {/* Access requirements — from position.positionAccessRules */}
            {position.positionAccessRules.length > 0 && (
              <section className="card border-0 shadow-sm mb-4">
                <div className="card-body p-0">
                  <div className="p-4 border-bottom">
                    <h2 className="h5 fw-bold mb-1">Access requirements</h2>
                    <p className="text-muted small mb-0">
                      {position.isPublic
                        ? "This position is public — these rules are shown for reference only."
                        : "A candidate must meet all of these to access this position."}
                    </p>
                  </div>

                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="px-4 py-3">Attribute</th>
                          <th className="py-3">Type</th>
                          <th className="py-3">Requirement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {position.positionAccessRules.map((rule) => (
                          <tr key={rule.id}>
                            <td className="px-4 py-3">
                              <div className="fw-semibold">
                                {rule.attribute.name}
                              </div>
                            </td>
                            <td>
                              <span className="badge text-bg-light border">
                                {rule.attribute.type}
                              </span>
                            </td>
                            <td>
                              <span className="fw-semibold">
                                {OPERATOR_SYMBOLS[rule.comparisonType] ??
                                  rule.comparisonType}{" "}
                                {rule.value}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* Attributes included in the generated CV — position.attributes, the full set */}
            <section className="card border-0 shadow-sm mb-4">
              <div className="card-body p-0">
                <div className="p-4 border-bottom">
                  <h2 className="h5 fw-bold mb-1">
                    Attributes included in this CV
                  </h2>
                  <p className="text-muted small mb-0">
                    Every CV generated for this position shows these fields.
                  </p>
                </div>

                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="px-4 py-3">Attribute</th>
                        <th className="py-3">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {position.attributes.map((attribute) => (
                        <tr key={attribute.id}>
                          <td className="px-4 py-3">
                            <div className="fw-semibold">{attribute.name}</div>
                          </td>
                          <td>
                            <span className="badge text-bg-light border">
                              {attribute.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Projects — position.tags is Tag[], not string[] */}
            <section className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <h2 className="h5 fw-bold mb-1">Relevant projects</h2>
                    <p className="text-muted small mb-0">
                      Projects matching these technologies can be included in
                      the generated CV.
                    </p>
                  </div>
                  <span className="badge text-bg-light border">
                    Max {position.maxProjects}
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  {(position.tags ?? []).map((tag) => (
                    <span
                      key={tag.id}
                      className="badge rounded-pill text-bg-primary-subtle text-primary border border-primary-subtle px-3 py-2"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Discussion — position.discussion.posts, using the model's authorName/authorId/createdAt */}
            <section className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="p-4 border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h2 className="h5 fw-bold mb-1">Discussion</h2>
                      <p className="text-muted small mb-0">
                        Questions and discussion about this position.
                      </p>
                    </div>
                    <span className="badge text-bg-light border">
                      {position.discussion.posts.length} posts
                    </span>
                  </div>
                </div>

                <div>
                  {position.discussion.posts.map((post, index) => (
                    <div
                      key={post.id}
                      className={`p-4 ${index !== position.discussion.posts.length - 1 ? "border-bottom" : ""}`}
                    >
                      <div className="d-flex gap-3">
                        <div
                          className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-semibold flex-shrink-0"
                          style={{ width: 40, height: 40 }}
                        >
                          {post.authorName
                            .split(" ")
                            .map((name) => name[0])
                            .join("")}
                        </div>

                        <div className="flex-grow-1">
                          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                            {/* Spec: author name links to the user's public profile view, only for Recruiters */}
                            {isRecruiterOrAdmin ? (
                              <Link
                                to={`/profile/${post.authorId}`}
                                className="fw-semibold text-decoration-none"
                              >
                                {post.authorName}
                              </Link>
                            ) : (
                              <span className="fw-semibold">
                                {post.authorName}
                              </span>
                            )}
                            <span className="text-muted small">
                              {new Date(post.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-muted mb-0">{post.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-light border-top">
                  <div className="mb-3">
                    <label
                      htmlFor="discussion"
                      className="form-label fw-semibold"
                    >
                      Join the discussion
                    </label>
                    <textarea
                      id="discussion"
                      className="form-control"
                      rows={3}
                      placeholder="Write a message…"
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button className="btn btn-primary">Post message</button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="col-lg-4">
            {isCandidate && (
              <section className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h2 className="h6 fw-bold mb-3">Your access</h2>

                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                        accessible
                          ? "bg-success-subtle text-success"
                          : "bg-danger-subtle text-danger"
                      }`}
                      style={{ width: 40, height: 40 }}
                    >
                      {accessible ? "✓" : "✕"}
                    </div>
                    <div>
                      <div className="fw-semibold">
                        {accessible
                          ? "You have access"
                          : "You don't have access yet"}
                      </div>
                      <div className="text-muted small">
                        {accessible
                          ? "Your profile currently matches the access requirements."
                          : "Update your profile attributes to meet the requirements above."}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/positions/${position.id}/cv`}
                    className={`btn w-100 ${accessible ? "btn-primary" : "btn-secondary disabled"}`}
                    aria-disabled={!accessible}
                  >
                    Create CV
                  </Link>
                </div>
              </section>
            )}

            <section className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h2 className="h6 fw-bold mb-3">Position information</h2>
                <div className="d-flex flex-column gap-3">
                  <InfoRow
                    label="Visibility"
                    value={position.isPublic ? "Public" : "Restricted"}
                  />
                  {isRecruiterOrAdmin && (
                    <InfoRow label="Submitted CVs" value={String(cvCount)} />
                  )}
                </div>
              </div>
            </section>

            {isRecruiterOrAdmin && (
              <section className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex gap-3">
                    <div
                      className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 44, height: 44 }}
                    >
                      <i className="bi bi-file-earmark-text fs-5" />
                    </div>
                    <div>
                      <h2 className="h6 fw-bold mb-1">Submitted CVs</h2>
                      <p className="text-muted small mb-2">
                        {cvCount} candidate{cvCount === 1 ? "" : "s"} published
                        a CV for this position.
                      </p>
                      <Link
                        to={`/positions/${position.id}/cvs`}
                        className="small fw-semibold text-decoration-none"
                      >
                        View all CVs →
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="border-top bg-white mt-5">
        <div className="container py-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <span className="text-muted small">
              © 2026 Recruitment Platform
            </span>
            <div className="d-flex gap-3">
              <Link
                to="/positions"
                className="text-muted small text-decoration-none"
              >
                Positions
              </Link>
              <Link
                to="/profile"
                className="text-muted small text-decoration-none"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="d-flex justify-content-between align-items-center gap-3">
      <span className="text-muted small">{label}</span>
      <span className="fw-semibold small text-end">{value}</span>
    </div>
  );
};

export default PositionPage;
