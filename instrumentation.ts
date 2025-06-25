import { registerOTel } from "@vercel/otel";
import { OTLPHttpJsonTraceExporter } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: "haiku-app",
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: "https://gentrace.ai/api/otel/v1/traces",
      headers: {
        authorization: `Bearer ${process.env.GENTRACE_API_KEY}`,
      },
    }),
  });
}
