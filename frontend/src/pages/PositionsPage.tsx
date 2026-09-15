import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/navbar/NavBar";
import type { PositionSummary } from "../models";
import { useAuth } from "../hooks/auth";
import { getPositions } from "../api/positionApi";
import { UserRole } from "../enums/enums";
import { useTranslation } from "react-i18next";

const PositionsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isRecruiterOrAdmin =
    user?.role === UserRole.Recruiter || user?.role === UserRole.Administrator;

  const [positions, setPositions] = useState<PositionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [access, setAccess] = useState("All positions");
  const [sort, setSort] = useState("Most CVs");

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      const res = await getPositions();
      setPositions(res);
    } catch (error: any) {
      setError(error.message ?? t("positionsPage.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const filteredPositions = useMemo(() => {
    const filtered = positions.filter((position) => {
      const query = search.toLowerCase();
      const matchesSearch =
        query === "" ||
        position.title.toLowerCase().includes(query) ||
        (position.tags ?? []).some((tag) => tag.toLowerCase().includes(query));

      const matchesAccess =
        access === "All positions" ||
        (access === "Public" && position.isPublic) ||
        (access === "Restricted" && !position.isPublic);

      return matchesSearch && matchesAccess;
    });

    switch (sort) {
      case "Most CVs":
        return [...filtered].sort(
          (a, b) => (b.cVsCount ?? 0) - (a.cVsCount ?? 0),
        );
      case "Title A–Z":
        return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return filtered;
    }
  }, [positions, search, access, sort]);

  return (
    <div className="min-vh-100 bg-light">
      <NavBar />

      <main className="container py-4 py-md-5">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">{t("positionsPage.title")}</h1>

            <p className="text-muted mb-0">
              {isRecruiterOrAdmin
                ? t("positionsPage.recruiterDescription")
                : t("positionsPage.candidateDescription")}
            </p>
          </div>

          {isRecruiterOrAdmin && (
            <Link to="/positions/new" className="btn btn-primary">
              + {t("positionsPage.createPosition")}
            </Link>
          )}
        </div>

        {error && (
          <div className="alert alert-danger py-2 small" role="alert">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3 p-md-4">
            <div className="row g-3">
              <div className="col-12 col-lg-8">
                <label
                  htmlFor="position-search"
                  className="form-label small fw-semibold"
                >
                  {t("positionsPage.searchPositions")}
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white">🔎</span>
                  <input
                    id="position-search"
                    type="search"
                    className="form-control"
                    placeholder={t("positionsPage.searchPlaceholder")}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </div>

              <div className="col-6 col-lg-2">
                <label
                  htmlFor="access"
                  className="form-label small fw-semibold"
                >
                  {t("positionsPage.access")}
                </label>
                <select
                  id="access"
                  className="form-select"
                  value={access}
                  onChange={(event) => setAccess(event.target.value)}
                >
                  <option value="All positions">
                    {t("positionsPage.allPositions")}
                  </option>

                  <option value="Public">{t("positionsPage.public")}</option>

                  <option value="Restricted">
                    {t("positionsPage.restricted")}
                  </option>
                </select>
              </div>

              <div className="col-6 col-lg-2">
                <label htmlFor="sort" className="form-label small fw-semibold">
                  {t("positionsPage.sortBy")}
                </label>
                <select
                  id="sort"
                  className="form-select"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="Most CVs">{t("positionsPage.mostCvs")}</option>

                  <option value="Title A–Z">
                    {t("positionsPage.titleAz")}
                  </option>
                </select>
              </div>
            </div>

            {positions.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mt-3 pt-3 border-top">
                <span className="text-muted small align-self-center me-1">
                  {t("positionsPage.popular")}:
                </span>
                {Array.from(
                  new Set(
                    positions.flatMap((p) => (p.tags ?? []).map((t) => t)),
                  ),
                )
                  .slice(0, 5)
                  .map((tagName) => (
                    <button
                      key={tagName}
                      className="btn btn-sm btn-outline-secondary rounded-pill"
                      onClick={() => setSearch(tagName)}
                    >
                      {tagName}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted py-5">
            {t("positionsPage.loading")}
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="text-muted small">
                {t("positionsPage.showing")}{" "}
                <strong className="text-dark">
                  {filteredPositions.length}
                </strong>{" "}
                {t("positionsPage.of")}{" "}
                <strong className="text-dark">{positions.length}</strong>{" "}
                {t("positionsPage.positions")}
              </div>
            </div>

            {/* Desktop table */}
            <div className="card border-0 shadow-sm d-none d-lg-block">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3">
                        {t("positionsPage.position")}
                      </th>

                      <th className="py-3">{t("positionsPage.access")}</th>

                      <th className="py-3">{t("positionsPage.tags")}</th>

                      <th className="py-3">{t("positionsPage.maxProjects")}</th>

                      {isRecruiterOrAdmin && (
                        <th className="py-3 text-center">
                          {t("positionsPage.cvs")}
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPositions.map((position) => (
                      <tr key={position.id}>
                        <td className="px-4 py-3">
                          <Link
                            to={`/positions/${position.id}`}
                            className="text-decoration-none"
                          >
                            <div className="fw-semibold text-dark">
                              {position.title}
                            </div>
                            <div
                              className="text-muted small text-truncate"
                              style={{ maxWidth: 300 }}
                            >
                              {position.description}
                            </div>
                          </Link>
                        </td>

                        <td>
                          {position.isPublic ? (
                            <span className="badge rounded-pill text-bg-success-subtle text-success-emphasis">
                              {t("positionsPage.public")}
                            </span>
                          ) : (
                            <span className="badge rounded-pill text-bg-warning-subtle text-warning-emphasis">
                              {t("positionsPage.restricted")}
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {(position.tags ?? []).slice(0, 2).map((tag) => (
                              <span
                                className="badge rounded-pill text-bg-light border"
                                key={tag}
                              >
                                {tag}
                              </span>
                            ))}
                            {(position.tags?.length ?? 0) > 2 && (
                              <span className="badge rounded-pill text-bg-light border">
                                +{(position.tags?.length ?? 0) - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className="small">{position.maxProjects}</span>
                        </td>

                        {isRecruiterOrAdmin && (
                          <td className="text-center">
                            <span className="fw-semibold">
                              {position.cVsCount ?? 0}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredPositions.length === 0 && <EmptyState />}
            </div>

            {/* Mobile cards */}
            <div className="d-lg-none">
              <div className="d-flex flex-column gap-3">
                {filteredPositions.map((position) => (
                  <Link
                    to={`/positions/${position.id}`}
                    className="card border-0 shadow-sm text-decoration-none text-dark"
                    key={position.id}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                        <h2 className="h6 fw-bold mb-1">{position.title}</h2>
                        <span
                          className={`badge rounded-pill flex-shrink-0 ${
                            position.isPublic
                              ? "text-bg-success-subtle text-success-emphasis"
                              : "text-bg-warning-subtle text-warning-emphasis"
                          }`}
                        >
                          {position.isPublic
                            ? t("positionsPage.public")
                            : t("positionsPage.restricted")}
                        </span>
                      </div>

                      <p className="text-muted small mb-3">
                        {position.description}
                      </p>

                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {(position.tags ?? []).map((tag) => (
                          <span
                            className="badge rounded-pill text-bg-light border"
                            key={tag}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                        <div className="d-flex gap-3">
                          {isRecruiterOrAdmin && (
                            <span className="small text-muted">
                              {position.cVsCount ?? 0} {t("positionsPage.cvs")}
                            </span>
                          )}
                          <span className="small text-muted">
                            {t("positionsPage.maxProjectsValue", {
                              count: position.maxProjects,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {filteredPositions.length === 0 && <EmptyState />}
              </div>
            </div>
          </>
        )}

        {/* Information */}
        <div className="alert alert-light border mt-4">
          <div className="d-flex gap-3">
            <span className="fs-5">ℹ️</span>
            <div>
              <div className="fw-semibold mb-1">
                {t("positionsPage.aboutPositions")}
              </div>

              <div className="text-muted small">
                {t("positionsPage.aboutPositionsDescription")}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-top bg-white mt-5">
        <div className="container py-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <span className="text-muted small">
              {t("positionsPage.footerCopyright")}
            </span>
            <div className="d-flex gap-3">
              <Link to="/" className="text-muted small text-decoration-none">
                {t("positionsPage.footerHome")}
              </Link>
              <Link
                to="/profile"
                className="text-muted small text-decoration-none"
              >
                {t("positionsPage.footerProfile")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const EmptyState = () => {
  const { t } = useTranslation();
  return (
    <div className="text-center py-5 px-4">
      <div className="fs-1 mb-3">🔎</div>

      <h2 className="h5 fw-bold">{t("positionsPage.noPositionsFound")}</h2>

      <p className="text-muted small mb-3">
        {t("positionsPage.changeSearchOrFilters")}
      </p>

      <button className="btn btn-outline-primary btn-sm">
        {t("positionsPage.clearFilters")}
      </button>
    </div>
  );
};

export default PositionsPage;
