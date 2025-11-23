import { ref, readonly } from 'vue'

export default defineNuxtPlugin(() => {
  const showInstallPrompt = ref(false)
  const deferredPrompt: any = ref(null)

  // Listen for the beforeinstallprompt event
  if (process.client) {
    window.addEventListener('beforeinstallprompt', e => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      deferredPrompt.value = e
      // Update UI to notify the user they can install the PWA
      showInstallPrompt.value = true
    })

    // Listen for the appinstalled event
    window.addEventListener('appinstalled', () => {
      showInstallPrompt.value = false
      deferredPrompt.value = null
    })
  }

  // Function to trigger PWA installation
  const installPWA = () => {
    if (deferredPrompt.value) {
      // Show the install prompt
      deferredPrompt.value.prompt()
      // Wait for the user to respond to the prompt
      deferredPrompt.value.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          // User accepted the install prompt
        } else {
          // User dismissed the install prompt
        }
        deferredPrompt.value = null
        showInstallPrompt.value = false
      })
    }
  }

  // Expose the PWA functions
  return {
    provide: {
      pwa: {
        showInstallPrompt: readonly(showInstallPrompt),
        installPWA,
      },
    },
  }
})
