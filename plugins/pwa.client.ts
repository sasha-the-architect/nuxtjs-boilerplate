import { ref, readonly } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

interface PWAInstallPrompt extends BeforeInstallPromptEvent {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

export default defineNuxtPlugin(() => {
  const showInstallPrompt = ref(false)
  const deferredPrompt = ref<PWAInstallPrompt | null>(null)

  if (process.client) {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault()
      deferredPrompt.value = e as PWAInstallPrompt
      showInstallPrompt.value = true
    })

    window.addEventListener('appinstalled', () => {
      showInstallPrompt.value = false
      deferredPrompt.value = null
    })
  }

  const installPWA = () => {
    if (deferredPrompt.value) {
      deferredPrompt.value.prompt()
      deferredPrompt.value.userChoice.then(choiceResult => {
        // Handle user choice silently - prompt was shown and user responded
        if (choiceResult.outcome === 'accepted') {
          // PWA was installed
        } else {
          // PWA installation was dismissed
        }
        deferredPrompt.value = null
        showInstallPrompt.value = false
      })
    }
  }

  return {
    provide: {
      pwa: {
        showInstallPrompt: readonly(showInstallPrompt),
        installPWA,
      },
    },
  }
})
