import type { WebhookQueueItem } from '~/types/webhook'
import { webhookStorage } from './webhookStorage'

export class WebhookQueueManager {
  private isProcessing = false
  private processorInterval: NodeJS.Timeout | null = null
  private processCallback: ((item: WebhookQueueItem) => Promise<void>) | null =
    null

  async enqueue(item: WebhookQueueItem): Promise<void> {
    await webhookStorage.addToQueue(item)
  }

  async dequeue(): Promise<WebhookQueueItem | null> {
    const queue = await webhookStorage.getQueue()
    if (queue.length === 0) {
      return null
    }

    const item = queue[0]
    await webhookStorage.removeFromQueue(item.id)
    return item
  }

  async getPendingItems(): Promise<WebhookQueueItem[]> {
    return await webhookStorage.getQueue()
  }

  async remove(id: string): Promise<void> {
    await webhookStorage.removeFromQueue(id)
  }

  startProcessor(callback: (item: WebhookQueueItem) => Promise<void>): void {
    this.processCallback = callback

    if (this.isProcessing) {
      return
    }

    this.isProcessing = true
    this.processorInterval = setInterval(() => {
      this.processQueue()
    }, 5000)
  }

  stopProcessor(): void {
    if (this.processorInterval) {
      clearInterval(this.processorInterval)
      this.processorInterval = null
    }
    this.isProcessing = false
  }

  private async processQueue(): Promise<void> {
    const queue = webhookStorage.getQueue()
    const now = new Date()

    for (const item of queue) {
      const scheduledFor = new Date(item.scheduledFor)

      if (scheduledFor <= now && this.processCallback) {
        try {
          await this.processCallback(item)
        } catch (error) {
          console.error(`Error processing queue item ${item.id}:`, error)
        }
      }
    }
  }

  async getQueueSize(): Promise<number> {
    const queue = await webhookStorage.getQueue()
    return queue.length
  }

  isRunning(): boolean {
    return this.isProcessing
  }

  async getNextScheduledTime(): Promise<string | null> {
    const queue = await webhookStorage.getQueue()
    return queue.length > 0 ? queue[0].scheduledFor : null
  }

  getNextScheduledAt(): number | null {
    const queue = webhookStorage.getQueue()
    return queue.length > 0 ? new Date(queue[0].scheduledFor).getTime() : null
  }
}

export const webhookQueueManager = new WebhookQueueManager()
