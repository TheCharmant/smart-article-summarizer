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
        body: JSON.stringify({ message: userMessage, sessionId: "unique-session-id" }), // Assuming sessionId is unique and generated dynamically
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

<div class="bubbles">
  <!-- Generate bubbles dynamically -->
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      const bubbleContainer = document.querySelector(".bubbles");
      for (let i = 0; i < 20; i++) {
        let bubble = document.createElement("div");
        bubble.classList.add("bubble");
        let size = Math.random() * 50 + 10; // Random size between 10px and 60px
        let duration = Math.random() * 5 + 5; // Random duration between 5s and 10s
        let left = Math.random() * 100; // Random position across the screen

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}%`;
        bubble.style.animationDuration = `${duration}s`;
        bubbleContainer.appendChild(bubble);
      }
    });
  </script>
</div>

<div class="chat-container">
  <h1>Maevis Chatbot</h1>

  <div class="message-box">
    {#each chatHistory as msg}
      <p class="{msg.role}-message">{msg.text}</p>
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
