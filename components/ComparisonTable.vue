<template>
  <div v-if="resources && resources.length >= 2" class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            Criteria
          </th>
          <th
            v-for="(resource, index) in resources"
            :key="`header-${index}`"
            scope="col"
            class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            <div class="flex flex-col items-center">
              <div class="font-bold text-sm">{{ resource.title }}</div>
              <div class="text-xs text-gray-400 dark:text-gray-500">
                {{ resource.category }}
              </div>
              <button
                class="mt-1 text-red-500 hover:text-red-700 text-xs flex items-center"
                @click="removeResource(resource.id)"
              >
                <svg
                  class="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Remove
              </button>
            </div>
          </th>
        </tr>
      </thead>
      <tbody
        class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
      >
        <tr
          v-for="criterion in criteria"
          :key="criterion.id"
          class="hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <td
            class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
          >
            {{ criterion.name }}
          </td>
          <td
            v-for="(resource, index) in resources"
            :key="`data-${index}-${criterion.id}`"
            class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center"
          >
            <div class="flex justify-center">
              <ComparisonValue
                :value="getResourceValue(resource, criterion.id)"
                :type="criterion.type"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
    <svg
      class="mx-auto h-12 w-12 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
    <h3 class="mt-2 text-sm font-medium">No resources to compare</h3>
    <p class="mt-1 text-sm">
      Add at least 2 resources to see the comparison table.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Resource } from '~/types/resource'
import type { ComparisonCriteria } from '~/types/comparison'
import ComparisonValue from './ComparisonValue.vue'

interface Props {
  resources?: Resource[]
  criteria?: ComparisonCriteria[]
}

const props = withDefaults(defineProps<Props>(), {
  resources: () => [],
  criteria: () => [],
})
const emit = defineEmits(['remove-resource'])

const removeResource = (resourceId: string) => {
  emit('remove-resource', resourceId)
}

const getResourceValue = (resource: Resource, field: string) => {
  // Handle nested properties
  if (field.includes('.')) {
    const parts = field.split('.')
    let value: any = resource
    for (const part of parts) {
      value = value[part]
      if (value === undefined) break
    }
    return value
  }

  // Handle direct properties
  return (resource as any)[field]
}
</script>
