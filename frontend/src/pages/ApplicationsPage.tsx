import { useEffect, useMemo, useState } from "react";
import NavBar from "../components/navbar/NavBar";
import { getAllApplications } from "../api/applicationsApi";
import ToastNotification from "../components/notifications/ToastNotification";
import type { Application } from "../models";
import { Link } from "react-router-dom";

const ApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);

  const loadApplications = async () => {
    try {
      const res = await getAllApplications();
      setApplications(res);
    } catch (error: any) {
      setToast({ message: error.message, type: "danger" });
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const levels = useMemo(() => {
    return Array.from(
      new Set(
        applications.map((application) => application.level).filter(Boolean),
      ),
    );
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return applications
      .filter((application) => {
        const matchesApplication =
          !query ||
          application.positionTitle.toLowerCase().includes(query) ||
          application.candidateName.toLowerCase().includes(query) ||
          application.level?.toLowerCase().includes(query);
        const matchesLevel = !levelFilter || application.level === levelFilter;
        return matchesApplication && matchesLevel;
      })
      .sort((a, b) =>
        a.positionTitle
          .toLowerCase()
          .localeCompare(b.positionTitle.toLowerCase()),
      );
  }, [applications, search, levelFilter]);

  const allVisibleSelected =
    filteredApplications.length > 0 &&
    filteredApplications.every((application) =>
      selectedIds.includes(application.cvId),
    );

  const toggleApplication = (cvId: number) => {
    setSelectedIds((current) =>
      current.includes(cvId)
        ? current.filter((id) => id !== cvId)
        : [...current, cvId],
    );
  };

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) =>
            !filteredApplications.some(
              (application) => application.cvId === id,
            ),
        ),
      );

      return;
    }

    setSelectedIds((current) => [
      ...new Set([
        ...current,
        ...filteredApplications.map((application) => application.cvId),
      ]),
    ]);
  };

  const handleDelete = () => {
    console.log("Delete applications:", selectedIds);
    setSelectedIds([]);
  };

  return (
    <>
      <NavBar />
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Applications</h2>

          <button
            className="btn btn-danger"
            disabled={selectedIds.length === 0}
            onClick={handleDelete}
          >
            Delete
            {selectedIds.length > 0 && ` (${selectedIds.length})`}
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="d-flex  flex-column flex-md-row gap-5">
                <div className="position-relative col-md-4 col-sm-3">
                  <i
                    className="bi bi-search position-absolute text-muted"
                    style={{
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />

                  <input
                    type="search"
                    className="form-control bg-light ps-5"
                    placeholder="Search attributes..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <div className="col-md-1 col-sm-3">
                  <select
                    className="form-select"
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                  >
                    <option value="">All levels</option>

                    {levels.map((level) => (
                      <option key={level} value={level!}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                    />
                  </th>

                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Level</th>
                  <th>Applied</th>
                </tr>
              </thead>

              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((application) => (
                    <tr key={application.cvId}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedIds.includes(application.cvId)}
                          onChange={() => toggleApplication(application.cvId)}
                        />
                      </td>

                      <td>{application.candidateName}</td>

                      <td>
                        <Link to={`/positions/${application.positionId}`}>
                          {application.positionTitle}
                        </Link>
                      </td>

                      <td>{application.level ?? "-"}</td>

                      <td>
                        {new Date(application.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplicationsPage;
