import { Elysia } from "elysia";

const app = new Elysia();
const OLLAMA_API = "http://localhost:11434/api/generate";

// In-memory session store (for simplicity)
const sessionStore = new Map<string, { messages: string[] }>();

// Middleware to handle CORS
app.options("/chat", ({ set }) => {
  set.headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  return new Response(null, { status: 204 });
});

app.post("/chat", async ({ body, set, headers }) => {
  set.headers["Access-Control-Allow-Origin"] = "*";

  const { message, sessionId } = body as { message?: string; sessionId?: string };
  
  if (!message || !sessionId) {
    return { error: "Please provide both message and sessionId." };
  }

  // Retrieve or initialize session data
  let session = sessionStore.get(sessionId);
  if (!session) {
    session = { messages: [] };
    sessionStore.set(sessionId, session);
  }

  // Add the new message to the session's message history
  session.messages.push(message);

  // Construct a more comprehensive prompt including history
  const prompt = session.messages.map((msg) => `User: ${msg}`).join("\n");

  try {
    const response = await fetch(OLLAMA_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-r1",
        prompt: `${prompt}\nAI:`, // Including the history as context
        stream: false,
      }),
    });

    if (!response.ok) {
      console.error("❌ Ollama API Error:", response.statusText);
      return { error: "Ollama API failed. Try again later." };
    }

    const data = await response.json();
    console.log("✅ Ollama API Response:", data);

    // Remove <think> tags from the response
    const cleanResponse = data.response.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    return { response: cleanResponse || "No response from Ollama", history: session.messages };
  } catch (error) {
    console.error("❌ Error querying Ollama:", error);
    return { error: "Something went wrong. Try again." };
  }
});

app.listen(3000, () => {
  console.log("✅ Backend running on http://localhost:3000");
});
