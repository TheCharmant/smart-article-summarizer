<script lang="ts">
  export let prompt: {
    id: number;
    message: string;
    timestamp: string;
  };

  export let onDelete: (id: number) => void;
  export let onUpdate: (id: number, message: string) => void;

  let showEditModal = false;
  let updatedMsg = prompt.message;
  let showDeleteModal = false;

  function getFirstFourWords(text: string) {
    const words = text.split(' ');
    return words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
  }

  function saveEdit() {
    onUpdate(prompt.id, updatedMsg);
    showEditModal = false;
  }

  function handleDelete() {
    showDeleteModal = true;
  }

  function confirmDelete() {
    onDelete(prompt.id);
    showDeleteModal = false;
  }

  function cancelDelete() {
    showDeleteModal = false;
  }

  function cancelEdit() {
    updatedMsg = prompt.message;
    showEditModal = false;
  }
</script>

<style>
  .prompt-container {
    background-color: #272727;
    border: 1px solid #636363;
    padding: 0.75rem;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .prompt-timestamp {
    font-size: 10px;
    color: #adadad;
  }

  .prompt-message {
    margin-top: 0.5rem;
  }

  .prompt-action-buttons {
    display: flex;
    gap: 1rem;
    font-size: 13px;
    margin-top: 0.5rem;
  }

  .btn-edit {
    color: #3b82f6;
    background: none;
    border: none;
    cursor: pointer;
  }

  .btn-delete {
    color: #ef4444;
    background: none;
    border: none;
    cursor: pointer;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: #272727;
    padding: 1.5rem;
    border-radius: 0.5rem;
    max-width: 400px;
    width: 90%;
    border: 1px solid #636363;
  }

  .modal-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .modal-textarea {
    width: 100%;
    min-height: 150px;
    border: 1px solid #525252;
    padding: 0.75rem;
    border-radius: 0.375rem;
    font-family: inherit;
    background-color: #333;
    color: white;
    margin-bottom: 1rem;
  }

  .modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .btn-confirm,
  .btn-confirm-delete {
    background-color: #ef4444;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
    border: none;
  }

  .btn-cancel {
    background-color: #3b3b3b;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    cursor: pointer;
    border: none;
  }
</style>

<div class="prompt-container">
  <div class="prompt-timestamp">
    {new Date(prompt.timestamp).toLocaleString()}
  </div>

  <p class="prompt-message">
    {getFirstFourWords(prompt.message)}
  </p>

  <div class="prompt-action-buttons">
    <button class="btn-edit" on:click={() => showEditModal = true}>Edit</button>
    <button class="btn-delete" on:click={handleDelete}>Delete</button>
  </div>
</div>

{#if showEditModal}
  <div class="modal-overlay">
    <div class="modal-content">
      <h3 class="modal-title">Edit Prompt</h3>
      <textarea class="modal-textarea" bind:value={updatedMsg}></textarea>
      <div class="modal-buttons">
        <button class="btn-cancel" on:click={cancelEdit}>Cancel</button>
        <button class="btn-confirm" on:click={saveEdit}>Save Changes</button>
      </div>
    </div>
  </div>
{/if}

{#if showDeleteModal}
  <div class="modal-overlay">
    <div class="modal-content">
      <h3 class="modal-title">Confirm Deletion</h3>
      <p>Are you sure you want to delete this prompt?</p>
      <div class="modal-buttons">
        <button class="btn-cancel" on:click={cancelDelete}>Cancel</button>
        <button class="btn-confirm-delete" on:click={confirmDelete}>Delete</button>
      </div>
    </div>
  </div>
{/if}
