import { useEffect, useState } from "react";

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal });
  if (!response.ok)
    throw new Error(
      response.status === 404
        ? "This page could not be found."
        : "Something went wrong. Please try again.",
    );
  return response.json() as Promise<T>;
}

export function useRequest<T>(path: string) {
  const [state, setState] = useState<{
    data?: T;
    error?: string;
    loading: boolean;
  }>({ loading: true });
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true });
    getJson<T>(path, controller.signal)
      .then((data) => setState({ data, loading: false }))
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ error: error.message, loading: false });
      });
    return () => controller.abort();
  }, [path]);
  return state;
}
