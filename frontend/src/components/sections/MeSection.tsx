import { useEffect, useState } from "react";

import type { User } from "../../models";
import SectionHeader from "../SectionHeader";

interface MeSectionProps {
  user: User;

  onSave: (data: {
    firstName: string;
    lastName: string;
    location: string;
  }) => Promise<void>;
}

interface FormValues {
  firstName: string;
  lastName: string;
  location: string;
}

const MeSection = ({
  user,
  onSave,
}: MeSectionProps) => {
  const [isEditing, setIsEditing] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [formValues, setFormValues] = useState<FormValues>({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      location: user.location ?? "",
    });

  useEffect(() => {
    setFormValues({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      location: user.location ?? "",
    });
  }, [user]);

  const handleChange = (field: keyof FormValues, value: string) => {
    setFormValues((current) => ({...current, [field]: value}));
  };

  const handleEdit = () => {
    setError("");

    setFormValues({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      location: user.location ?? "",
    });

    setIsEditing(true);
  };

  const handleCancel = () => {
    setError("");

    setFormValues({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      location: user.location ?? "",
    });

    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formValues.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!formValues.lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    try {
      setError("");
      setIsSaving(true);

      await onSave({
        firstName: formValues.firstName.trim(),
        lastName: formValues.lastName.trim(),
        location: formValues.location.trim(),
      });

      setIsEditing(false);
    } catch {
      setError(
        "Could not save your information. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>

      <SectionHeader
        title="Personal information"
        description="Your basic personal details used across your profile and CVs."
        buttonText={isEditing ? undefined : "Edit"}
        onClick={isEditing ? undefined : handleEdit}
      />

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">

          {/* Error */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-circle" />
              <span>{error}</span>
            </div>
          )}

          <div className="row g-4">

            {/* First name */}
            <div className="col-12 col-md-6">

              <label
                htmlFor="firstName"
                className="form-label fw-semibold"
              >
                First name
              </label>

              {isEditing ? (
                <input
                  id="firstName"
                  type="text"
                  className="form-control"
                  value={formValues.firstName}
                  onChange={(event) =>
                    handleChange(
                      "firstName",
                      event.target.value,
                    )
                  }
                  disabled={isSaving}
                />
              ) : (
                <div className="profile-value">
                  {user.firstName ||
                    "Not provided"}
                </div>
              )}

            </div>

            {/* Last name */}
            <div className="col-12 col-md-6">

              <label
                htmlFor="lastName"
                className="form-label fw-semibold"
              >
                Last name
              </label>

              {isEditing ? (
                <input
                  id="lastName"
                  type="text"
                  className="form-control"
                  value={formValues.lastName}
                  onChange={(event) =>
                    handleChange(
                      "lastName",
                      event.target.value,
                    )
                  }
                  disabled={isSaving}
                />
              ) : (
                <div className="profile-value">
                  {user.lastName ||
                    "Not provided"}
                </div>
              )}

            </div>

            {/* Email */}
            <div className="col-12 col-md-6">

              <label
                htmlFor="email"
                className="form-label fw-semibold"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                className="form-control"
                value={user.email ?? ""}
                disabled
                readOnly
              />

              <div className="form-text">
                Email cannot be changed here.
              </div>

            </div>

            {/* Location */}
            <div className="col-12 col-md-6">

              <label
                htmlFor="location"
                className="form-label fw-semibold"
              >
                Location
              </label>

              {isEditing ? (
                <input
                  id="location"
                  type="text"
                  className="form-control"
                  placeholder="For example: Tashkent, Uzbekistan"
                  value={formValues.location}
                  onChange={(event) =>
                    handleChange(
                      "location",
                      event.target.value,
                    )
                  }
                  disabled={isSaving}
                />
              ) : (
                <div className="profile-value">
                  {user.location ||
                    "Not provided"}
                </div>
              )}

            </div>
          </div>

          {/* Actions */}
          {isEditing && (
            <div className="border-top mt-4 pt-4 d-flex flex-column flex-sm-row justify-content-end gap-2">

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2" />
                    Save changes
                  </>
                )}
              </button>

            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default MeSection;
