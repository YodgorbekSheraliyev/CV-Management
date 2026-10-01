import { useState } from "react";
import { useTranslation } from "react-i18next";

export interface SalesforceContactForm {
  phone: string | null;
  linkedInUrl: string | null;
  gitHubUrl: string | null;
  notes: string | null;
}

export interface SalesforceProfileData {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  location: string | null;
}

interface SalesforceModalProps {
  profile: SalesforceProfileData;
  onClose: () => void;
  onSubmit: (data: SalesforceContactForm) => void;
  loading?: boolean;
}

const SalesforceModal = ({
  profile,
  onClose,
  onSubmit,
  loading = false,
}: SalesforceModalProps) => {
  const { t } = useTranslation();

  const [form, setForm] = useState<SalesforceContactForm>({
    phone: null,
    linkedInUrl: null,
    gitHubUrl: null,
    notes: null,
  });

  const handleChange = (field: keyof SalesforceContactForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value.trim() === "" ? null : value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    onSubmit(form);
  };

  const initials = `${profile.firstName?.[0] ?? ""}${
    profile.lastName?.[0] ?? ""
  }`.toUpperCase();

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow rounded-3">
            <form onSubmit={handleSubmit}>
              <div className="modal-header py-3 px-4">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-2 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                    style={{ width: 40, height: 40 }}
                  >
                    <i className="bi bi-cloud-arrow-up fs-5" />
                  </div>

                  <div>
                    <h5 className="modal-title fw-bold mb-0">
                      {t("profilePage.salesforce.title")}
                    </h5>

                    <small className="text-muted">
                      {t("profilePage.salesforce.description")}
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  aria-label={t("common.close")}
                  onClick={onClose}
                  disabled={loading}
                />
              </div>

              <div className="modal-body px-4 py-3">
                <div className="bg-light rounded-3 p-3 mb-3">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-semibold"
                      style={{ width: 40, height: 40 }}
                    >
                      {initials}
                    </div>

                    <div>
                      <div className="fw-semibold">
                        {profile.firstName ?? ""} {profile.lastName ?? ""}
                      </div>

                      <small className="text-muted">
                        {profile.email ?? t("meSection.notProvided")}
                      </small>
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label small mb-1">
                        {t("meSection.firstName")}
                      </label>

                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={profile.firstName ?? ""}
                        readOnly
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small mb-1">
                        {t("meSection.lastName")}
                      </label>

                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={profile.lastName ?? ""}
                        readOnly
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small mb-1">
                        {t("meSection.email")}
                      </label>

                      <input
                        type="email"
                        className="form-control form-control-sm"
                        value={profile.email ?? ""}
                        readOnly
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small mb-1">
                        {t("meSection.location")}
                      </label>

                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={profile.location ?? ""}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-person-vcard text-primary" />

                  <h6 className="fw-semibold mb-0">
                    {t("profilePage.salesforce.additionalInformation")}
                  </h6>
                </div>

                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label small mb-1">
                      {t("profilePage.salesforce.phone")}
                    </label>

                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      placeholder={"+998 99 123 45 67"}
                      value={form.phone ?? ""}
                      onChange={(event) =>
                        handleChange("phone", event.target.value)
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small mb-1">
                      {t("profilePage.salesforce.linkedin")}
                    </label>

                    <input
                      type="url"
                      className="form-control form-control-sm"
                      value={form.linkedInUrl ?? ""}
                      onChange={(event) =>
                        handleChange("linkedInUrl", event.target.value)
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small mb-1">
                      {t("profilePage.salesforce.github")}
                    </label>

                    <input
                      type="url"
                      className="form-control form-control-sm"
                      value={form.gitHubUrl ?? ""}
                      onChange={(event) =>
                        handleChange("gitHubUrl", event.target.value)
                      }
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small mb-1">
                      {t("profilePage.salesforce.notes")}
                    </label>

                    <textarea
                      className="form-control form-control-sm"
                      rows={2}
                      placeholder={t("profilePage.salesforce.notesPlaceholder")}
                      value={form.notes ?? ""}
                      onChange={(event) =>
                        handleChange("notes", event.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer py-2 px-4">
                <button
                  type="button"
                  className="btn btn-light btn-sm px-3"
                  onClick={onClose}
                  disabled={loading}
                >
                  {t("common.cancel")}
                </button>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm px-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        aria-hidden="true"
                      />
                      {t("common.loading")}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-arrow-up me-1" />
                      {t("profilePage.salesforce.submit")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" />
    </>
  );
};

export default SalesforceModal;
