<script lang="ts">
    export let prompt: {
      id: number;
      message: string;
      timestamp: string;
    };
  
    export let onDelete: (id: number) => void;
    export let onUpdate: (id: number, message: string) => void;
  
    let editing = false;
    let updatedMsg = prompt.message;
  
    function saveEdit() {
      onUpdate(prompt.id, updatedMsg);
      editing = false;
    }
  </script>
  
  
  <div class="bg-white border p-3 rounded shadow mt-2">
    <div class="text-sm text-gray-500">{new Date(prompt.timestamp).toLocaleString()}</div>
  
    {#if editing}
      <textarea class="w-full border mt-2 p-2 rounded" bind:value={updatedMsg}></textarea>
      <div class="flex gap-2 mt-2">
        <button class="bg-blue-500 text-white px-2 py-1 rounded" on:click={saveEdit}>Save</button>
        <button class="text-gray-500" on:click={() => (editing = false)}>Cancel</button>
      </div>
    {:else}
      <p class="mt-2">{prompt.message}</p>
      <div class="flex gap-4 text-sm mt-2">
        <button class="text-blue-500" on:click={() => (editing = true)}>Edit</button>
        <button class="text-red-500" on:click={() => onDelete(prompt.id)}>Delete</button>
      </div>
    {/if}
  </div>
  