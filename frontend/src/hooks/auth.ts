import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  const [error, setError] = useState<string>("");

  return { ...context, error, setError };
}
