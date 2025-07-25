import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { init, interaction } from "gentrace";

await init({
  apiKey: process.env.GENTRACE_API_KEY!,
  // instrumentation.ts will handle the tracing
  otelSetup: false,
});

console.log("API key", process.env.GENTRACE_API_KEY!)

const streamResult = interaction(
  "create-haiku",
  (input) => {
    return streamText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content:
            "You are a haiku poet. Create beautiful haikus in the traditional 5-7-5 syllable format. Only respond with the haiku, no other text.",
        },
        {
          role: "user",
          content: input,
        },
      ],
      experimental_telemetry: {
        isEnabled: true,
        metadata: {
          source: "quickstart-example",
        },
      },
    });
  },
  {
    pipelineId: process.env.GENTRACE_PIPELINE_ID!,
  }
);

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamResult(prompt);

  return result.toDataStreamResponse();
}
