import { useEffect, useState } from "react";

interface FacebookLoginResponse {
  authResponse?: {
    accessToken: string;
    userID: string;
  } | null;
}

interface FacebookSdk {
  init: (options: {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
  }) => void;

  login: (
    callback: (response: FacebookLoginResponse) => void,
    options?: {
      scope?: string;
    },
  ) => void;
}

declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

interface FacebookSignInButtonProps {
  onSuccess: (accessToken: string) => void;
  onError?: (message: string) => void;
}

const FacebookSignInButton = ({
  onSuccess,
  onError,
}: FacebookSignInButtonProps) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;

    if (!appId) {
      onError?.("Facebook authentication is not configured.");
      return;
    }

    let initialized = false;

    const initializeFacebook = () => {
      if (!window.FB || initialized) {
        return;
      }

      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: "v24.0",
      });

      initialized = true;
      setIsReady(true);
    };

    if (window.FB) {
      initializeFacebook();
      return;
    }

    window.fbAsyncInit = initializeFacebook;

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";

    script.onerror = () => {
      onError?.("Failed to load Facebook SDK.");
    };

    document.body.appendChild(script);

    return () => {
      if (window.fbAsyncInit === initializeFacebook) {
        window.fbAsyncInit = undefined;
      }

      script.remove();
    };
  }, [onError]);

  const handleFacebookLogin = () => {
    if (!window.FB || !isReady) {
      onError?.("Facebook authentication is not ready.");
      return;
    }

    window.FB.login(
      (response) => {
        const accessToken = response.authResponse?.accessToken;

        if (!accessToken) {
          onError?.("Facebook authentication was cancelled or failed.");
          return;
        }

        onSuccess(accessToken);
      },
      {
        scope: "email,public_profile",
      },
    );
  };

  return (
    <div className="d-flex justify-content-center">
      <button
        type="button"
        onClick={handleFacebookLogin}
        disabled={!isReady}
        className="btn d-flex align-items-center justify-content-center position-relative"
        style={{
          width: "350px",
          height: "40px",
          border: "1px solid #dadce0",
          borderRadius: "4px",
          backgroundColor: "#fff",
          color: "#3c4043",
          fontSize: "14px",
          fontWeight: 450,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="#1877F2"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "14px",
          }}
        >
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 11.006 10.125 11.925v-8.437H7.078v-3.488h3.047V9.414c0-3.017 1.791-4.687 4.533-4.687 1.312 0 2.686.236 2.686.236v2.973h-1.514c-1.491 0-1.956.93-1.956 1.885v2.252h3.328l-.532 3.488h-2.796v8.437C19.612 23.079 24 18.092 24 12.073Z" />
        </svg>

        {isReady ? "Continue with Facebook" : "Loading Facebook..."}
      </button>
    </div>
  );
};

export default FacebookSignInButton;
