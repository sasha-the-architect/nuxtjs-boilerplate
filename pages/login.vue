<template>
  <div class="login-page">
    <div class="login-container">
      <h1>Login</h1>

      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-control"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-control"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <div class="form-footer">
        <p>
          Don't have an account?
          <NuxtLink to="/register">Register</NuxtLink>
        </p>
        <p>
          <NuxtLink to="/forgot-password">Forgot password?</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface LoginForm {
  email: string
  password: string
}

const form = ref<LoginForm>({
  email: '',
  password: '',
})

const loading = ref(false)

async function login() {
  loading.value = true

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: form.value,
    })

    if (response.success && response.token) {
      // Store the token in a cookie
      useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7 }).value =
        response.token // 7 days

      // Redirect to dashboard or previous page
      await navigateTo('/user-dashboard')
    }
  } catch (error: any) {
    console.error('Login error:', error)
    alert(error.data?.message || 'Login failed')
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Login',
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.login-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.form-footer p {
  margin: 0.5rem 0;
}

.form-footer a {
  color: #007bff;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style>
