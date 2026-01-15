<template>
  <div class="mt-12">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">
        Comments
      </h2>
      <span class="text-sm text-gray-500">{{ commentCount }} comments</span>
    </div>

    <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <textarea
        v-model="newComment"
        placeholder="Share your thoughts about this resource..."
        class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        rows="4"
        aria-label="Add a comment"
      />
      <div class="mt-3 flex justify-end">
        <button
          class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
          @click="submitComment"
        >
          Post Comment
        </button>
      </div>
    </div>

    <div class="space-y-4">
      <div
        v-for="comment in formattedComments"
        :key="comment.id"
        class="flex space-x-4"
      >
        <div class="flex-shrink-0">
          <div
            class="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10"
            aria-hidden="true"
          />
        </div>
        <div class="flex-1">
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center">
              <span class="font-medium text-gray-900">{{
                comment.displayName
              }}</span>
              <span class="ml-2 text-sm text-gray-500">{{
                comment.displayTime
              }}</span>
            </div>
            <p class="mt-1 text-gray-700">
              {{ comment.displayContent }}
            </p>
            <div class="mt-2 flex space-x-4">
              <button
                class="text-sm text-gray-500 hover:text-gray-700"
                aria-label="Like this comment"
              >
                Like ({{ comment.displayLikes }})
              </button>
              <button
                class="text-sm text-gray-500 hover:text-gray-700"
                aria-label="Reply to this comment"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Comment } from '~/types/community'

interface Props {
  comments: Comment[]
  commentCount: number
}

const props = defineProps<Props>()

const newComment = ref('')

const emit = defineEmits<{
  submit: [comment: string]
}>()

const submitComment = () => {
  if (newComment.value.trim()) {
    emit('submit', newComment.value.trim())
    newComment.value = ''
  }
}

const formattedComments = computed(() => {
  return props.comments.map(comment => ({
    ...comment,
    displayName: comment.userName || comment.userId,
    displayContent: comment.content,
    displayTime: formatTimeAgo(comment.timestamp),
    displayLikes: comment.votes,
  }))
})

const formatTimeAgo = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  return date.toLocaleDateString()
}
</script>
