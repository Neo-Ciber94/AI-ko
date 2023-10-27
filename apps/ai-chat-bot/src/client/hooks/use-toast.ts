import { useCallback } from "react";
import toast from "react-hot-toast";

export function useToast() {
  const error = useCallback((message: string) => {
    toast.error(message, {
      style: {
        background: "#333",
        color: "#fff",
      },
    });
  }, []);

  return { error };
}
