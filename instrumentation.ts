import { OTLPHttpJsonTraceExporter, registerOTel } from "@vercel/otel";
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from "@opentelemetry/sdk-trace-base";

const traceExporter = new OTLPHttpJsonTraceExporter({
  url: "https://gentrace.ai/api/otel/v1/traces",
  headers: {
    authorization: `Bearer ${process.env.GENTRACE_API_KEY}`,
  },
});

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }

  registerOTel({
    serviceName: "next-app",
    spanProcessors: [
      new SimpleSpanProcessor(traceExporter),
      new SimpleSpanProcessor(new ConsoleSpanExporter()),
    ],
  });
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
  const { captureException } = await import("@sentry/nextjs");
  captureException(error, {
    mechanism: {
      type: "instrument",
      handled: false,
    },
    contexts: {
      http: {
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
  });
};
