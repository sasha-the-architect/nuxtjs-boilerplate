<template>
  <div class="user-profile">
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
        <h1 class="username">{{ user.name }}</h1>
        <p v-if="user.profile.bio" class="bio">{{ user.profile.bio }}</p>
        <div class="user-stats">
          <div class="stat">
            <span class="stat-value">{{
              user.profile.contributions.resources
            }}</span>
            <span class="stat-label">Resources</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{
              user.profile.contributions.comments
            }}</span>
            <span class="stat-label">Comments</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{
              user.profile.contributions.votes
            }}</span>
            <span class="stat-label">Votes</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ user.profile.reputation }}</span>
            <span class="stat-label">Reputation</span>
          </div>
        </div>
        <div class="profile-actions" v-if="isCurrentUser">
          <button @click="editProfile" class="btn btn-primary">
            Edit Profile
          </button>
        </div>
      </div>
    </div>

    <div class="profile-details">
      <div class="detail-section">
        <h3>About</h3>
        <p>{{ user.profile.bio || 'No bio provided' }}</p>
      </div>

      <div class="detail-section">
        <h3>Activity</h3>
        <div class="activity-list">
          <div
            v-for="activity in userActivity"
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-content">
              <p>{{ activity.type }}: {{ activity.content }}</p>
              <small>{{ formatDate(activity.timestamp) }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Edit Profile</h2>
          <button @click="closeEditModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveProfile" class="edit-form">
          <div class="form-group">
            <label for="name">Name</label>
            <input
              id="name"
              v-model="editForm.name"
              type="text"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="editForm.username"
              type="text"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea
              id="bio"
              v-model="editForm.bio"
              class="form-control"
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="avatar">Avatar URL</label>
            <input
              id="avatar"
              v-model="editForm.avatar"
              type="text"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Privacy Settings</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input v-model="editForm.privacy.showEmail" type="checkbox" />
                Show email to other users
              </label>
              <label class="checkbox-label">
                <input
                  v-model="editForm.privacy.showActivity"
                  type="checkbox"
                />
                Show activity to other users
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="closeEditModal"
              class="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: string
  name: string
  username: string
  email: string
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
  createdAt: string
  updatedAt: string
}

interface Activity {
  id: string
  type: string
  content: string
  timestamp: string
}

interface EditForm {
  name: string
  username: string
  bio: string
  avatar: string
  privacy: {
    showEmail: boolean
    showActivity: boolean
  }
}

const props = defineProps<{
  userId: string
}>()

const user = ref<User | null>(null)
const userActivity = ref<Activity[]>([])
const showEditModal = ref(false)
const saving = ref(false)
const editForm = ref<EditForm>({
  name: '',
  username: '',
  bio: '',
  avatar: '',
  privacy: {
    showEmail: false,
    showActivity: true,
  },
})

// Check if this is the current user's profile
const { data: currentUser } = await $fetch('/api/auth/profile', {
  headers: {
    Authorization: `Bearer ${useCookie('auth_token').value}`,
  },
}).catch(() => ({ data: null }))

const isCurrentUser = computed(() => {
  return currentUser && user.value && currentUser.id === user.value.id
})

// Load user data
async function loadUser() {
  try {
    const userData = await $fetch(`/api/users/${props.userId}`)
    user.value = userData
  } catch (error) {
    console.error('Error loading user:', error)
  }
}

// Load user activity
async function loadActivity() {
  try {
    const activity = await $fetch(`/api/users/${props.userId}/activity`)
    userActivity.value = activity
  } catch (error) {
    console.error('Error loading user activity:', error)
    userActivity.value = []
  }
}

// Initialize
onMounted(async () => {
  await loadUser()
  await loadActivity()
})

// Edit profile
function editProfile() {
  if (user.value) {
    editForm.value = {
      name: user.value.name,
      username: user.value.username,
      bio: user.value.profile.bio,
      avatar: user.value.profile.avatar,
      privacy: { ...user.value.profile.privacy },
    }
    showEditModal.value = true
  }
}

// Save profile
async function saveProfile() {
  if (!user.value) return

  saving.value = true
  try {
    const updatedUser = await $fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${useCookie('auth_token').value}`,
      },
      body: {
        name: editForm.value.name,
        username: editForm.value.username,
        bio: editForm.value.bio,
        avatar: editForm.value.avatar,
        privacy: editForm.value.privacy,
      },
    })

    // Update local user data
    user.value = updatedUser as User
    showEditModal.value = false
  } catch (error) {
    console.error('Error saving profile:', error)
  } finally {
    saving.value = false
  }
}

// Close edit modal
function closeEditModal() {
  showEditModal.value = false
}

// Helper functions
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
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.user-profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.avatar-container {
  flex-shrink: 0;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: #666;
}

.profile-info {
  flex: 1;
}

.username {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.bio {
  color: #666;
  margin-bottom: 1rem;
}

.user-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: bold;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: #666;
}

.profile-actions {
  margin-top: 1rem;
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

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h3 {
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.25rem;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  padding: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.edit-form {
  padding: 1rem;
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
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .user-stats {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
