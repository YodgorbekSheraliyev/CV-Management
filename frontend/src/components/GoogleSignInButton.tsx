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

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      onError?.("Google authentication is not configured.");
      return;
    }

    const initializeGoogle = () => {
      if (!window.google || !buttonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (!response.credential) {
            onError?.("Google authentication failed.");
            return;
          }

          onSuccess(response.credential);
        },
      });

      buttonRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 350,
        text: "continue_with",
      });
    };

    if (window.google) {
      initializeGoogle();
      return;
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
  }, [onSuccess, onError]);

  return <div ref={buttonRef} className="d-flex justify-content-center" />;
};

export default GoogleSignInButton;
