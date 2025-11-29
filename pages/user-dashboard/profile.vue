<template>
  <div class="profile-page">
    <h2>Profile</h2>

    <div class="profile-card" v-if="user">
      <div class="profile-header">
        <div class="avatar-container">
          <img
            v-if="user.profile.avatar"
            :src="user.profile.avatar"
            :alt="user.name"
            class="avatar"
          />
          <div v-else class="avatar-placeholder">
            {{ getInitials(user.name) }}
          </div>
        </div>
        <div class="profile-info">
          <h1>{{ user.name }}</h1>
          <p class="username">@{{ user.username }}</p>
          <p class="join-date">
            Joined {{ formatDate(user.profile.joinDate) }}
          </p>
        </div>
      </div>

      <div class="profile-stats">
        <div class="stat">
          <h3>{{ user.profile.contributions.resources }}</h3>
          <p>Resources</p>
        </div>
        <div class="stat">
          <h3>{{ user.profile.contributions.comments }}</h3>
          <p>Comments</p>
        </div>
        <div class="stat">
          <h3>{{ user.profile.contributions.votes }}</h3>
          <p>Votes</p>
        </div>
        <div class="stat">
          <h3>{{ user.profile.reputation }}</h3>
          <p>Reputation</p>
        </div>
      </div>

      <div class="profile-details">
        <h3>About</h3>
        <p v-if="user.profile.bio">{{ user.profile.bio }}</p>
        <p v-else class="no-bio">No bio provided</p>
      </div>
    </div>

    <div class="edit-profile-section">
      <h3>Edit Profile</h3>
      <form @submit.prevent="updateProfile" class="profile-form">
        <div class="form-group">
          <label for="name">Name</label>
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
          <label for="bio">Bio</label>
          <textarea
            id="bio"
            v-model="form.bio"
            class="form-control"
            rows="4"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="avatar">Avatar URL</label>
          <input
            id="avatar"
            v-model="form.avatar"
            type="text"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label>Privacy Settings</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input v-model="form.privacy.showEmail" type="checkbox" />
              Show email to other users
            </label>
            <label class="checkbox-label">
              <input v-model="form.privacy.showActivity" type="checkbox" />
              Show activity to other users
            </label>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="updating">
          {{ updating ? 'Updating...' : 'Update Profile' }}
        </button>
      </form>
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
    privacy: {
      showEmail: boolean
      showActivity: boolean
    }
  }
}

interface ProfileForm {
  name: string
  username: string
  bio: string
  avatar: string
  privacy: {
    showEmail: boolean
    showActivity: boolean
  }
}

const { user } = defineProps<{ user: User }>()

const form = ref<ProfileForm>({
  name: user?.name || '',
  username: user?.username || '',
  bio: user?.profile.bio || '',
  avatar: user?.profile.avatar || '',
  privacy: {
    showEmail: user?.profile.privacy.showEmail || false,
    showActivity: user?.profile.privacy.showActivity || true,
  },
})

const updating = ref(false)

function updateProfile() {
  updating.value = true

  $fetch('/api/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${useCookie('auth_token').value}`,
    },
    body: form.value,
  })
    .then(updatedUser => {
      // Update the user in the parent component
      const updatedUserData = updatedUser as User
      // In a real app, you'd emit an event or use a store to update the user
      alert('Profile updated successfully!')
    })
    .catch(error => {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    })
    .finally(() => {
      updating.value = false
    })
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.avatar-container {
  flex-shrink: 0;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #666;
}

.profile-info h1 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
}

.username {
  color: #666;
  margin: 0 0 0.25rem 0;
}

.join-date {
  color: #888;
  margin: 0;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.stat {
  text-align: center;
}

.stat h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
}

.stat p {
  margin: 0;
  color: #666;
}

.profile-details h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.no-bio {
  color: #888;
  font-style: italic;
}

.edit-profile-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-form {
  max-width: 500px;
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

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

@media (max-width: 768px) {
  .profile-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
