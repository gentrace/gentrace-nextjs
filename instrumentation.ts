import { OTLPHttpJsonTraceExporter, registerOTel } from "@vercel/otel";
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from "@opentelemetry/sdk-trace-base";

console.log("[instrumentation.ts] File loaded at:", new Date().toISOString());
console.log("[instrumentation.ts] Environment variables:", {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_RUNTIME: process.env.NEXT_RUNTIME,
  GENTRACE_API_KEY: process.env.GENTRACE_API_KEY ? "***" + process.env.GENTRACE_API_KEY.slice(-4) : "undefined",
  SENTRY_DSN: process.env.SENTRY_DSN ? "***" + process.env.SENTRY_DSN.slice(-10) : "undefined",
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN ? "***" + process.env.NEXT_PUBLIC_SENTRY_DSN.slice(-10) : "undefined",
});

const traceExporter = new OTLPHttpJsonTraceExporter({
  url: "https://gentrace.ai/api/otel/v1/traces",
  headers: {
    authorization: `Bearer ${process.env.GENTRACE_API_KEY}`,
  },
});

console.log("[instrumentation.ts] Trace exporter created:", {
  url: "https://gentrace.ai/api/otel/v1/traces",
  hasAuthHeader: !!process.env.GENTRACE_API_KEY,
  timestamp: new Date().toISOString(),
});

export async function register() {
  console.log("[instrumentation.ts] register() called at:", new Date().toISOString());
  console.log("[instrumentation.ts] Current runtime:", process.env.NEXT_RUNTIME);
  console.log("[instrumentation.ts] Process info:", {
    pid: process.pid,
    platform: process.platform,
    nodeVersion: process.version,
    uptime: process.uptime(),
  });

  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("[instrumentation.ts] Loading sentry.server.config for Node.js runtime");
    const startTime = Date.now();
    await import("./sentry.server.config");
    console.log("[instrumentation.ts] Sentry server config loaded in", Date.now() - startTime, "ms");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    console.log("[instrumentation.ts] Loading sentry.edge.config for Edge runtime");
    const startTime = Date.now();
    await import("./sentry.edge.config");
    console.log("[instrumentation.ts] Sentry edge config loaded in", Date.now() - startTime, "ms");
  }

  console.log("[instrumentation.ts] Registering OpenTelemetry with config:", {
    serviceName: "next-app",
    processorsCount: 2,
    timestamp: new Date().toISOString(),
  });

  registerOTel({
    serviceName: "next-app",
    spanProcessors: [
      new SimpleSpanProcessor(traceExporter),
      new SimpleSpanProcessor(new ConsoleSpanExporter()),
    ],
  });

  console.log("[instrumentation.ts] OpenTelemetry registration complete at:", new Date().toISOString());
}

export const onRequestError = async (
  error: {
    digest: string;
  },
  request: {
    method: string;
    url: string;
    headers: { [key: string]: string };
  },
  context: {
    routerKind: string;
    routePath: string;
    routeType: string;
    renderSource: string;
  }
) => {
  console.log("[instrumentation.ts] onRequestError triggered at:", new Date().toISOString());
  console.log("[instrumentation.ts] Error details:", {
    digest: error.digest,
    errorKeys: Object.keys(error),
    errorString: error.toString(),
    timestamp: new Date().toISOString(),
  });
  
  console.log("[instrumentation.ts] Request details:", {
    method: request.method,
    url: request.url,
    headerCount: Object.keys(request.headers).length,
    userAgent: request.headers["user-agent"] || "not-provided",
    host: request.headers["host"] || "not-provided",
  });
  
  console.log("[instrumentation.ts] Context details:", {
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
    timestamp: new Date().toISOString(),
  });

  console.log("[instrumentation.ts] Importing Sentry for error capture...");
  const importStart = Date.now();
  const { captureException } = await import("@sentry/nextjs");
  console.log("[instrumentation.ts] Sentry imported in", Date.now() - importStart, "ms");
  
  const sentryPayload = {
    tags: {
      digest: error.digest,
    },
    extra: {
      request: {
        method: request.method,
        url: request.url,
      },
      nextjs: {
        routerKind: context.routerKind,
        routePath: context.routePath,
        routeType: context.routeType,
        renderSource: context.renderSource,
      },
    },
  };
  
  console.log("[instrumentation.ts] Sending to Sentry with payload:", JSON.stringify(sentryPayload, null, 2));
  
  captureException(error, sentryPayload);
  
  console.log("[instrumentation.ts] Error sent to Sentry at:", new Date().toISOString());
};
