import { streamText, convertToModelMessages } from 'ai';
import { getChatModel } from '@/lib/ai/model';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const modelMessages = await convertToModelMessages(messages ?? []);

  const result = streamText({
    model: getChatModel(),
    system: 'You are a helpful assistant. Be concise and friendly.',
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
