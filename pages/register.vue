<template>
  <div class="register-page">
    <div class="register-container">
      <h1>Create Account</h1>

      <form @submit.prevent="register" class="register-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-control"
            required
          />
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="form-control"
            required
          />
        </div>

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
            minlength="8"
          />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Creating Account...' : 'Register' }}
        </button>
      </form>

      <div class="form-footer">
        <p>
          Already have an account?
          <NuxtLink to="/login">Login</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RegisterForm {
  name: string
  username: string
  email: string
  password: string
}

const form = ref<RegisterForm>({
  name: '',
  username: '',
  email: '',
  password: '',
})

const loading = ref(false)

async function register() {
  loading.value = true

  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: form.value,
    })

    if (response.success) {
      // Automatically log in after registration
      const loginResponse = await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: form.value.email,
          password: form.value.password,
        },
      })

      if (loginResponse.success && loginResponse.token) {
        // Store the token in a cookie
        useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7 }).value =
          loginResponse.token // 7 days

        // Redirect to dashboard
        await navigateTo('/user-dashboard')
      }
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    alert(error.data?.message || 'Registration failed')
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Register',
})
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.register-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.register-form {
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
  background-color: #28a745;
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
