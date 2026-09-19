import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/auth";
import { UserRole } from "../enums/enums";
import GoogleSignInButton from "../components/GoogleSignInButton";
import FacebookSignInButton from "../components/FacebookSignInButton";
import ToastNotification from "../components/notifications/ToastNotification";

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, googleAuth, facebookAuth } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.Candidate);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        role,
      });
      setToast({
        message: t("registerPage.success.registration"),
        type: "success",
      });
      navigate("/");
    } catch (err) {
      setToast({
        message: t("registerPage.errors.registration"),
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(idToken: string) {
    setLoading(true);

    try {
      await googleAuth(idToken, role);
      setToast({
        message: t("registerPage.success.social"),
        type: "success",
      });
      navigate("/");
    } catch (err) {
      setToast({
        message: t("registerPage.errors.google"),
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleFacebookSuccess(accessToken: string) {
    setLoading(true);

    try {
      await facebookAuth(accessToken, role);
      setToast({
        message: t("registerPage.success.social"),
        type: "success",
      });
      navigate("/");
    } catch (err) {
      setToast({
        message: t("registerPage.errors.facebook"),
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <h1 className="h3 fw-bold mb-2">{t("registerPage.title")}</h1>
                  <p className="text-muted mb-0">
                    {t("registerPage.description")}
                  </p>
                </div>

                <ToastNotification
                  toast={toast}
                  onClose={() => setToast(null)}
                />

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    {t("registerPage.role.label")}
                  </label>

                  <div className="row g-3">
                    <div className="col-6">
                      <button
                        type="button"
                        className={`btn w-100 text-start p-3 h-100 ${
                          role === UserRole.Candidate
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => setRole(UserRole.Candidate)}
                      >
                        <div className="text-center">
                          <div className="fs-2 mb-2">
                            <i className="bi bi-person"></i>
                          </div>

                          <div className="fw-semibold">
                            {t("registerPage.role.candidate.title")}
                          </div>

                          <small
                            className={
                              role === UserRole.Candidate
                                ? "text-white-50"
                                : "text-muted"
                            }
                          >
                            {t("registerPage.role.candidate.description")}
                          </small>
                        </div>
                      </button>
                    </div>

                    <div className="col-6">
                      <button
                        type="button"
                        className={`btn w-100 text-start p-3 h-100 ${
                          role === UserRole.Recruiter
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => setRole(UserRole.Recruiter)}
                      >
                        <div className="text-center">
                          <div className="fs-2 mb-2">
                            <i className="bi bi-briefcase"></i>
                          </div>

                          <div className="fw-semibold">
                            {t("registerPage.role.recruiter.title")}
                          </div>

                          <small
                            className={
                              role === UserRole.Recruiter
                                ? "text-white-50"
                                : "text-muted"
                            }
                          >
                            {t("registerPage.role.recruiter.description")}
                          </small>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="firstName"
                        className="form-label fw-semibold"
                      >
                        {t("registerPage.firstName")}
                      </label>

                      <input
                        id="firstName"
                        type="text"
                        className="form-control"
                        placeholder={t("registerPage.firstNamePlaceholder")}
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        autoComplete="given-name"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="lastName"
                        className="form-label fw-semibold"
                      >
                        {t("registerPage.lastName")}
                      </label>

                      <input
                        id="lastName"
                        type="text"
                        className="form-control"
                        placeholder={t("registerPage.lastNamePlaceholder")}
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      {t("registerPage.email")}
                    </label>

                    <input
                      id="email"
                      type="email"
                      className="form-control"
                      placeholder={t("registerPage.emailPlaceholder")}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="password"
                      className="form-label fw-semibold"
                    >
                      {t("registerPage.password")}
                    </label>

                    <input
                      id="password"
                      type="password"
                      className="form-control"
                      placeholder={t("registerPage.passwordPlaceholder")}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                    />

                    <div className="form-text">
                      {t("registerPage.passwordHint")}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          aria-hidden="true"
                        />
                        {t("registerPage.creatingAccount")}
                      </>
                    ) : (
                      t("registerPage.createAccount")
                    )}
                  </button>
                </form>

                <div className="d-flex align-items-center my-4">
                  <hr className="flex-grow-1" />
                  <span className="px-3 text-muted small">
                    {t("registerPage.or")}
                  </span>
                  <hr className="flex-grow-1" />
                </div>

                <div className="my-3 d-flex flex-column gap-2">
                  <GoogleSignInButton
                    onSuccess={handleGoogleSuccess}
                    onError={(message) => setToast({ message, type: "danger" })}
                  />

                  <FacebookSignInButton
                    onSuccess={handleFacebookSuccess}
                    onError={(message) => setToast({ message, type: "danger" })}
                  />
                </div>

                <div className="text-center mt-4">
                  <span className="text-muted">
                    {t("registerPage.alreadyHaveAccount")}{" "}
                  </span>

                  <Link
                    to="/login"
                    className="text-decoration-none fw-semibold"
                  >
                    {t("registerPage.signIn")}
                  </Link>
                </div>
              </div>
            </div>

            <p className="text-center text-muted small mt-4">
              {t("registerPage.footer")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
