import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/navbar/NavBar";
import { useAuth } from "../hooks/auth";
import type { PositionSummary } from "../models";
import { getPositions } from "../api/positionApi";
import { UserRole } from "../enums/enums";

const MainPage = () => {
  const { user } = useAuth();
  const isCandidate = user?.role === UserRole.Candidate;

  const [positions, setPositions] = useState<PositionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      const res = await getPositions();
      setPositions(res);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const latestPositions = positions.slice(0, 5);

  const popularPositions = [...positions]
    .sort((a, b) => (b.cvsCount ?? 0) - (a.cvsCount ?? 0))
    .slice(0, 5);

  return (
    <div className="min-vh-100 bg-light">
      <NavBar />

      <main className="container py-4 py-md-5">
        <section className="mb-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="badge text-bg-primary rounded-pill px-3 py-2 mb-3">
                Recruitment Platform
              </span>
              <h1 className="display-5 fw-bold mb-3">
                Find the right opportunity.
                <br />
                <span className="text-primary">Build your future.</span>
              </h1>
              <p className="lead text-muted mb-4">
                Discover positions that match your skills, create tailored CVs,
                and showcase your experience through your personal profile.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/positions" className="btn btn-primary px-4">
                  Browse positions
                </Link>
                {isCandidate && (
                  <Link
                    to="/profile"
                    className="btn btn-outline-secondary px-4"
                  >
                    Complete my profile
                  </Link>
                )}
              </div>
            </div>

            {isCandidate && (
              <div className="col-lg-5">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div
                        className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                        style={{ width: 52, height: 52 }}
                      >
                        <span className="fs-4">✨</span>
                      </div>
                      <div>
                        <h2 className="h6 fw-bold mb-1">Your profile</h2>
                        <p className="text-muted small mb-0">
                          Keep your information up to date
                        </p>
                      </div>
                    </div>
                    <p className="text-muted small mb-0">
                      Add your projects and skills to improve your profile.
                    </p>
                    <Link
                      to="/profile"
                      className="btn btn-outline-primary btn-sm w-100 mt-3"
                    >
                      Go to profile
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="alert alert-danger py-2 small" role="alert">
            {error}
          </div>
        )}

        {!loading && positions.length > 0 && (
          <section className="mb-5">
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-0">
                    <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
                      <div>
                        <h2 className="h5 fw-bold mb-1">Latest Positions</h2>
                        <p className="text-muted small mb-0">
                          Recently created or updated positions
                        </p>
                      </div>
                      <Link
                        to="/positions"
                        className="btn btn-sm btn-outline-primary"
                      >
                        View all
                      </Link>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="px-4 py-3">Position</th>
                            <th className="py-3">Access</th>
                            <th className="py-3">Tags</th>
                          </tr>
                        </thead>
                        <tbody>
                          {latestPositions.map((position) => (
                            <tr key={position.id}>
                              <td className="px-4 py-3">
                                <Link
                                  to={`/positions/${position.id}`}
                                  className="text-decoration-none"
                                >
                                  <div className="fw-semibold">
                                    {position.title}
                                  </div>
                                  <div
                                    className="text-muted small text-truncate"
                                    style={{ maxWidth: 320 }}
                                  >
                                    {position.description}
                                  </div>
                                </Link>
                              </td>
                              <td>
                                <span
                                  className={`badge rounded-pill ${
                                    position.isPublic
                                      ? "text-bg-success-subtle text-success-emphasis"
                                      : "text-bg-warning-subtle text-warning-emphasis"
                                  }`}
                                >
                                  {position.isPublic ? "Public" : "Restricted"}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex flex-wrap gap-1">
                                  {(position.tags ?? [])
                                    .slice(0, 2)
                                    .map((tag) => (
                                      <span
                                        className="badge rounded-pill text-bg-light border"
                                        key={tag}
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-0">
                    <div className="p-4 border-bottom">
                      <h2 className="h5 fw-bold mb-1">Most Popular</h2>
                      <p className="text-muted small mb-0">
                        Ranked by submitted CVs
                      </p>
                    </div>

                    <div className="list-group list-group-flush">
                      {popularPositions.map((position, index) => (
                        <Link
                          key={position.id}
                          to={`/positions/${position.id}`}
                          className="list-group-item list-group-item-action border-0 px-4 py-3"
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div
                              className="rounded-circle bg-light d-flex align-items-center justify-content-center fw-bold text-muted"
                              style={{ width: 36, height: 36 }}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-semibold small">
                                {position.title}
                              </div>
                            </div>
                            <div className="text-end">
                              <div className="fw-bold small">
                                {position.cvsCount ?? 0}
                              </div>
                              <div className="text-muted small">CVs</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="p-3 border-top">
                      <Link
                        to="/positions"
                        className="btn btn-outline-primary btn-sm w-100"
                      >
                        Explore all positions
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {isCandidate && (
          <section>
            <div className="card border-0 bg-primary text-white shadow-sm">
              <div className="card-body p-4 p-md-5">
                <div className="row align-items-center g-4">
                  <div className="col-md-8">
                    <h2 className="h4 fw-bold mb-2">
                      Make your profile stand out
                    </h2>
                    <p className="mb-0 opacity-75">
                      Add your skills, projects and experience to create better
                      CVs for the positions you want.
                    </p>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <Link to="/profile" className="btn btn-light px-4">
                      Go to my profile
                    </Link>
                  </div>
                </div>
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

export default MainPage;
