import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, changeContext } = await req.json();

    // Get current change context from the request body (if sent)
    // changeContext is now at root due to useChat body behavior

    const systemPrompt = `You are a Review Copilot for a document comparison tool (Delta Compare).
Your goal is to assist users in reviewing differences between document versions.

CONTEXT:
${changeContext ? JSON.stringify(changeContext, null, 2) : "No specific change selected."}

INSTRUCTIONS:
- If asked to "Explain this", analyze the 'before' and 'after' text in the context. Explain the semantic meaning of the change (e.g. valid update, error, breaking change).
- If asked to "Draft Issue", generate a concise technical bug report about data extraction errors (e.g. headers merged into body, footer noise).
- Be concise, professional, and helpful.
`;

    const result = await streamText({
        model: google('gemini-1.5-flash'),
        system: systemPrompt,
        messages,
    });

    return result.toTextStreamResponse();
}
