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
  background-color: #1f2937; /* Slate-800 */
  border: 1px solid #374151; /* Slate-700 */
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.2s ease;
}

.prompt-container:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.prompt-timestamp {
  font-size: 12px;
  color: #9ca3af; /* Slate-400 */
  margin-bottom: 0.25rem;
}

.prompt-message {
  color: #e5e7eb; /* Slate-100 */
  font-size: 14px;
  margin-bottom: 0.75rem;
}

.prompt-action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-edit,
.btn-delete {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: color 0.2s ease;
}

.btn-edit {
  color: #60a5fa; /* Blue-400 */
}

.btn-edit:hover {
  color: #3b82f6; /* Blue-500 */
}

.btn-delete {
  color: #f87171; /* Red-400 */
}

.btn-delete:hover {
  color: #ef4444; /* Red-500 */
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #1f2937;
  padding: 2rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  border: 1px solid #374151;
  color: #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.modal-textarea {
  width: 100%;
  min-height: 140px;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: #374151;
  border: 1px solid #4b5563;
  color: #f9fafb;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 1.25rem;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancel,
.btn-confirm,
.btn-confirm-delete {
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-cancel {
  background-color: #374151;
  color: #f1f5f9;
}

.btn-cancel:hover {
  background-color: #4b5563;
}

.btn-confirm {
  background-color: #3b82f6;
  color: white;
}

.btn-confirm:hover {
  background-color: #2563eb;
}

.btn-confirm-delete {
  background-color: #ef4444;
  color: white;
}

.btn-confirm-delete:hover {
  background-color: #dc2626;
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
