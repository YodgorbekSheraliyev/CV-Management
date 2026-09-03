import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../hooks/auth";
import { useLocale } from "../hooks/locale";

const NavBar = () => {
  const { user, logout } = useAuth();
  const { locale, changeLocale } = useLocale();

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
                Home
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/positions"
                className={({ isActive }) =>
                  isActive ? "nav-link active fw-semibold" : "nav-link"
                }
              >
                Positions
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive ? "nav-link active fw-semibold" : "nav-link"
                }
              >
                My Profile
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/cvs"
                className={({ isActive }) =>
                  isActive ? "nav-link active fw-semibold" : "nav-link"
                }
              >
                My CVs
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            <div className="dropdown">
              <button
                className="btn btn-sm btn-outline-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {locale.toUpperCase()}
              </button>

              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button
                    type="button"
                    className={`dropdown-item ${
                      locale === "en" ? "active" : ""
                    }`}
                    onClick={() => changeLocale("en")}
                  >
                    English
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className={`dropdown-item ${
                      locale === "uz" ? "active" : ""
                    }`}
                    onClick={() => changeLocale("uz")}
                  >
                    O'zbekcha
                  </button>
                </li>
              </ul>
            </div>

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
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-sm btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
