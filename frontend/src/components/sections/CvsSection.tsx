import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import SectionHeader from "../SectionHeader";

import type { CVSummary } from "../../models";
import { CVStatus } from "../../enums/enums";
import { getCvsByCurrentUser } from "../../api/cvApi";

const CvsSection = () => {
  const { t } = useTranslation();
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

      const result = await getCvsByCurrentUser();
      setCvs(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("cvsSection.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: CVStatus) => {
    if (status === CVStatus.Published) {
      return <span className="badge text-bg-success">{t("cvsSection.published")}</span>;
    }

    return <span className="badge text-bg-warning">{t("cvsSection.draft")}</span>;
  };

  return (
    <section>
      <SectionHeader
        title={t("cvsSection.title")}
        description={t("cvsSection.description")}
        buttonText={t("cvsSection.browsePositions")}
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

            <div className="text-muted small">{t("cvsSection.loading")}</div>
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
                  <th className="px-4 py-3">{t("common.positions")}</th>

                  <th className="py-3">{t("cvsSection.status")}</th>

                  <th className="py-3">{t("cvsSection.likes")}</th>

                  <th className="py-3">{t("cvsSection.cv")}</th>
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
                              {cv.positionTitle ?? t("cvsSection.untitledPosition")}
                            </div>

                            <div className="small text-muted">CV #{cv.id}</div>
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td>{getStatusBadge(cv.status)}</td>

                    <td>
                      <span className="text-muted">{cv.likeCount ?? 0}</span>
                    </td>

                    <td>
                      <Link
                        to={`/cvs/${cv.id}`}
                        className="text-decoration-none fw-semibold"
                      >
                        {t("cvsSection.open")} →
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
            <div className="fw-semibold mb-1">{t("cvsSection.positionSpecificTitle")}</div>

            <div className="small text-muted">
              {t("cvsSection.positionSpecificDescription")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const EmptyCvs = () => {
  const { t } = useTranslation();
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

        <h3 className="h6 fw-bold">{t("cvsSection.noCvs")}</h3>

        <p className="text-muted small mb-3">
          {t("cvsSection.noCvsDescription")}
        </p>

        <Link to="/positions" className="btn btn-primary">
          {t("cvsSection.browsePositions")}
        </Link>
      </div>
    </div>
  );
};

export default CvsSection;
