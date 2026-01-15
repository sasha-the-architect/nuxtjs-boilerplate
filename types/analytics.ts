export interface SearchAnalyticsData {
  success: boolean
  data: {
    totalSearches: number
    successRate: number
    zeroResultCount: number
    avgResponseTime: number
    searchTrends: Array<{ date: string; count: number }>
    popularSearches: Array<{ query: string; count: number }>
    zeroResultQueries: Array<{ query: string; count: number }>
    performanceMetrics: {
      fastSearches: number
      mediumSearches: number
      slowSearches: number
    }
  }
  dateRange: {
    start: string
    end: string
  }
}
