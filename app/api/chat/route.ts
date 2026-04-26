import { streamText, convertToModelMessages } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const modelMessages = await convertToModelMessages(messages ?? []);

  const result = streamText({
    model: 'openai/gpt-4o-mini', // routed through Vercel AI Gateway
    system: 'You are a helpful assistant. Be concise and friendly.',
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
