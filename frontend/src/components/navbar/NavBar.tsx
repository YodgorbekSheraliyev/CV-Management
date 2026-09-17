import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../../hooks/auth";
import { UserRole } from "../../enums/enums";
import LanguageSelector from "../LanguageSelector";
import { useTranslation } from "react-i18next";

const NavBar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const isRecruiterOrAdmin =
    user?.role == UserRole.Recruiter || user?.role == UserRole.Administrator;

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold">
          Recruitment
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "nav-link active fw-semibold" : "nav-link"
                }
              >
                {t("navbar.home")}
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/positions"
                className={({ isActive }) =>
                  isActive ? "nav-link active fw-semibold" : "nav-link"
                }
              >
                {t("navbar.positions")}
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive ? "nav-link active fw-semibold" : "nav-link"
                }
              >
                {t("navbar.profile")}
              </NavLink>
            </li>

            {isRecruiterOrAdmin && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/applications"
                    className={({ isActive }) =>
                      isActive ? "nav-link active fw-semibold" : "nav-link"
                    }
                  >
                    {t("navbar.applications")}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/attribute"
                    className={({ isActive }) =>
                      isActive ? "nav-link active fw-semibold" : "nav-link"
                    }
                  >
                    {t("navbar.attributes")}
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <LanguageSelector />

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="d-flex align-items-center gap-2 text-decoration-none text-dark"
                >
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-semibold"
                    style={{
                      width: 36,
                      height: 36,
                    }}
                  >
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </div>
                </Link>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={logout}
                >
                  {t("navbar.logout")}
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-sm btn-primary">
                {t("navbar.login")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
