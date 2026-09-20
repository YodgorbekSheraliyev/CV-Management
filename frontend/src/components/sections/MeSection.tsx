import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { User } from "../../models";
import SectionHeader from "../SectionHeader";
import ImageField from "../fields/ImageField";

interface MeSectionProps {
  user: User;
  onSave: (data: {
    firstName: string;
    lastName: string;
    location: string;
    imageUrl?: string;
  }) => Promise<void>;
}

interface FormValues {
  firstName: string;
  lastName: string;
  location: string;
  imageUrl?: string;
}

const IMAGE_ATTRIBUTE_ID = 4;

const MeSection = ({ user, onSave }: MeSectionProps) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [formValues, setFormValues] = useState<FormValues>({
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    location: user.location ?? "",
    imageUrl: user.imageUrl,
  });

  useEffect(() => {
    setFormValues({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      location: user.location ?? "",
      imageUrl: user.imageUrl,
    });
  }, [user]);

  const handleChange = (field: keyof FormValues, value: string) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleEdit = () => {
    setError("");

    setFormValues({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      location: user.location ?? "",
      imageUrl: user.imageUrl,
    });

    setIsEditing(true);
  };

  const handleCancel = () => {
    setError("");

    setFormValues({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      location: user.location ?? "",
      imageUrl: user.imageUrl,
    });

    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formValues.firstName.trim()) {
      setError(t("meSection.firstNameRequired"));
      return;
    }

    if (!formValues.lastName.trim()) {
      setError(t("meSection.lastNameRequired"));
      return;
    }

    try {
      setError("");
      setIsSaving(true);

      await onSave({
        firstName: formValues.firstName.trim(),
        lastName: formValues.lastName.trim(),
        location: formValues.location.trim(),
        imageUrl: formValues.imageUrl?.trim(),
      });

      setIsEditing(false);
    } catch {
      setError(t("meSection.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>
      <SectionHeader
        title={t("meSection.title")}
        description={t("meSection.description")}
        buttonText={isEditing ? undefined : t("common.edit")}
        onClick={isEditing ? undefined : handleEdit}
      />

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-circle" />
              <span>{error}</span>
            </div>
          )}

          <div className="row g-4">
            {/* First name */}
            <div className="col-12 col-md-6">
              <label htmlFor="firstName" className="form-label fw-semibold">
                {t("meSection.firstName")}
              </label>

              {isEditing ? (
                <input
                  id="firstName"
                  type="text"
                  className="form-control"
                  value={formValues.firstName}
                  onChange={(event) =>
                    handleChange("firstName", event.target.value)
                  }
                  disabled={isSaving}
                />
              ) : (
                <div className="profile-value">
                  {user.firstName || t("meSection.notProvided")}
                </div>
              )}
            </div>

            {/* Last name */}
            <div className="col-12 col-md-6">
              <label htmlFor="lastName" className="form-label fw-semibold">
                {t("meSection.lastName")}
              </label>

              {isEditing ? (
                <input
                  id="lastName"
                  type="text"
                  className="form-control"
                  value={formValues.lastName}
                  onChange={(event) =>
                    handleChange("lastName", event.target.value)
                  }
                  disabled={isSaving}
                />
              ) : (
                <div className="profile-value">
                  {user.lastName || t("meSection.notProvided")}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="col-12 col-md-6">
              <label htmlFor="email" className="form-label fw-semibold">
                {t("meSection.email")}
              </label>

              <input
                id="email"
                type="email"
                className="form-control"
                value={user.email ?? ""}
                disabled
                readOnly
              />

              <div className="form-text">{t("meSection.emailReadOnly")}</div>
            </div>

            {/* Location */}
            <div className="col-12 col-md-6">
              <label htmlFor="location" className="form-label fw-semibold">
                {t("meSection.location")}
              </label>

              {isEditing ? (
                <input
                  id="location"
                  type="text"
                  className="form-control"
                  placeholder={t("meSection.locationPlaceholder")}
                  value={formValues.location}
                  onChange={(event) =>
                    handleChange("location", event.target.value)
                  }
                  disabled={isSaving}
                />
              ) : (
                <div className="profile-value">
                  {user.location || t("meSection.notProvided")}
                </div>
              )}
            </div>

            {/* Profile image */}
            {isEditing && (
              <div className="col-12">
                <label className="form-label fw-semibold">{t("meSection.profileImage")}</label>

                <ImageField
                  value={formValues.imageUrl ?? ""}
                  attributeId={IMAGE_ATTRIBUTE_ID}
                  onChange={(value) => handleChange("imageUrl", value)}
                />
              </div>
            )}
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
                {t("common.cancel")}
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
                    {t("meSection.saving")}
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2" />
                    {t("meSection.saveChanges")}
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
