import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LangProvider } from "../lib/i18n";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-void-black px-6">
      <div className="max-w-md">
        <div className="text-caption text-smoke mb-6">404 · NOT FOUND</div>
        <h1 className="text-[50px] leading-[1.2] tracking-[-0.025em] font-[330] text-frost">
          This page is off-course.
        </h1>
        <p className="mt-6 text-body-aaru text-smoke">
          The route you're looking for isn't on the calendar. Head back to the start line.
        </p>
        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center bg-zurkhai text-void-black px-[30px] py-[14px] text-[14px] tracking-[0.04em] uppercase font-[330] hover:opacity-90"
          >
            RETURN → HOME
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-void-black px-6">
      <div className="max-w-md">
        <div className="text-caption text-smoke mb-6">SYSTEM ERROR</div>
        <h1 className="text-[34px] leading-[1.25] tracking-[-0.025em] font-[330] text-frost">
          Something didn't load correctly.
        </h1>
        <div className="mt-10 flex gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="bg-zurkhai text-void-black px-[30px] py-[14px] text-[14px] tracking-[0.04em] uppercase font-[330]"
          >
            TRY AGAIN
          </button>
          <a
            href="/"
            className="border border-frost text-frost px-[30px] py-[14px] text-[14px] tracking-[0.04em] uppercase font-[330]"
          >
            GO HOME
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "гүйгч.mn — Mongolian Race Calendar" },
      {
        name: "description",
        content:
          "The complete calendar of running races across Mongolia — marathons, ultras, trail runs, and festival races. Bilingual (Mongolian / English).",
      },
      { name: "author", content: "гүйгч.mn" },
      { property: "og:title", content: "гүйгч.mn — Mongolian Race Calendar" },
      {
        property: "og:description",
        content:
          "Every sanctioned Mongolian running race in one place. Dates, courses, organizers, registration links.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster theme="dark" position="top-right" />
      </LangProvider>
    </QueryClientProvider>
  );
}
