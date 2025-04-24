// server.ts
import { Elysia } from "elysia";
import { Database } from "bun:sqlite";

const app = new Elysia();
const db = new Database("local.db");
const OLLAMA_API = "http://localhost:11434/api/generate";

interface ChatRequestBody {
  message: string;
  sessionId: string;
}

const initDb = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);
};

initDb();

app.options("/*", ({ set }) => {
  set.headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  return new Response(null, { status: 204 });
});

app.post("/auth", ({ body, set }) => {
  set.headers["Access-Control-Allow-Origin"] = "*";
  const { id, name, age } = body as { id: string; name: string; age: number };

  if (!id || !name || age === undefined) return { error: "Missing user info" };

  const existingUser = db.query("SELECT * FROM users WHERE id = ?").get(id);

  if (!existingUser) {
    db.run("INSERT INTO users (id, name, age) VALUES (?, ?, ?)", [id, name, age]);
  }

  return { success: true };
});

app.post("/chat", async ({ body, set }) => {
  set.headers["Access-Control-Allow-Origin"] = "*";

  const { message, sessionId } = body as ChatRequestBody;
  if (!message || !sessionId) return { error: "Missing message or sessionId" };

  db.run("INSERT INTO prompts (userId, message) VALUES (?, ?)", [sessionId, message]);

  type PromptRow = { message: string };

  const row = db.query("SELECT message FROM prompts WHERE userId = ? ORDER BY timestamp DESC LIMIT 1").get(sessionId) as PromptRow | undefined;
  const latestPrompt = row?.message ?? "";
  
  const prompt = `Please summarize the following text:\n\n${latestPrompt}`;
  

  try {
    const response = await fetch(OLLAMA_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3:latest",
        prompt,
        stream: false
      })
    });

    if (!response.ok) {
      console.error("❌ Ollama API Error:", response.statusText);
      return { error: "Ollama API failed." };
    }

    const data = await response.json();
    const cleanResponse = data.response
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .replace(/```[a-z]*|```/g, "")
      .trim();

    return { response: cleanResponse || "No response from Ollama" };
  } catch (err) {
    console.error("❌ Error querying Ollama:", err);
    return { error: "Internal error." };
  }
});


app.put("/prompt/:id", ({ params, body, set }) => {
  set.headers["Access-Control-Allow-Origin"] = "*";
  const { id } = params;
  const { message } = body as { message: string };

  db.run("UPDATE prompts SET message = ? WHERE id = ?", [message, id]);
  return { success: true };
});

app.delete("/prompt/:id", ({ params, set }) => {
  set.headers["Access-Control-Allow-Origin"] = "*";
  const { id } = params;

  db.run("DELETE FROM prompts WHERE id = ?", [id]);
  return { success: true };
});

app.get("/prompts/:userId", ({ params, set }) => {
  set.headers["Access-Control-Allow-Origin"] = "*";
  const { userId } = params;

  const prompts = db.query("SELECT * FROM prompts WHERE userId = ? ORDER BY timestamp DESC").all(userId);
  return { prompts };
});

app.listen(3000, () => {
  console.log("✅ Backend running on http://localhost:3000");
});