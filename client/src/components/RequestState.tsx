import type { ReactNode } from "react";

export function RequestState({
  loading,
  error,
  children,
}: {
  loading: boolean;
  error?: string;
  children: ReactNode;
}) {
  if (loading)
    return (
      <div className="status" role="status">
        Loading the collection…
      </div>
    );
  if (error)
    return (
      <div className="status error" role="alert">
        <p>{error}</p>
        <button onClick={() => location.reload()}>Try again</button>
      </div>
    );
  return <>{children}</>;
}
