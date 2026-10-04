import { useState } from "react";
import { useTranslation } from "react-i18next";
import ToastNotification from "../notifications/ToastNotification";
import {
  createSupportTicket,
  type SupportTicketPriority,
} from "../../api/supportTicketApi";

interface SupportTicketModalProps {
  show: boolean;
  onClose: () => void;
}

const SupportTicketModal = ({ show, onClose }: SupportTicketModalProps) => {
  const { t } = useTranslation();

  const [summary, setSummary] = useState("");
  const [priority, setPriority] = useState<SupportTicketPriority>("Average");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!summary.trim()) {
      setError(t("supportTicket.summaryRequired"));
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createSupportTicket({
        summary: summary.trim(),
        priority,
        link: window.location.href,
      });

      setSummary("");
      setPriority("Average");
      onClose();

      setToast({
        message: t("supportTicket.createdSuccessfully"),
        type: "success",
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t("supportTicket.createFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) {
      return;
    }

    setError("");
    onClose();
  };

  return (
    <>
      {show && (
        <>
          {" "}
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
          >
            {" "}
            <div className="modal-dialog modal-dialog-centered">
              {" "}
              <div className="modal-content">
                {" "}
                <div className="modal-header">
                  {" "}
                  <h5 className="modal-title">{t("supportTicket.title")} </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleClose}
                    disabled={loading}
                    aria-label={t("common.close")}
                  />
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label">
                        {t("supportTicket.summary")}
                      </label>

                      <textarea
                        className="form-control"
                        rows={4}
                        value={summary}
                        onChange={(event) => setSummary(event.target.value)}
                        placeholder={t("supportTicket.summaryPlaceholder")}
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        {t("supportTicket.priority")}
                      </label>

                      <select
                        className="form-select"
                        value={priority}
                        onChange={(event) =>
                          setPriority(
                            event.target.value as SupportTicketPriority,
                          )
                        }
                        disabled={loading}
                      >
                        <option value="High">{t("supportTicket.high")}</option>
                        <option value="Average">
                          {t("supportTicket.average")}
                        </option>
                        <option value="Low">{t("supportTicket.low")}</option>
                      </select>
                    </div>

                    <div className="small text-muted">
                      {t("supportTicket.linkInfo")}
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleClose}
                      disabled={loading}
                    >
                      {t("common.cancel")}
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading
                        ? t("supportTicket.sending")
                        : t("supportTicket.submit")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </>
  );
};

export default SupportTicketModal;
