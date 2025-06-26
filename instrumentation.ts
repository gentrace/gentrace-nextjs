import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-node";
import { OTLPHttpJsonTraceExporter, registerOTel } from "@vercel/otel";

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
