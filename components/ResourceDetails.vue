<template>
  <div class="mb-8">
    <DeprecationNotice
      v-if="
        status &&
          (status === 'deprecated' ||
            status === 'discontinued' ||
            status === 'pending')
      "
      :status="status"
      :migration-path="migrationPath"
      :deprecation-date="deprecationDate"
    />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="md:col-span-2">
        <DescriptionSection :description="description" />

        <BenefitsSection :benefits="benefits" />

        <ScreenshotsSection
          v-if="screenshots && screenshots.length > 0"
          :screenshots="screenshots"
          :title="title"
          @image-error="$emit('imageError', $event)"
        />

        <SpecificationsSection
          v-if="specifications && Object.keys(specifications).length > 0"
          :specifications="specifications"
        />

        <FeaturesSection
          v-if="features && features.length > 0"
          :features="features"
        />

        <LimitationsSection
          v-if="limitations && limitations.length > 0"
          :limitations="limitations"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DeprecationNotice from '~/components/DeprecationNotice.vue'
import DescriptionSection from '~/components/ResourceDetails/DescriptionSection.vue'
import BenefitsSection from '~/components/ResourceDetails/BenefitsSection.vue'
import ScreenshotsSection from '~/components/ResourceDetails/ScreenshotsSection.vue'
import SpecificationsSection from '~/components/ResourceDetails/SpecificationsSection.vue'
import FeaturesSection from '~/components/ResourceDetails/FeaturesSection.vue'
import LimitationsSection from '~/components/ResourceDetails/LimitationsSection.vue'

interface Props {
  title: string
  description: string
  benefits: string[]
  screenshots?: string[]
  specifications?: Record<string, string>
  features?: string[]
  limitations?: string[]
  status?: string
  migrationPath?: string
  deprecationDate?: string
}

defineProps<Props>()
defineEmits<{
  imageError: [event: Event]
}>()
</script>
