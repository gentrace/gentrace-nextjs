# Gentrace + Next.js Setup

This example demonstrates OpenTelemetry (OTEL) tracing with Gentrace in a Next.js application.

## Setup

1. Copy `.env.local.example` to `.env.local` and add your API keys:

   ```bash
   cp .env.local.example .env.local
   ```

2. Configure the following environment variables:

   - `OPENAI_API_KEY`: Your OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - `GENTRACE_API_KEY`: Your Gentrace API key from [gentrace.ai/s/api-keys](https://gentrace.ai/s/api-keys)
   - `GENTRACE_PIPELINE_ID`: Pipeline ID from your [Gentrace dashboard](https://gentrace.ai/t/)

3. Install dependencies:
   ```bash
   npm install
   ```

## Configuration Details

### Instrumentation (instrumentation.ts)

The `instrumentation.ts` file registers OpenTelemetry with Vercel's OTEL package, sending traces to Gentrace:

```typescript
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
```

### Gentrace SDK Configuration

In `app/api/haiku/route.ts`, Gentrace is initialized with `otelSetup: false`:

```typescript
init({
  apiKey: process.env.GENTRACE_API_KEY!,
  baseURL: "https://gentrace.ai/api",
  otelSetup: false,
});
```

**Why `otelSetup: false`?** This prevents Gentrace SDK from setting up its own OTEL configuration since we're already using Vercel's OTEL setup in `instrumentation.ts`. This avoids conflicts between the two OTEL configurations.

## Known Issues

### Module Resolution Error with @opentelemetry/exporter-jaeger

When running the development server, you may encounter:

```
Module not found: Can't resolve '@opentelemetry/exporter-jaeger'
```

**Cause:** The `@opentelemetry/sdk-node` package (bundled with `gentrace@0.11.0`) contains code that dynamically requires the Jaeger exporter module. Next.js attempts to resolve this module at build time even though it's only used when `OTEL_TRACES_EXPORTER=jaeger` is explicitly set.

**Solution:** Install the Jaeger exporter as a dependency:

```bash
npm install @opentelemetry/exporter-jaeger
```

This resolves the build-time module resolution without affecting runtime behavior, as the Jaeger exporter is only activated when explicitly configured.
