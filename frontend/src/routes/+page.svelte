<script lang="ts">
  import { tick } from "svelte";
  import "./chat.css";

  let message = "";
  let chatHistory: { role: string; text: string }[] = [];
  let loading = false;

  async function sendMessage() {
    if (!message.trim()) return;

    const userMessage = message;
    message = ""; // Clear input immediately
    await tick(); // Ensure UI updates

    chatHistory = [...chatHistory, { role: "user", text: userMessage }];
    loading = true;

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      chatHistory = [
        ...chatHistory,
        { role: data.error ? "system" : "ai", text: data.error ? `⚠️ ${data.error}` : data.response }
      ];
    } catch (error) {
      chatHistory = [...chatHistory, { role: "system", text: "⚠️ Could not get response from AI." }];
      console.error("❌ Fetch error:", error);
    } finally {
      loading = false;
    }
  }
</script>

<div class="chat-container">
  <h1>Maevis Chatbot</h1>

  <div class="message-box">
    {#each chatHistory as msg}
      <p class="{msg.role}-message"><strong>{msg.role}:</strong> {msg.text}</p>
    {/each}
    {#if loading}
      <p class="loading">Maevis is thinking...</p>
    {/if}
  </div>

  <div class="input-container">
    <input 
      bind:value={message} 
      placeholder="Type a message..." 
      on:keydown={(e) => e.key === 'Enter' && sendMessage()} 
    />
    <button on:click={sendMessage} disabled={loading}>Send</button>
  </div>
</div>
