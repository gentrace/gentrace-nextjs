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

export function register() {
  registerOTel({
    serviceName: "next-app",
    spanProcessors: [
      new SimpleSpanProcessor(traceExporter),
      new SimpleSpanProcessor(new ConsoleSpanExporter()),
    ],
  });
}
