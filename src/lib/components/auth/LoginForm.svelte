<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  
  let username = '';
  let password = '';
  let showPassword = false;

  $: ({ isLoading, error } = $authStore);

  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      return;
    }

    await authStore.login(username.trim(), password);
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  function clearError() {
    authStore.clearError();
  }
</script>

<div class="login-container">
  <div class="login-card">
    <header class="login-header">
      <h1>Tasty Watch</h1>
      <p>Sign in to your Tastytrade account</p>
    </header>

    <form on:submit={handleSubmit} class="login-form" novalidate>
      <div class="form-group">
        <label for="username">Username or Email</label>
        <input
          id="username"
          type="text"
          bind:value={username}
          required
          disabled={isLoading}
          autocomplete="username"
          aria-describedby={error ? 'error-message' : undefined}
          class:error={error}
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <div class="password-input-container">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            bind:value={password}
            required
            disabled={isLoading}
            autocomplete="current-password"
            aria-describedby={error ? 'error-message' : undefined}
            class:error={error}
          />
          <button
            type="button"
            class="password-toggle"
            on:click={togglePasswordVisibility}
            disabled={isLoading}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>

      {#if error}
        <div id="error-message" class="error-message" role="alert">
          <span class="error-icon">⚠️</span>
          {error}
          <button type="button" class="error-dismiss" on:click={clearError} aria-label="Dismiss error">
            ✕
          </button>
        </div>
      {/if}

      <button 
        type="submit" 
        class="login-button"
        disabled={isLoading || !username.trim() || !password.trim()}
        aria-describedby="login-help"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>

      <p id="login-help" class="login-help">
        Use your Tastytrade sandbox account credentials
      </p>
    </form>
  </div>
</div>

<style>
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
  }

  .login-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    width: 100%;
    max-width: 400px;
  }

  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .login-header h1 {
    color: #333;
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 700;
  }

  .login-header p {
    color: #666;
    margin: 0;
    font-size: 0.875rem;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 600;
    color: #333;
    font-size: 0.875rem;
  }

  input {
    padding: 0.75rem;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  input.error {
    border-color: #e53e3e;
  }

  input:disabled {
    background-color: #f7fafc;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .password-input-container {
    position: relative;
    display: flex;
  }

  .password-input-container input {
    flex: 1;
    padding-right: 3rem;
  }

  .password-toggle {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .password-toggle:hover:not(:disabled) {
    background-color: #f7fafc;
  }

  .password-toggle:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .error-message {
    background-color: #fed7d7;
    border: 1px solid #feb2b2;
    border-radius: 8px;
    padding: 0.75rem;
    color: #c53030;
    font-size: 0.875rem;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .error-icon {
    flex-shrink: 0;
  }

  .error-dismiss {
    margin-left: auto;
    background: none;
    border: none;
    color: #c53030;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    font-size: 1rem;
    line-height: 1;
  }

  .error-dismiss:hover {
    background-color: rgba(197, 48, 48, 0.1);
  }

  .login-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
  }

  .login-button:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .login-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .login-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .login-help {
    text-align: center;
    color: #666;
    font-size: 0.875rem;
    margin: 0;
  }

  @media (max-width: 480px) {
    .login-container {
      padding: 0.5rem;
    }
    
    .login-card {
      padding: 1.5rem;
    }
    
    .login-header h1 {
      font-size: 1.75rem;
    }
  }
</style>