import { useEffect } from "react";

import { Toast, ToastContainer } from "react-bootstrap";
import { CheckCircleFill, ExclamationCircleFill } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";

interface ToastNotificationProps {
  toast: {
    message: string;
    type: "success" | "danger";
  } | null;
  onClose: () => void;
}

const ToastNotification = ({ toast, onClose }: ToastNotificationProps) => {
  const { t } = useTranslation();
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(onClose, 4000);
    return () => clearTimeout(timeout);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <ToastContainer
      position="top-end"
      className="p-3"
      style={{ zIndex: 9999, position: "fixed" }}
    >
      <Toast
        key={toast.message + toast.type}
        show={!!toast}
        onClose={onClose}
        bg={isSuccess ? "success" : "danger"}
        className="border-0 shadow-lg text-white"
        style={{ minWidth: 320, maxWidth: 420 }}
      >
        <Toast.Body className="position-relative p-3">
          <div className="d-flex align-items-center gap-3 pe-4">
            <div className="d-flex align-items-center justify-content-center flex-shrink-0">
              {isSuccess ? (
                <CheckCircleFill size={20} />
              ) : (
                <ExclamationCircleFill size={20} />
              )}
            </div>

            <div className="flex-grow-1 min-w-0">
              {isSuccess && (
                <div className="fw-semibold small mb-1">
                  {t("toast.success")}
                </div>
              )}

              <div className="small">{toast.message}</div>
            </div>
          </div>

          <button
            type="button"
            className="btn-close btn-close-white position-absolute top-0 end-0 mt-2 me-2"
            aria-label={t("toast.close")}
            onClick={onClose}
          />

          <div
            className="position-absolute bottom-0 start-0 w-100 bg-white bg-opacity-50"
            style={{
              height: 3,
              transformOrigin: "left",
              animation: "toast-progress 4s linear forwards",
            }}
          />
        </Toast.Body>
      </Toast>

      <style>{`
        @keyframes toast-progress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </ToastContainer>
  );
};

export default ToastNotification;
