"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, lazy, Suspense, useEffect, type ReactNode } from "react";

// 1. Modern subpath dynamic import (supported in TS "moduleResolution": "bundler")
const ReactQueryDevtoolsProduction = lazy(() =>
  import("@tanstack/react-query-devtools/production").then((d) => ({
    default: d.ReactQueryDevtools,
  })),
);

export default function Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  const [showDevtools, setShowDevtools] = useState(false);

  // Optional: Global window toggle for production debugging
  useEffect(() => {
    // @ts-expect-error Attaching to window for manual toggling
    window.toggleDevtools = () => setShowDevtools((old) => !old);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/* 2. Dev mode: Lazy loaded conditionally */}
      {process.env.NODE_ENV !== "production" && (
        <Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </Suspense>
      )}

      {/* 3. Prod mode: Loaded ON-DEMAND only if window.toggleDevtools() is called */}
      {process.env.NODE_ENV === "production" && showDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}
