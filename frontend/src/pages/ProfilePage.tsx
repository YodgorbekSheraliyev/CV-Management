import { useState } from "react";
import NavBar from "../components/NavBar";
import { useAuth } from "../hooks/auth";
import MeSection from "../components/MeSection";
import InfoSection from "../components/InfoSection";

type Tab = "me" | "info" | "projects" | "cvs";

const ProfilePage = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("me");

  return (
    <div className="min-vhx-100 bg-light">
      <NavBar />

      <main className="container py-4 py-md-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">Personal Profile</h1>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex flex-column flex-md-row align-items-md-center gap-4">
              <div
                className="rounded-circle bg-secondary-subtle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 96, height: 96 }}
              >
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Profile image" />
                ) : (
                  <span className="fs-2 fw-semibold text-secondary">
                    {user?.firstName[0]}
                    {user?.lastName[0]}
                  </span>
                )}
              </div>

              <div className="flex-grow-1">
                <h2 className="h4 fw-bold mb-1">
                  {user?.firstName} {user?.lastName}
                </h2>

                <p className="text-muted mb-2">Software Engineer</p>

                <div className="d-flex flex-wrap gap-3 text-muted small">
                  <span>
                    <i className="bi bi-geo-alt me-1" />
                    Tashkent, Uzbekistan
                  </span>

                  <span>
                    <i className="bi bi-envelope me-1" />
                    {user?.email}
                  </span>
                </div>
              </div>

              <button className="btn btn-outline-primary">Edit profile</button>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-0">
            <ul className="nav nav-tabs border-0">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "me" && "active"}`}
                  onClick={() => setActiveTab("me")}
                >
                  Me
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "info" && "active"}`}
                  onClick={() => setActiveTab("info")}
                >
                  Info
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "projects" && "active"}`}
                  onClick={() => setActiveTab("projects")}
                >
                  Projects
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "cvs" && "active"}`}
                  onClick={() => setActiveTab("cvs")}
                >
                  CVs
                </button>
              </li>
            </ul>
          </div>
        </div>

        {activeTab == "me" &&  <MeSection user={user!} />}
        {activeTab == "info" && <InfoSection user={user!} />}
        {activeTab == "projects" && <div>projects</div>}
        {activeTab == "cvs" && <div>cvs</div>}
      </main>
    </div>
  );
};

export default ProfilePage;
