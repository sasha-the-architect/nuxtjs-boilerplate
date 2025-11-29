/**
 * Task Coordination System
 * Manages the coordination of multiple development agents working on different features
 *
 * This system helps coordinate:
 * - Advanced Search System (Issue #277)
 * - Resource Recommendation Engine (Issue #279)
 * - Community Features (Issue #280)
 */

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee?: string
  dependencies: string[]
  startDate?: Date
  endDate?: Date
  progress: number // 0-100 percentage
  notes: string[]
}

interface CoordinationReport {
  taskId: string
  agent: string
  status: 'working' | 'completed' | 'blocked' | 'needs-review'
  progress: number
  blockers?: string[]
  dependenciesResolved: boolean
  nextSteps: string[]
  timestamp: Date
}

class TaskCoordinationSystem {
  private tasks: any = {}
  private reports: CoordinationReport[] = []
  private agents: any = {}

  constructor() {
    this.initializeDefaultTasks()
  }

  private initializeDefaultTasks(): void {
    // Advanced Search System (Issue #277)
    this.addTask({
      id: 'advanced-search',
      title: 'Advanced Search and Filtering System',
      description:
        'Implement comprehensive advanced search and filtering system with faceted search, saved searches, and enhanced filtering options',
      status: 'in-progress',
      priority: 'high',
      dependencies: [],
      progress: 90, // Since basic implementation exists
      notes: [
        'PR #288 exists and looks ready',
        'Basic implementation in useAdvancedResourceSearch.ts',
      ],
    })

    // Analytics Dashboard (Issue #278)
    this.addTask({
      id: 'analytics-dashboard',
      title: 'Analytics Dashboard',
      description:
        'Implement comprehensive analytics dashboard to track user behavior, resource performance, and system metrics',
      status: 'completed',
      priority: 'high',
      dependencies: [],
      progress: 100,
      notes: ['PR #286 selected', 'Basic analytics in place'],
    })

    // API Rate Limiting (Issue #284)
    this.addTask({
      id: 'api-rate-limiting',
      title: 'API Rate Limiting',
      description:
        'Implement comprehensive rate limiting system with different tiers for different API endpoints',
      status: 'completed',
      priority: 'high',
      dependencies: [],
      progress: 100,
      notes: ['PR #289 selected', 'Rate limiting in place'],
    })

    // Resource Recommendation Engine (Issue #279)
    this.addTask({
      id: 'recommendation-engine',
      title: 'Resource Recommendation Engine',
      description:
        'Implement comprehensive resource recommendation engine using collaborative and content-based filtering',
      status: 'pending',
      priority: 'high',
      dependencies: ['analytics-dashboard'],
      progress: 0,
      notes: ['No PR exists yet', 'Depends on analytics data from PR #286'],
    })

    // Community Features (Issue #280)
    this.addTask({
      id: 'community-features',
      title: 'Community Features and User Profiles',
      description:
        'Implement comprehensive community features including user profiles, comments, voting, and moderation',
      status: 'pending',
      priority: 'medium',
      dependencies: ['analytics-dashboard'],
      progress: 0,
      notes: ['No PR exists yet', 'Depends on user analytics data'],
    })
  }

  addTask(
    task: Omit<Task, 'notes' | 'progress'> & {
      notes?: string[]
      progress?: number
    }
  ): void {
    const fullTask: Task = {
      ...task,
      notes: task.notes || [],
      progress: task.progress || 0,
    }
    this.tasks[task.id] = fullTask
  }

  updateTaskStatus(
    taskId: string,
    status: Task['status'],
    progress?: number
  ): boolean {
    if (!this.tasks[taskId]) return false

    this.tasks[taskId].status = status
    if (progress !== undefined) {
      this.tasks[taskId].progress = Math.max(0, Math.min(100, progress)) // Clamp between 0-100
    }
    return true
  }

  assignTask(taskId: string, assignee: string): boolean {
    if (!this.tasks[taskId]) return false

    this.tasks[taskId].assignee = assignee
    return true
  }

  addNote(taskId: string, note: string): boolean {
    if (!this.tasks[taskId]) return false

    this.tasks[taskId].notes.push(`${new Date().toISOString()}: ${note}`)
    return true
  }

  submitReport(report: Omit<CoordinationReport, 'timestamp'>): void {
    this.reports.push({
      ...report,
      timestamp: new Date(),
    })

    // Update task status based on report
    if (report.status === 'completed') {
      this.updateTaskStatus(report.taskId, 'completed', 100)
    } else if (report.status === 'blocked') {
      this.updateTaskStatus(report.taskId, 'blocked')
      if (report.blockers) {
        report.blockers.forEach(blocker => {
          this.addNote(report.taskId, `BLOCKER: ${blocker}`)
        })
      }
    } else if (report.status === 'needs-review') {
      this.addNote(
        report.taskId,
        `NEEDS REVIEW: ${report.nextSteps.join(', ')}`
      )
    }
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks[taskId]
  }

  getAllTasks(): Task[] {
    return Object.keys(this.tasks).map(key => this.tasks[key])
  }

  getTasksByAgent(agent: string): Task[] {
    return Object.keys(this.tasks)
      .map(key => this.tasks[key])
      .filter((task: Task) => task.assignee === agent)
  }

  getTasksByStatus(status: Task['status']): Task[] {
    return Object.keys(this.tasks)
      .map(key => this.tasks[key])
      .filter((task: Task) => task.status === status)
  }

  getTasksByPriority(priority: Task['priority']): Task[] {
    return Object.keys(this.tasks)
      .map(key => this.tasks[key])
      .filter((task: Task) => task.priority === priority)
  }

  getRecentReports(limit: number = 10): CoordinationReport[] {
    return this.reports
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  getDependencyStatus(taskId: string): {
    resolved: boolean
    unresolved: string[]
  } {
    if (!this.tasks[taskId]) {
      return { resolved: false, unresolved: [] }
    }

    const task = this.tasks[taskId]
    const unresolved = task.dependencies.filter((depId: string) => {
      const depTask = this.tasks[depId]
      return !depTask || depTask.status !== 'completed'
    })

    return {
      resolved: unresolved.length === 0,
      unresolved,
    }
  }

  generateCoordinationSummary(): {
    totalTasks: number
    completed: number
    inProgress: number
    blocked: number
    pending: number
    overallProgress: number
    nextPriorities: string[]
  } {
    const allTasks = this.getAllTasks()
    const totalTasks = allTasks.length

    const completed = allTasks.filter(t => t.status === 'completed').length
    const inProgress = allTasks.filter(t => t.status === 'in-progress').length
    const blocked = allTasks.filter(t => t.status === 'blocked').length
    const pending = allTasks.filter(t => t.status === 'pending').length

    const overallProgress =
      totalTasks > 0
        ? allTasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks
        : 0

    const nextPriorities = allTasks
      .filter(t => t.status === 'pending' && t.priority === 'high')
      .map(t => t.title)

    return {
      totalTasks,
      completed,
      inProgress,
      blocked,
      pending,
      overallProgress,
      nextPriorities,
    }
  }
}

// Singleton instance for the coordination system
const taskCoordinationSystem = new TaskCoordinationSystem()

// Export the class and instance
export {
  TaskCoordinationSystem,
  type Task,
  type CoordinationReport,
  taskCoordinationSystem,
}

// Export individual methods as separate functions
export const addTask = (
  task: Omit<Task, 'notes' | 'progress'> & {
    notes?: string[]
    progress?: number
  }
) => taskCoordinationSystem.addTask(task)

export const updateTaskStatus = (
  taskId: string,
  status: Task['status'],
  progress?: number
) => taskCoordinationSystem.updateTaskStatus(taskId, status, progress)

export const assignTask = (taskId: string, assignee: string) =>
  taskCoordinationSystem.assignTask(taskId, assignee)

export const addNote = (taskId: string, note: string) =>
  taskCoordinationSystem.addNote(taskId, note)

export const submitReport = (report: Omit<CoordinationReport, 'timestamp'>) =>
  taskCoordinationSystem.submitReport(report)

export const getTask = (taskId: string) =>
  taskCoordinationSystem.getTask(taskId)

export const getAllTasks = () => taskCoordinationSystem.getAllTasks()

export const getTasksByAgent = (agent: string) =>
  taskCoordinationSystem.getTasksByAgent(agent)

export const getTasksByStatus = (status: Task['status']) =>
  taskCoordinationSystem.getTasksByStatus(status)

export const getTasksByPriority = (priority: Task['priority']) =>
  taskCoordinationSystem.getTasksByPriority(priority)

export const getRecentReports = (limit: number = 10) =>
  taskCoordinationSystem.getRecentReports(limit)

export const getDependencyStatus = (taskId: string) =>
  taskCoordinationSystem.getDependencyStatus(taskId)

export const generateCoordinationSummary = () =>
  taskCoordinationSystem.generateCoordinationSummary()
