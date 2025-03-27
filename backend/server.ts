import { Elysia } from "elysia";

const app = new Elysia();
const OLLAMA_API = "http://localhost:11434/api/generate";

interface ChatRequestBody {
  message: string;
  sessionId: string;
}

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

app.post("/chat", async ({ body, set }) => {
  set.headers["Access-Control-Allow-Origin"] = "*";

  const { message, sessionId } = body as ChatRequestBody;

  if (!message || !sessionId) {
    return { error: "Please provide both message and sessionId." };
  }

  // Retrieve or initialize session data with default context
  let session = sessionStore.get(sessionId);
  if (!session) {
    session = {
      messages: [
        JSON.stringify({
          summary_of_context_data: "Charyll is a frontend developer working on projects like DREAM POS, Maevis Chatbot, and Sonar Mail Logger. She is detail-oriented, creative, and results-driven, with a passion for clean design and user-friendly experiences. Outside of work, she enjoys dancing, reading, and music.",
          master_user_name: "Charyll",
          sensitive_information_present: false,
          confidence_level: 9,
          user_persona_description: "A creative and detail-oriented frontend developer focused on building intuitive and efficient web applications."
        })
      ]
    };
    sessionStore.set(sessionId, session);
  }

  // Add the new message to the session's message history
  session.messages.push(message);

  // Construct prompt **without unnecessary formatting**
  const prompt = session.messages.join("\n");

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

    // **Clean response** (removes <think> tags and code blocks)
    const cleanResponse = data.response
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .replace(/^```json|```$/g, "") // Removes code block formatting
      .trim();

    return { response: cleanResponse || "No response from Ollama" };
  } catch (error) {
    console.error("❌ Error querying Ollama:", error);
    return { error: "Something went wrong. Try again." };
  }
});

app.listen(3000, () => {
  console.log("✅ Backend running on http://localhost:3000");
});
