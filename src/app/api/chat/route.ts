import { createOllama, ollama } from 'ollama-ai-provider';
// import ollama from 'ollama'
import { streamText, convertToCoreMessages, UserContent } from 'ai';


export const runtime = "edge";
export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  // Destructure request data


  const { messages, selectedModel, data } = await req.json();

  const ollamaUrl = process.env.OLLAMA_URL;

  const initialMessages = messages.slice(0, -1);
  const currentMessage = messages[messages.length - 1];

  const ollama = createOllama({ baseURL: ollamaUrl + "/api" });

  // Build message content array directly
  const messageContent: UserContent = [{ type: 'text', text: currentMessage.content }];

  // Add images if they exist
  data?.images?.forEach((imageUrl: string) => {
    const image = new URL(imageUrl);
    messageContent.push({ type: 'image', image });
  });

  // Stream text using the ollama model
  const result = await streamText({
    model: ollama(selectedModel),
    abortSignal: req.signal,
    // prompt: (messageContent).toString() as string,
    messages: [
      ...convertToCoreMessages(initialMessages),
      { role: 'user', content: messageContent },
    ]
  });

  return result.toDataStreamResponse();
}
