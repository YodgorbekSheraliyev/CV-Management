import { useEffect } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { CheckCircleFill, ExclamationCircleFill } from "react-bootstrap-icons";

interface ToastNotificationProps {
  toast: {
    message: string;
    type: "success" | "danger";
  } | null;
  onClose: () => void;
}

const ToastNotification = ({ toast, onClose }: ToastNotificationProps) => {
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
        <Toast.Body className="d-flex align-items-start gap-3 p-3 position-relative">
          <div className="fs-4 lh-1 mt-1">
            {isSuccess ? <CheckCircleFill size={20} /> : <ExclamationCircleFill size={20} />}
          </div>

          <div className="flex-grow-1">
            <div className="fw-semibold small">
              {isSuccess ? "Success" : "Something went wrong"}
            </div>
            <div className="small opacity-90">{toast.message}</div>
          </div>

          <button
            type="button"
            className="btn-close btn-close-white position-absolute top-0 end-0 mt-2 me-2"
            aria-label="Close notification"
            onClick={onClose}
          />

          {/* progress bar */}
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
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </ToastContainer>
  );
};

export default ToastNotification;