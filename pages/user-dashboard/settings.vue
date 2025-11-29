<template>
  <div class="settings-page">
    <h2>Account Settings</h2>

    <div class="settings-section">
      <h3>Change Password</h3>
      <form @submit.prevent="changePassword" class="password-form">
        <div class="form-group">
          <label for="currentPassword">Current Password</label>
          <input
            id="currentPassword"
            v-model="passwordForm.currentPassword"
            type="password"
            class="form-control"
            required
          />
        </div>

        <div class="form-group">
          <label for="newPassword">New Password</label>
          <input
            id="newPassword"
            v-model="passwordForm.newPassword"
            type="password"
            class="form-control"
            required
            minlength="8"
          />
        </div>

        <div class="form-group">
          <label for="confirmNewPassword">Confirm New Password</label>
          <input
            id="confirmNewPassword"
            v-model="passwordForm.confirmNewPassword"
            type="password"
            class="form-control"
            required
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="changingPassword"
        >
          {{ changingPassword ? 'Changing...' : 'Change Password' }}
        </button>
      </form>
    </div>

    <div class="settings-section">
      <h3>Notification Preferences</h3>
      <form @submit.prevent="updateNotifications" class="notification-form">
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="notificationForm.emailNotifications"
              type="checkbox"
            />
            Receive email notifications
          </label>
          <label class="checkbox-label">
            <input
              v-model="notificationForm.commentNotifications"
              type="checkbox"
            />
            Notify me about comments on my resources
          </label>
          <label class="checkbox-label">
            <input
              v-model="notificationForm.updatesNotifications"
              type="checkbox"
            />
            Notify me about platform updates
          </label>
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="updatingNotifications"
        >
          {{ updatingNotifications ? 'Saving...' : 'Save Preferences' }}
        </button>
      </form>
    </div>

    <div class="settings-section">
      <h3>Account Deletion</h3>
      <p>
        Warning: This action is irreversible. All your data will be permanently
        deleted.
      </p>
      <button
        @click="deleteAccount"
        class="btn btn-danger"
        :disabled="deletingAccount"
      >
        {{ deletingAccount ? 'Deleting...' : 'Delete Account' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

interface NotificationForm {
  emailNotifications: boolean
  commentNotifications: boolean
  updatesNotifications: boolean
}

const passwordForm = ref<PasswordForm>({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})

const notificationForm = ref<NotificationForm>({
  emailNotifications: true,
  commentNotifications: true,
  updatesNotifications: true,
})

const changingPassword = ref(false)
const updatingNotifications = ref(false)
const deletingAccount = ref(false)

function changePassword() {
  if (
    passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword
  ) {
    alert('New passwords do not match')
    return
  }

  changingPassword.value = true

  // In a real application, you would call an API endpoint to change the password
  // For now, we'll just show an alert
  alert('Password change functionality would be implemented here')

  changingPassword.value = false
}

function updateNotifications() {
  updatingNotifications.value = true

  // In a real application, you would call an API endpoint to update notification preferences
  // For now, we'll just show an alert
  alert('Notification preferences would be updated here')

  updatingNotifications.value = false
}

function deleteAccount() {
  if (
    confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    )
  ) {
    deletingAccount.value = true

    // In a real application, you would call an API endpoint to delete the account
    // For now, we'll just show an alert
    alert('Account deletion functionality would be implemented here')

    deletingAccount.value = false
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 600px;
  margin: 0 auto;
}

.settings-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.settings-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
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
  margin-bottom: 1rem;
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

.btn-danger {
  background-color: #dc3545;
  color: white;
}
</style>
