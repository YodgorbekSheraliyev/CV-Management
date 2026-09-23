import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NavBar from "../components/navbar/NavBar";
import { useAuth } from "../hooks/auth";
import { UserRole } from "../enums/enums";
import type { AdminUser } from "../models";
import {
  deleteAdminUser,
  getAdminUsers,
  updateAdminUserBlock,
  updateAdminUserRole,
} from "../api/userApi";

const roleValue: Record<string, number> = {
  Candidate: 0,
  Recruiter: 1,
  Administrator: 2,
};

const AdminUsersPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const loadUsers = async () => setUsers(await getAdminUsers());

  useEffect(() => {
    if (user?.role === UserRole.Administrator) void loadUsers();
  }, [user?.role]);

  if (user?.role !== UserRole.Administrator) {
    return (
      <div className="container py-5">
        {t("adminUsers.administratorAccessRequired")}
      </div>
    );
  }

  const selected = users.find((item) => item.id === selectedId);
  const refreshSelected = (updated: AdminUser) => {
    setUsers((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
    setMessage(t("adminUsers.userUpdated"));
  };

  const changeRole = async (role: string) => {
    if (!selected) return;
    refreshSelected(
      await updateAdminUserRole(selected.id, roleValue[role], selected.version),
    );
  };

  const toggleBlocked = async () => {
    if (!selected) return;
    refreshSelected(
      await updateAdminUserBlock(
        selected.id,
        !selected.isBlocked,
        selected.version,
      ),
    );
  };

  const removeSelected = async () => {
    if (!selected) return;
    await deleteAdminUser(selected.id);
    setUsers((current) => current.filter((item) => item.id !== selected.id));
    setSelectedId(null);
    setMessage(t("adminUsers.userDeleted"));
  };

  return (
    <div className="min-vh-100 bg-light">
      <NavBar />
      <main className="container py-4 py-md-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">{t("adminUsers.title")}</h1>
            <p className="text-muted mb-0">{t("adminUsers.description")}</p>
          </div>
        </div>

        {message && (
          <div className="alert alert-success d-flex align-items-center gap-2">
            <i className="bi bi-check-circle" aria-hidden="true" />
            <span>{message}</span>
          </div>
        )}

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3 p-md-4 d-flex flex-wrap gap-2 align-items-center">
            <select
              className="form-select"
              style={{ maxWidth: 220 }}
              disabled={!selected}
              value={selected?.role ?? ""}
              onChange={(event) => void changeRole(event.target.value)}
            >
              <option value="">{t("adminUsers.changeRole")}</option>
              <option value="Candidate">{t("adminUsers.candidate")}</option>
              <option value="Recruiter">{t("adminUsers.recruiter")}</option>
              <option value="Administrator">
                {t("adminUsers.administrator")}
              </option>
            </select>
            <button
              className="btn btn-outline-warning"
              disabled={!selected}
              onClick={() => void toggleBlocked()}
            >
              <i
                className={`bi ${
                  selected?.isBlocked ? "bi-unlock" : "bi-slash-circle"
                } me-2`}
                aria-hidden="true"
              />
              {selected?.isBlocked
                ? t("adminUsers.unblockUser")
                : t("adminUsers.blockUser")}
            </button>
            <button
              className="btn btn-outline-danger"
              disabled={!selected}
              onClick={() => void removeSelected()}
            >
              <i className="bi bi-trash me-2" aria-hidden="true" />
              {t("adminUsers.deleteUser")}
            </button>
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3">{t("adminUsers.select")}</th>
                <th className="py-3">{t("adminUsers.email")}</th>
                <th>{t("adminUsers.role")}</th>
                <th>{t("adminUsers.status")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id}>
                  <td className="px-4">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="selected-user"
                      checked={selectedId === item.id}
                      onChange={() => setSelectedId(item.id)}
                      aria-label={t("adminUsers.selectUser", {
                        email: item.email,
                      })}
                    />
                  </td>
                  <td>{item.email}</td>
                  <td>
                    <span className="badge text-bg-light border">
                      {t(`adminUsers.${item.role.toLowerCase()}`)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge rounded-pill ${
                        item.isBlocked
                          ? "text-bg-warning-subtle text-warning-emphasis"
                          : "text-bg-success-subtle text-success-emphasis"
                      }`}
                    >
                      {item.isBlocked
                        ? t("adminUsers.blocked")
                        : t("adminUsers.active")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUsersPage;
