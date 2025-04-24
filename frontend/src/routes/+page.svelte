<script lang="ts">
  import PromptCard from '$lib/promptCard.svelte';

  let id = "";
  let name = "";
  let age: number | null = null;
  let loggedIn = false;

  let message = "";
  let prompts: { id: number; message: string; timestamp: string }[] = [];
  let aiResponse = "";

  const API = "http://localhost:3000";

  async function login() {
    if (!id || !name || age === null) return alert("Please fill all fields.");

    const res = await fetch(`${API}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, age })
    });

    const data = await res.json();
    if (data.success) {
      loggedIn = true;
      loadPrompts();
    }
  }

  async function sendMessage() {
    if (!message) return;
    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId: id })
    });

    const data = await res.json();
    aiResponse = data.response || "No response.";
    message = "";
    await loadPrompts();
  }

  async function loadPrompts() {
    const res = await fetch(`${API}/prompts/${id}`);
    const data = await res.json();
    prompts = data.prompts;
  }

  async function deletePrompt(promptId: number) {
    await fetch(`${API}/prompt/${promptId}`, { method: "DELETE" });
    await loadPrompts();
  }

  async function updatePrompt(promptId: number, newMsg: string) {
    await fetch(`${API}/prompt/${promptId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: newMsg })
    });
    await loadPrompts();
  }
</script>

{#if !loggedIn}
  <div class="p-4 max-w-md mx-auto space-y-4">
    <h1 class="text-2xl font-bold">Login</h1>
    <input class="w-full p-2 border rounded" placeholder="ID" bind:value={id} />
    <input class="w-full p-2 border rounded" placeholder="Name" bind:value={name} />
    <input class="w-full p-2 border rounded" type="number" placeholder="Age" bind:value={age} />
    <button class="bg-blue-500 text-white px-4 py-2 rounded" on:click={login}>Login</button>
  </div>
{:else}
  <div class="p-4 max-w-2xl mx-auto space-y-4">
    <h1 class="text-2xl font-bold">Welcome, {name}!</h1>

    <div class="flex gap-2">
      <input
        class="flex-1 p-2 border rounded"
        placeholder="Enter your article or message..."
        bind:value={message}
      />
      <button class="bg-green-500 text-white px-4 py-2 rounded" on:click={sendMessage}>Send</button>
    </div>

    {#if aiResponse}
      <div class="bg-gray-100 p-4 rounded shadow">
        <strong>AI Summary:</strong>
        <p>{aiResponse}</p>
      </div>
    {/if}

    <h2 class="text-xl font-semibold mt-6">Your Prompts</h2>
    {#each prompts as prompt (prompt.id)}
      <PromptCard {prompt} onDelete={deletePrompt} onUpdate={updatePrompt} />
    {/each}
  </div>
{/if}
