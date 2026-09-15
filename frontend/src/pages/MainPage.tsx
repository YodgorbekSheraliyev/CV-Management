import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavBar from "../components/navbar/NavBar";
import { useAuth } from "../hooks/auth";
import type { PositionSummary } from "../models";
import { getPositions } from "../api/positionApi";
import { UserRole } from "../enums/enums";
import ToastNotification from "../components/notifications/ToastNotification";

const MainPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isCandidate = user?.role === UserRole.Candidate;

  const [positions, setPositions] = useState<PositionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      const res = await getPositions();
      setPositions(res);
    } catch (error: any) {
      setToast({
        message: error.message,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const latestPositions = positions.slice(0, 5);

  const popularPositions = [...positions]
    .sort((a, b) => (b.cVsCount ?? 0) - (a.cVsCount ?? 0))
    .slice(0, 5);

  return (
    <div className="min-vh-100 bg-light">
      <NavBar />
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <main className="container py-4 py-md-5">
        <section className="mb-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="badge text-bg-primary rounded-pill px-3 py-2 mb-3">
                {t("mainPage.recruitmentPlatform")}
              </span>

              <h1 className="display-5 fw-bold mb-3">
                {t("mainPage.heroTitle")}
                <br />
                <span className="text-primary">
                  {t("mainPage.heroTitleHighlight")}
                </span>
              </h1>

              <p className="lead text-muted mb-4">
                {t("mainPage.heroDescription")}
              </p>

              <div className="d-flex flex-wrap gap-2">
                <Link to="/positions" className="btn btn-primary px-4">
                  {t("mainPage.browsePositions")}
                </Link>

                {isCandidate && (
                  <Link
                    to="/profile"
                    className="btn btn-outline-secondary px-4"
                  >
                    {t("mainPage.completeProfile")}
                  </Link>
                )}
              </div>
            </div>

            {/* Candidate Profile Card */}
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
                        <h2 className="h6 fw-bold mb-1">
                          {t("mainPage.yourProfile")}
                        </h2>

                        <p className="text-muted small mb-0">
                          {t("mainPage.keepInformationUpdated")}
                        </p>
                      </div>
                    </div>

                    <p className="text-muted small mb-0">
                      {t("mainPage.improveProfile")}
                    </p>

                    <Link
                      to="/profile"
                      className="btn btn-outline-primary btn-sm w-100 mt-3"
                    >
                      {t("mainPage.goToProfile")}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Positions Section */}
        {!loading && positions.length > 0 && (
          <section className="mb-5">
            <div className="row g-4">
              {/* Latest Positions */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-0">
                    <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
                      <div>
                        <h2 className="h5 fw-bold mb-1">
                          {t("mainPage.latestPositions")}
                        </h2>

                        <p className="text-muted small mb-0">
                          {t("mainPage.latestPositionsDescription")}
                        </p>
                      </div>

                      <Link
                        to="/positions"
                        className="btn btn-sm btn-outline-primary"
                      >
                        {t("mainPage.viewAll")}
                      </Link>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="px-4 py-3">
                              {t("mainPage.position")}
                            </th>

                            <th className="py-3">{t("mainPage.access")}</th>

                            <th className="py-3">{t("mainPage.tags")}</th>
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
                                  {position.isPublic
                                    ? t("mainPage.public")
                                    : t("mainPage.restricted")}
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

              {/* Most Popular */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-0">
                    <div className="p-4 border-bottom">
                      <h2 className="h5 fw-bold mb-1">
                        {t("mainPage.mostPopular")}
                      </h2>

                      <p className="text-muted small mb-0">
                        {t("mainPage.popularDescription")}
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
                                {position.cVsCount}
                              </div>

                              <div className="text-muted small">
                                {t("mainPage.cvs")}
                              </div>
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
                        {t("mainPage.exploreAllPositions")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Candidate CTA */}
        {isCandidate && (
          <section>
            <div className="card border-0 bg-primary text-white shadow-sm">
              <div className="card-body p-4 p-md-5">
                <div className="row align-items-center g-4">
                  <div className="col-md-8">
                    <h2 className="h4 fw-bold mb-2">
                      {t("mainPage.standOut")}
                    </h2>

                    <p className="mb-0 opacity-75">
                      {t("mainPage.standOutDescription")}
                    </p>
                  </div>

                  <div className="col-md-4 text-md-end">
                    <Link to="/profile" className="btn btn-light px-4">
                      {t("mainPage.goToMyProfile")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-top bg-white mt-5">
        <div className="container py-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <span className="text-muted small">
              {t("mainPage.footerCopyright")}
            </span>

            <div className="d-flex gap-3">
              <Link
                to="/positions"
                className="text-muted small text-decoration-none"
              >
                {t("mainPage.footerPositions")}
              </Link>

              <Link
                to="/profile"
                className="text-muted small text-decoration-none"
              >
                {t("mainPage.footerProfile")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
