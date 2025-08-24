"use client";

import {
  DehydratedState,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { PersistGate } from "redux-persist/integration/react"; // وارد کردن PersistGate
import { persistor } from "@/store"; // وارد کردن persistor از store
import { SessionProvider } from "next-auth/react";

const Providers = ({
  children,
  dehydratedState,
}: {
  children: React.ReactNode;
  dehydratedState: DehydratedState;
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, //5 دقیقه
            refetchOnWindowFocus: false, // جلوگیری از refetch
            retry: 1, // کاهش تلاش‌های retry
          },
        },
      })
  );

  return (
    <SessionProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <PersistGate loading={null} persistor={persistor}>
            {/* فقط در صورتی که dehydratedState وجود داشته باشد، HydrationBoundary رندر شود */}
            {dehydratedState ? (
              <HydrationBoundary state={dehydratedState}>
                {children}
              </HydrationBoundary>
            ) : (
              children
            )}
          </PersistGate>
        </QueryClientProvider>
      </Provider>
    </SessionProvider>
  );
};

export default Providers;
