<script lang="ts">
  import PromptCard from '$lib/promptCard.svelte';

  // User state
  let id = "";
  let name = "";
  let age: number | null = null;
  let loggedIn = false;
  let loading = false;

  // Chat state
  let message = "";
  let aiResponse = "";
  let prompts: { id: number; message: string; timestamp: string }[] = [];

  const API_BASE_URL = "http://localhost:3000";

  async function login() {
    if (!id || !name || age === null) {
      alert("Please fill all fields.");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, age })
    });

    const data = await response.json();
    if (data.success) {
      loggedIn = true;
      await loadPrompts();
    }
  }

  async function sendMessage() {
  if (!message) return;

  loading = true; // Start loading

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId: id })
  });

  const data = await response.json();
  aiResponse = data.response || "No response.";

  await loadPrompts();

  loading = false; // Done loading
}


  async function loadPrompts() {
    const response = await fetch(`${API_BASE_URL}/prompts/${id}`);
    const data = await response.json();
    prompts = data.prompts;
  }

  async function deletePrompt(promptId: number) {
    await fetch(`${API_BASE_URL}/prompt/${promptId}`, { method: "DELETE" });
    await loadPrompts();
  }

  async function updatePrompt(promptId: number, newMessage: string) {
    await fetch(`${API_BASE_URL}/prompt/${promptId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: newMessage })
    });
    await loadPrompts();
  }

  function countWords(text: string): number {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  }

  function countSentences(text: string): number {
    return text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length;
  }

  // Add these derived values
  $: inputWordCount = countWords(message);
  $: inputSentenceCount = countSentences(message);
  $: outputWordCount = countWords(aiResponse);
  $: outputSentenceCount = countSentences(aiResponse);

  function logout() {
    // Reset all user state
    id = "";
    name = "";
    age = null;
    loggedIn = false;
    message = "";
    aiResponse = "";
    prompts = [];
  }

  let sidebarCollapsed = false;
  let sidebarEl: HTMLElement;
  let mainContentEl: HTMLElement;
</script>

<!-- svelte-ignore css_unused_selector -->
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
    
  :global(body) {
    background-color: #333;
    font-family: 'Arial', sans-serif;
    color: #d4d4d4;
    line-height: 1.6;
    min-height: 100vh;
  }

  /* Sidebar Styles */
  .sidebar {
    width: 250px;
    background-color: rgb(7, 7, 7);
    padding: 20px;
    height: 100vh;
    position: fixed;
    overflow-y: auto;
  }
        
  .sidebar-header {
    color: #fff;
    margin-top: 12px;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgb(204, 204, 204);
  }
        
  .prompts-container {
    margin-top: 10px;
    font-size: 10px;
  }

  .prompts-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    overflow-y: auto;
    padding-right: 5px;
  }

  /* Scrollbar styling */
  .prompts-list::-webkit-scrollbar {
    width: 6px;
  }

  .prompts-list::-webkit-scrollbar-track {
    background: rgb(50, 50, 50);
  }

  .prompts-list::-webkit-scrollbar-thumb {
    background: rgb(100, 100, 100);
    border-radius: 3px;
  }
        
  /* Navbar Styles */
  .main-content {
    margin-left: 250px;
    flex: 1;
  }
        
  .navbar {
    background-color: rgb(24, 24, 24);
    padding: 15px 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;
  }
        
  .navbar-brand {
    color: #fff;
    font-size: 26px;
    font-weight: bold;
    display: flex;
    align-items: center;
  }
        
  .navbar-actions {
    display: flex;
    gap: 15px;
  }
        
  .navbar-actions button {
    background-color: transparent;
    color: #fff;
    border: 1px solid #bdc3c7;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
  }
        
  .navbar-actions button:hover {
    background-color: #2c3e50;
  }

  .login {
    color: rgb(255, 255, 255);
    margin-bottom: 20px;
  }

  .welcome {
    color: #fff;
    margin-top: 20px;
  }

  .login-container {
    border: 1px solid #bdc3c7;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-top: 110px;
    padding: 1rem;
    max-width: 32rem;
    margin-left: auto;
    margin-right: auto;
  }

  .input-field {
    background-color: #333;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #ddd;
    margin-bottom: 12px;
    width: 100%;
  }

  .button {
    padding: 12px;
    border-radius: 8px;
    width: 100%;
    cursor: pointer;
    font-weight: bold;
  }

  .login-button {
    background-color: #59745a;
    color: white;
  }

  .login-button:hover {
    background-color: #45a049;
  }

  .content {
    padding: 25px;
    max-width: 1500px;
    margin: 0 auto;
  }

  .text-container {
    display: flex;
    gap: 20px;
    margin: 20px 0;
  }

  .text-area-container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
        
  .text-area-container h3 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
    color: #ffffff;
  }

  .text-area {
    width: 100%;
    height: 250px;
    border: 1px solid #444;
    background-color: #707070;
    border-radius: 4px;
    resize: vertical;
    font-family: inherit;
    color: #fff;
    padding: 8px;
  }

  /* For all input elements */
  input::placeholder {
    color: #999999; /* Your desired color */
    opacity: 1; /* Firefox reduces opacity by default */
  }

  /* For specific textarea */
  .text-area::placeholder {
    color: #c0c0c0;
    font-style: italic;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
  }

  .summarize-button {
  background-color: #4a5568; /* Slate Gray */
  color: #f1f5f9;            /* Light text for contrast */
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.25s ease, transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 10px rgba(74, 85, 104, 0.15);
}

.summarize-button:hover {
  background-color: #2d3748; /* Darker slate on hover */
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(45, 55, 72, 0.25);
}

.summarize-button:active {
  transform: translateY(1px);
  box-shadow: 0 3px 6px rgba(45, 55, 72, 0.15);
}

.summarize-button:disabled {
  background-color: #a0aec0; /* Muted gray-blue for disabled state */
  color: #e2e8f0;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}


  .counter {
    font-size: 14px;
    color: #777;
    margin-top: 8px;
    text-align: left;
  }

  .hide-btn {
    background-color: transparent;
    color: white;
    border: none;
    padding: 5px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
  }
        
  .hide-btn:hover {
    background-color: rgba(255,255,255,0.1);
  }
        
  .toggle-sidebar {
    display: none;
    background-color: #34495e;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 15px;
  }

  .sidebar.collapsed {
    width: 0;
    padding: 0;
    overflow: hidden;
    transition: width 0.3s ease, padding 0.3s ease;
}

  .main-content.expanded {
    margin-left: 0;
    transition: margin-left 0.3s ease;
  }

  .sidebar,
  .main-content {
    transition: all 0.3s ease;
  }
</style>

{#if !loggedIn}
  <div class="login-container">
    <h1 class="text-2xl font-bold login">Login</h1>
    <input class="input-field" placeholder="ID" bind:value={id} />
    <input class="input-field" placeholder="Name" bind:value={name} />
    <input class="input-field" type="number" placeholder="Age" bind:value={age} />
    <button class="button login-button" on:click={login}>Login</button>
  </div>
{:else}
<div class="sidebar" class:collapsed={sidebarCollapsed}>
  <div class="sidebar-header">
      <h2 class="font-bold">YOUR PROMPTS</h2>
  </div>

  <div class="prompts-container">
    <div class="prompts-list">
      {#each prompts as prompt (prompt.id)}
        <PromptCard {prompt} onDelete={deletePrompt} onUpdate={updatePrompt} />
      {:else}
        <div style="color: #777; font-style: italic;">No prompts yet</div>
      {/each}
    </div>
  </div>
  </div>

  <div class="main-content" class:expanded={sidebarCollapsed}>
    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-brand">
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button class="hide-btn" on:click={() => sidebarCollapsed = !sidebarCollapsed}><i class="fas fa-bars"></i></button>
        <div class="navbar-brand-content">
            <i class="fas fa-robot"></i>
            <span>Summarizer AI</span>
        </div>
      </div>
      <div class="navbar-actions">
          <button on:click={logout}><i class="fas fa-sign-out-alt"></i>Logout</button>
      </div>
    </nav>

    <div class="content">
      <h1 class="text-2xl font-bold welcome">Welcome, {name}!</h1>

      <div>
        <div class="text-container">
          <div class="text-area-container">
            <h3>Input Text</h3>
            <textarea
              class="text-area"
              placeholder="Enter your article..."
              bind:value={message}
            ></textarea>
            <div class="counter">
              {inputSentenceCount} sentence{inputSentenceCount !== 1 ? 's' : ''} + 
              {inputWordCount} word{inputWordCount !== 1 ? 's' : ''}
            </div>
          </div>
        
          <div class="text-area-container">
            <h3>AI Summary</h3>
            <textarea 
              class="text-area" 
              placeholder="Your summarized text will appear here..." 
              readonly
              >{aiResponse}</textarea>
              <div class="counter">
                {outputSentenceCount} sentence{outputSentenceCount !== 1 ? 's' : ''} + 
                {outputWordCount} word{outputWordCount !== 1 ? 's' : ''}
              </div>
          </div>
        </div>
      
        <div class="footer">
          <button class="summarize-button" on:click={sendMessage} disabled={loading}>
            <i class="fas fa-magic"></i>{loading ? ' Summarizing...' : ' Summarize'}
          </button>          
        </div>
      </div>
    </div>
  </div>
{/if}
