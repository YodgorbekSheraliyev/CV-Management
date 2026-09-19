import { useState } from "react";
import { useTranslation } from "react-i18next";
import NavBar from "../components/navbar/NavBar";
import { useAuth } from "../hooks/auth";
import MeSection from "../components/sections/MeSection";
import InfoSection from "../components/sections/InfoSection";
import ProjectsSection from "../components/sections/ProjectsSection";
import CvsSection from "../components/sections/CvsSection";
import { updateUser } from "../api/userApi";
import { UserRole } from "../enums/enums";
import ToastNotification from "../components/notifications/ToastNotification";

type Tab = "me" | "info" | "projects" | "cvs";

interface UpdateUserData {
  firstName: string;
  lastName: string;
  location: string;
}

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("me");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);

  const handleUpdateUser = async (data: UpdateUserData): Promise<void> => {
    if (!user) {
      return;
    }

    try {
      const updatedUser = await updateUser(user.id, data);
      setToast({
        message: t("profilePage.success.changesSaved"),
        type: "success",
      });
      setUser?.(updatedUser);
      setToast({
        message: t("profilePage.success.profileUpdated"),
        type: "success",
      });
    } catch (err: any) {
      setToast({
        message: err?.message ?? t("profilePage.errors.updateFailed"),
        type: "danger",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-vh-100 bg-light">
        <NavBar />

        <main className="container py-5">
          <div className="alert alert-info">
            {t("profilePage.loginRequired")}
          </div>
        </main>
      </div>
    );
  }

  const initials = `${user.firstName?.[0] ?? ""}${
    user.lastName?.[0] ?? ""
  }`.toUpperCase();

  const tabs: {
    value: Tab;
    label: string;
    icon: string;
  }[] = [
    {
      value: "me",
      label: t("profilePage.tabs.personal"),
      icon: "bi-person",
    },
    {
      value: "info",
      label: t("profilePage.tabs.additionalInfo"),
      icon: "bi-list-ul",
    },
  ];

  if (user.role != UserRole.Recruiter) {
    tabs.push(
      {
        value: "projects",
        label: t("profilePage.tabs.projects"),
        icon: "bi-kanban",
      },
      {
        value: "cvs",
        label: t("profilePage.tabs.cvs"),
        icon: "bi-file-earmark-person",
      },
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <NavBar />

      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <main className="container py-4 py-md-5">
        <div className="mb-4">
          <h1 className="h3 fw-bold mb-1">{t("profilePage.title")}</h1>
          <p className="text-muted mb-0">{t("profilePage.description")}</p>
        </div>

        <section className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
              <div
                className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden"
                style={{
                  width: 88,
                  height: 88,
                }}
              >
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={t("profilePage.profileImage")}
                    className="w-100 h-100 object-fit-cover"
                  />
                ) : (
                  <span className="fs-2 fw-bold">{initials}</span>
                )}
              </div>

              <div className="flex-grow-1">
                <h2 className="h4 fw-bold mb-1">
                  {user.firstName} {user.lastName}
                </h2>

                <div className="text-muted small d-flex flex-column gap-1">
                  <span>
                    <i className="bi bi-envelope me-2" />
                    {user.email}
                  </span>

                  <span>
                    <i className="bi bi-geo-alt me-2" />
                    {user.location || t("profilePage.locationNotProvided")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card border-0 shadow-sm mb-4">
          <div className="card-body p-2">
            <div className="nav nav-pills flex-column flex-md-row gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={`nav-link flex-fill text-md-center ${
                    activeTab === tab.value ? "active" : "text-dark"
                  }`}
                  onClick={() => setActiveTab(tab.value)}
                >
                  <i className={`${tab.icon} me-2`} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {activeTab === "me" && (
          <MeSection user={user} onSave={handleUpdateUser} />
        )}

        {activeTab === "info" && <InfoSection user={user} />}

        {activeTab === "projects" && <ProjectsSection />}

        {activeTab === "cvs" && <CvsSection />}
      </main>
    </div>
  );
};

export default ProfilePage;
