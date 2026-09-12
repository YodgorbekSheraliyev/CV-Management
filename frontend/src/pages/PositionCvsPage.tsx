import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import NavBar from "../components/navbar/NavBar";
import { getPositionById, getPositionCvs } from "../api/positionApi";
import { useAuth } from "../hooks/auth";
import { UserRole } from "../enums/enums";
import type { CVSummary, Position, User } from "../models";

const PositionCvsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isRecruiterOrAdmin =
    user?.role === UserRole.Recruiter || user?.role === UserRole.Administrator;

  const [position, setPosition] = useState<Position | null>(null);
  const [cvs, setCvs] = useState<CVSummary[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    loadData(Number(id));
  }, [id, user]);

  const loadData = async (positionId: number) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [positionResult, cvsResult] = await Promise.all([
        getPositionById(positionId, user.id),
        getPositionCvs(positionId),
      ]);

      if (!positionResult) {
        throw new Error("Position not found.");
      }

      setPosition(positionResult);
      setCvs(cvsResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load submitted CVs.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isRecruiterOrAdmin) {
    return (
      <div className="min-vh-100 bg-light">
        <NavBar />

        <main className="container py-5">
          <div className="alert alert-danger">
            You do not have permission to view submitted CVs.
          </div>

          <Link to="/positions" className="btn btn-outline-secondary">
            Back to positions
          </Link>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <NavBar />

        <main className="container py-5">
          <div className="text-center text-muted">Loading submitted CVs…</div>
        </main>
      </div>
    );
  }

  if (error || !position) {
    return (
      <div className="min-vh-100 bg-light">
        <NavBar />

        <main className="container py-5">
          <div className="alert alert-danger mb-3">
            {error ?? "Position not found."}
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate("/positions")}
          >
            Back to positions
          </button>
        </main>
      </div>
    );
  }

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

            <li className="breadcrumb-item">
              <Link
                to={`/positions/${position.id}`}
                className="text-decoration-none"
              >
                {position.title}
              </Link>
            </li>

            <li className="breadcrumb-item active" aria-current="page">
              Submitted CVs
            </li>
          </ol>
        </nav>

        {/* Header */}
        <section className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4 p-md-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <Link
                  to={`/positions/${position.id}`}
                  className="text-decoration-none small"
                >
                  ← Back to position
                </Link>

                <h1 className="h3 fw-bold mt-2 mb-1">Submitted CVs</h1>

                <p className="text-muted mb-0">
                  Candidates who submitted a CV for{" "}
                  <span className="fw-semibold">{position.title}</span>
                </p>
              </div>

              <div className="text-md-end">
                <div className="display-6 fw-bold">{cvs?.length}</div>

                <div className="text-muted small">
                  {cvs?.length === 1 ? "submitted CV" : "submitted CVs"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CV list */}
        {cvs?.length === 0 ? (
          <section className="card border-0 shadow-sm">
            <div className="card-body py-5 text-center">
              <div
                className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: 64,
                  height: 64,
                }}
              >
                <i className="bi bi-file-earmark-text fs-3 text-muted" />
              </div>

              <h2 className="h5 fw-bold">No CVs submitted yet</h2>

              <p className="text-muted mb-0">
                Candidates who submit a CV for this position will appear here.
              </p>
            </div>
          </section>
        ) : (
          <section className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3">Candidate</th>
                      <th className="py-3">CV</th>
                      <th className="py-3">Submitted</th>
                      <th className="py-3 text-end px-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {cvs.map((cv) => (
                      <CvRow key={cv.id} user={user} cv={cv} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
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

interface CvRowProps {
  cv: CVSummary;
  user: User
}

const CvRow = ({ cv, user }: CvRowProps) => {
  const candidateName = `${user?.firstName} ${user.lastName}`;
  const submittedAt = cv.createdAt;

  return (
    <tr>
      <td className="px-4 py-3">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-semibold flex-shrink-0"
            style={{
              width: 42,
              height: 42,
            }}
          >
            {getInitials(candidateName)}
          </div>

          <div>
            <div className="fw-semibold">{candidateName}</div>
            {user.email && (
              <div className="text-muted small">
                {user.email}
              </div>
            )}
          </div>
        </div>
      </td>

      <td>
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-file-earmark-person text-primary" />

          <span className="small fw-semibold">CV #{cv.id}</span>
        </div>
      </td>

      <td>
        <span className="text-muted small">
          {submittedAt ? new Date(submittedAt).toLocaleString() : "—"}
        </span>
      </td>

      <td className="text-end px-4">
        <Link
          to={`/cvs/${cv.id}`}
          className="btn btn-sm btn-outline-primary"
        >
          <i className="bi bi-eye me-1" />
          View CV
        </Link>
      </td>
    </tr>
  );
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

export default PositionCvsPage;
