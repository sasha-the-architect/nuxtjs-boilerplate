<template>
  <div class="user-dashboard">
    <div class="container">
      <h1>User Dashboard</h1>

      <div class="dashboard-content">
        <div class="sidebar">
          <nav class="dashboard-nav">
            <ul>
              <li>
                <NuxtLink to="/user-dashboard/profile" active-class="active">
                  Profile
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/user-dashboard/settings" active-class="active">
                  Account Settings
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/user-dashboard/activity" active-class="active">
                  Activity
                </NuxtLink>
              </li>
              <li v-if="user?.role === 'admin'">
                <NuxtLink to="/user-dashboard/admin" active-class="active">
                  Admin Panel
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </div>

        <div class="main-content">
          <NuxtPage :user="user" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: string
  name: string
  email: string
  username: string
  role: string
  profile: {
    bio: string
    avatar: string
    joinDate: string
    reputation: number
    contributions: {
      comments: number
      resources: number
      votes: number
    }
  }
}

const { data: user, error } = await $fetch('/api/auth/profile', {
  headers: {
    Authorization: `Bearer ${useCookie('auth_token').value}`,
  },
}).catch(err => {
  console.error('Error fetching user profile:', err)
  return { data: null, error: err }
})

if (!user) {
  // Redirect to login if not authenticated
  await navigateTo('/login')
}

useHead({
  title: 'User Dashboard',
})
</script>

<style scoped>
.user-dashboard {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.dashboard-content {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.sidebar {
  width: 250px;
  flex-shrink: 0;
}

.dashboard-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dashboard-nav li {
  margin-bottom: 0.5rem;
}

.dashboard-nav a {
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #333;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.dashboard-nav a:hover,
.dashboard-nav a.active {
  background-color: #007bff;
  color: white;
}

.main-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .dashboard-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    margin-bottom: 1rem;
  }
}
</style>
