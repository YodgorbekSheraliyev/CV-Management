import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useAuth } from "../hooks/auth";
import ToastNotification from "../components/notifications/ToastNotification";
import FacebookSignInButton from "../components/FacebookSignInButton";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, googleAuth, facebookAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });

      navigate("/");
    } catch (err) {
      setToast({
        message: "Unable to login your account. Please try again.",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(idToken: string) {
    setLoading(true);

    try {
      await googleAuth(idToken);

      navigate("/");
    } catch (err) {
      setToast({
        message: "Unable to login with Google account. Please try again.",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleFacebookSuccess(accessToken: string) {
    setLoading(true);

    try {
      await facebookAuth(accessToken);
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
    <div className="min-vh-100 bg-light d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <h1 className="h3 fw-bold mb-2">Welcome back</h1>

                  <p className="text-muted mb-0">
                    Sign in to your recruitment account
                  </p>
                </div>

                <ToastNotification
                  toast={toast}
                  onClose={() => setToast(null)}
                />

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email address
                    </label>

                    <input
                      id="email"
                      type="email"
                      className="form-control"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="mb-3">
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
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="d-flex justify-content-end mb-4">
                    <Link
                      to="/forgot-password"
                      className="text-decoration-none"
                    >
                      Forgot password?
                    </Link>
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
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </form>

                <div className="d-flex align-items-center my-4">
                  <hr className="flex-grow-1" />

                  <span className="px-3 text-muted small">OR</span>

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
                  <span className="text-muted">Don't have an account? </span>

                  <Link
                    to="/register"
                    className="text-decoration-none fw-semibold"
                  >
                    Create an account
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

export default LoginPage;
