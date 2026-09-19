import { useState, type FormEvent } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/auth";
import { UserRole } from "../enums/enums";
import GoogleSignInButton from "../components/GoogleSignInButton";
import FacebookSignInButton from "../components/FacebookSignInButton";
import ToastNotification from "../components/notifications/ToastNotification";

const RegisterPage = () => {
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
        message: "Successfully completed registration",
        type: "success",
      });

      navigate("/");
    } catch (err) {
      setToast({
        message: "Unable to create your account. Please try again.",
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
      setToast({ message: "Successfully registered", type: "success" });

      navigate("/");
    } catch (err) {
      setToast({
        message: "Unable to sign in with Google. Please try again.",
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
        message: "Successfully registered",
        type: "success",
      });

      navigate("/");
    } catch (err) {
      setToast({
        message: "Unable to sign in with Facebook. Please try again.",
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
                  <h1 className="h3 fw-bold mb-2">Create your account</h1>
                  <p className="text-muted mb-0">
                    Join our recruitment platform
                  </p>
                </div>

                <ToastNotification
                  toast={toast}
                  onClose={() => setToast(null)}
                />

                {/* Role selection */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    I want to register as
                  </label>

                  <div className="row g-3">
                    {/* Candidate */}
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

                          <div className="fw-semibold">Candidate</div>

                          <small
                            className={
                              role === UserRole.Candidate
                                ? "text-white-50"
                                : "text-muted"
                            }
                          >
                            Find opportunities
                          </small>
                        </div>
                      </button>
                    </div>

                    {/* Recruiter */}
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

                          <div className="fw-semibold">Recruiter</div>

                          <small
                            className={
                              role === UserRole.Recruiter
                                ? "text-white-50"
                                : "text-muted"
                            }
                          >
                            Find candidates
                          </small>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Registration form */}
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label
                        htmlFor="firstName"
                        className="form-label fw-semibold"
                      >
                        First name
                      </label>

                      <input
                        id="firstName"
                        type="text"
                        className="form-control"
                        placeholder="John"
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
                        Last name
                      </label>

                      <input
                        id="lastName"
                        type="text"
                        className="form-control"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email address
                    </label>

                    <input
                      id="email"
                      className="form-control"
                      placeholder="you@example.com"
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
                      Password
                    </label>

                    <input
                      id="password"
                      type="password"
                      className="form-control"
                      placeholder="Create a password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                    />

                    <div className="form-text">
                      Password must be at least 8 characters.
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
                        Creating account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="d-flex align-items-center my-4">
                  <hr className="flex-grow-1" />

                  <span className="px-3 text-muted small">OR</span>

                  <hr className="flex-grow-1" />
                </div>

                <div className="my-3 d-flex flex-column gap-2">
                  {/* Google registration */}
                  <GoogleSignInButton
                    onSuccess={handleGoogleSuccess}
                    onError={(message) => setToast({ message, type: "danger" })}
                  />

                  {/* Facebook registration */}
                  <FacebookSignInButton
                    onSuccess={handleFacebookSuccess}
                    onError={(message) => setToast({ message, type: "danger" })}
                  />
                </div>

                <div className="text-center mt-4">
                  <span className="text-muted">Already have an account? </span>

                  <Link
                    to="/login"
                    className="text-decoration-none fw-semibold"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>

            <p className="text-center text-muted small mt-4">
              Find the right opportunities. Build your future.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
