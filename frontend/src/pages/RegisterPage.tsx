import { useState, type FormEvent } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/auth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, error, setError } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register({
        firstName,
        lastName,
        email,
        password,
      });

      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center">
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

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

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
