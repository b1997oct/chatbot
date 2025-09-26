import { createOllama, ollama } from 'ollama-ai-provider';
// import ollama from 'ollama'
import { streamText, convertToCoreMessages, CoreMessage, UserContent, generateText } from 'ai';
import OpenAI from "openai";
import { Client } from '@gradio/client';
import { textGeneration } from "@huggingface/inference";



export const runtime = "edge";
export const dynamic = "force-dynamic";

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL = "gpt2"


// const client = new textGeneration(HF_TOKEN);

async function chat(message: string) {

  // const client = await Client.connect("b1997oct/gpt2");
  // const result = await client.predict("/chat", {
  //   message: "Hello!!",
  //   system_message: "Hello!!",
  //   max_tokens: 1,
  //   temperature: 0.1,
  //   top_p: 0.1,
  // });

  const result = await textGeneration({
    accessToken: HF_TOKEN,
    model: MODEL,
    inputs: message
  })

  return result

}


export const PUT = async () => {

  try {

    const chatCompletion = await chat("hi")

    return Response.json({ response: chatCompletion })
  } catch (err: any) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }

}

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
