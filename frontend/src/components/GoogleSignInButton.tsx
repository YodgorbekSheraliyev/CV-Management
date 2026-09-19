import { useEffect, useRef } from "react";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;

  renderButton: (
    element: HTMLElement,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "small" | "medium" | "large";
      width?: number;
      text?: "signin_with" | "signup_with" | "continue_with";
    },
  ) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (message: string) => void;
}

const GoogleSignInButton = ({
  onSuccess,
  onError,
}: GoogleSignInButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      onErrorRef.current?.("Google authentication is not configured.");
      return;
    }

    const renderGoogleButton = () => {
      if (!window.google || !buttonRef.current) {
        return;
      }

      const container = buttonRef.current;

      // Use the available width, but never exceed 350px.
      const width = Math.min(350, container.clientWidth);

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (!response.credential) {
            onErrorRef.current?.("Google authentication failed.");
            return;
          }

          onSuccessRef.current(response.credential);
        },
      });

      container.innerHTML = "";

      window.google.accounts.id.renderButton(container, {
        theme: "outline",
        size: "large",
        width,
        text: "continue_with",
      });
    };

    const initializeGoogle = () => {
      if (!window.google) {
        return;
      }

      renderGoogleButton();

      // Re-render when the available width changes.
      if (buttonRef.current) {
        const resizeObserver = new ResizeObserver(() => {
          renderGoogleButton();
        });

        resizeObserver.observe(buttonRef.current);

        return resizeObserver;
      }

      return undefined;
    };

    if (window.google) {
      const observer = initializeGoogle();

      return () => {
        observer?.disconnect();
      };
    }

    const interval = window.setInterval(() => {
      if (window.google) {
        window.clearInterval(interval);
        initializeGoogle();
      }
    }, 100);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div ref={buttonRef} className="d-flex justify-content-center w-100" />
  );
};

export default GoogleSignInButton;
