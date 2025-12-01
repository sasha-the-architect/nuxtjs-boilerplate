<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">API Analytics</h1>
          <NuxtLink
            to="/api-docs"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
          >
            API Documentation
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 class="text-lg font-medium text-blue-800 mb-2">
              Total Requests
            </h3>
            <p class="text-3xl font-bold text-blue-600">12,342</p>
            <p class="text-sm text-blue-700 mt-1">+12% from last week</p>
          </div>

          <div class="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 class="text-lg font-medium text-green-800 mb-2">
              Success Rate
            </h3>
            <p class="text-3xl font-bold text-green-600">98.7%</p>
            <p class="text-sm text-green-700 mt-1">2.3% errors</p>
          </div>

          <div class="bg-purple-50 border border-purple-200 rounded-md p-4">
            <h3 class="text-lg font-medium text-purple-800 mb-2">
              Active Keys
            </h3>
            <p class="text-3xl font-bold text-purple-600">42</p>
            <p class="text-sm text-purple-700 mt-1">12 new this week</p>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-700 mb-4">
            Endpoint Usage
          </h2>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-gray-700">GET /api/v1/resources</span>
                <span class="text-gray-600">4,231 requests</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  class="bg-blue-600 h-2.5 rounded-full"
                  style="width: 75%"
                ></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-1">
                <span class="text-gray-700">GET /api/v1/search</span>
                <span class="text-gray-600">3,892 requests</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  class="bg-green-600 h-2.5 rounded-full"
                  style="width: 65%"
                ></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-1">
                <span class="text-gray-700">POST /api/submissions</span>
                <span class="text-gray-600">1,245 requests</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  class="bg-yellow-600 h-2.5 rounded-full"
                  style="width: 35%"
                ></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-1">
                <span class="text-gray-700">GET /api/v1/auth/api-keys</span>
                <span class="text-gray-600">892 requests</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  class="bg-purple-600 h-2.5 rounded-full"
                  style="width: 15%"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-700 mb-4">
            Recent API Activity
          </h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Endpoint
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Method
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Time
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    API Key
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    /api/v1/resources
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    GET
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                      >200</span
                    >
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2 min ago
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    key_abc123
                  </td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    /api/v1/search
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    GET
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                      >200</span
                    >
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    5 min ago
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    key_def456
                  </td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    /api/submissions
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    POST
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                      >200</span
                    >
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    8 min ago
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    key_ghi789
                  </td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    /api/v1/resources
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    GET
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"
                      >429</span
                    >
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    12 min ago
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    key_jkl012
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-700 mb-4">
            Rate Limiting
          </h2>
          <p class="text-gray-600 mb-4">
            Monitor rate limiting statistics to ensure fair API usage across all
            consumers.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="border border-gray-200 rounded-md p-4">
              <h3 class="font-medium text-gray-800 mb-2">
                Rate Limit Exceeded
              </h3>
              <p class="text-2xl font-bold text-red-600">124</p>
              <p class="text-sm text-gray-600 mt-1">
                requests blocked this week
              </p>
            </div>

            <div class="border border-gray-200 rounded-md p-4">
              <h3 class="font-medium text-gray-800 mb-2">
                Average Response Time
              </h3>
              <p class="text-2xl font-bold text-gray-700">142ms</p>
              <p class="text-sm text-gray-600 mt-1">across all endpoints</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'API Analytics - Free Stuff on the Internet',
  meta: [
    {
      name: 'description',
      content:
        'API usage analytics and monitoring for Free Stuff on the Internet',
    },
  ],
})
</script>
