import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import SectionHeader from "../SectionHeader";

import type { CVSummary } from "../../models";
import { CVStatus } from "../../enums/enums";
import { getMyCvs } from "../../api/cvApi";

const CvsSection = () => {
  const [cvs, setCvs] = useState<CVSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCvs();
  }, []);

  const loadCvs = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getMyCvs();

      setCvs(result ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load your CVs.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: CVStatus) => {
    if (status === CVStatus.Published) {
      return <span className="badge text-bg-success">Published</span>;
    }

    return <span className="badge text-bg-warning">Draft</span>;
  };

  return (
    <section>
      <SectionHeader
        title="CVs"
        description="Your CVs created for positions you are eligible for."
        buttonText="Browse positions"
        onClick={() => {
          window.location.href = "/positions";
        }}
      />

      {error && (
        <div className="alert alert-danger py-2 px-3 small" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body py-5 text-center">
            <div
              className="spinner-border text-primary mb-3"
              role="status"
              aria-hidden="true"
            />

            <div className="text-muted small">Loading your CVs…</div>
          </div>
        </div>
      ) : cvs.length === 0 ? (
        <EmptyCvs />
      ) : (
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Position</th>

                  <th className="py-3">Status</th>

                  <th className="py-3">Likes</th>

                  <th className="py-3">CV</th>
                </tr>
              </thead>

              <tbody>
                {cvs.map((cv) => (
                  <tr key={cv.id}>
                    <td className="px-4">
                      <Link
                        to={`/cvs/${cv.id}`}
                        className="text-decoration-none"
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: 42,
                              height: 42,
                            }}
                          >
                            <span className="fw-bold">CV</span>
                          </div>

                          <div>
                            <div className="fw-semibold text-dark">
                              {cv.positionTitle ?? "Untitled position"}
                            </div>

                            <div className="small text-muted">CV #{cv.id}</div>
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td>{getStatusBadge(cv.status)}</td>

                    <td>
                      <span className="text-muted">
                        {cv.likeCount?? 0}
                      </span>
                    </td>

                    <td>
                      <Link
                        to={`/cvs/${cv.id}`}
                        className="text-decoration-none fw-semibold"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="alert alert-light border mt-4 mb-0">
        <div className="d-flex gap-3">
          <span className="fs-5">ℹ</span>

          <div>
            <div className="fw-semibold mb-1">CVs are position-specific</div>

            <div className="small text-muted">
              You can have at most one CV for each position. Create new CVs from
              positions that are accessible to you.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const EmptyCvs = () => {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body text-center py-5">
        <div
          className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center mx-auto mb-3"
          style={{
            width: 64,
            height: 64,
          }}
        >
          <span className="fw-bold fs-5">CV</span>
        </div>

        <h3 className="h6 fw-bold">No CVs yet</h3>

        <p className="text-muted small mb-3">
          Browse available positions and create a tailored CV for a position
          you're eligible for.
        </p>

        <Link to="/positions" className="btn btn-primary">
          Browse positions
        </Link>
      </div>
    </div>
  );
};

export default CvsSection;
