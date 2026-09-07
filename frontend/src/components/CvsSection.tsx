import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "./SectionHeader";
import type { CV } from "../models";
import { CVStatus } from "../enums/enums";

interface CommonResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

const CvsSection = () => {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/cvs", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => res.json())
      .then((body: CommonResponse<CV[]>) => {
        if (!body.success || !body.data) throw new Error(body.error ?? "Couldn't load your CVs.");
        setCvs(body.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load your CVs."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      {/* No positionId to create against here — creation only makes sense from a specific
          position's page (spec: a CV is always created for one position), so this button
          points at Positions rather than firing a create call directly. */}
      <SectionHeader
        title="CVs"
        description="CVs created for positions you are eligible to apply for."
        buttonText="Browse positions"
        onClick={() => {}}
      />

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-muted small py-4">Loading…</div>
      ) : cvs.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <h3 className="h6 fw-bold">No CVs yet</h3>
            <p className="text-muted small mb-3">
              Browse positions you're eligible for and create a tailored CV.
            </p>
            <Link to="/positions" className="btn btn-primary">
              Browse positions
            </Link>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {cvs.map((cv) => (
            <Link
              to={`/cvs/${cv.id}`}
              className="card border-0 shadow-sm text-decoration-none text-dark"
              key={cv.id}
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 48, height: 48 }}
                  >
                    <span className="fw-bold">CV</span>
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">
                      <h3 className="h6 fw-bold mb-0">{cv.position?.title ?? "Untitled position"}</h3>
                      <span className={`badge ${cv.status === CVStatus.Published ? "text-bg-success" : "text-bg-warning"}`}>
                        {cv.status === CVStatus.Published ? "Published" : "Draft"}
                      </span>
                    </div>

                    <p className="text-muted small mb-0 mt-1">
                      {cv.likes?.length ?? 0} like{(cv.likes?.length ?? 0) === 1 ? "" : "s"}
                    </p>
                  </div>

                  <span className="text-muted fs-5">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="alert alert-light border mt-4">
        <div className="d-flex gap-3">
          <span className="fs-5">ℹ</span>
          <div>
            <div className="fw-semibold mb-1">CVs are position-specific</div>
            <div className="small text-muted">
              You can create one CV for each position that is accessible to you.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CvsSection;