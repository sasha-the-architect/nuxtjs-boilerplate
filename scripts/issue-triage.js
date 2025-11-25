#!/usr/bin/env node

/**
 * Issue Triage and Organization Script
 * Implements the automated issue triage and organization system as specified in issue #211
 */

import { execSync } from 'child_process'

// Configuration
const GITHUB_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
const REPO_OWNER = getRepoOwner()
const REPO_NAME = getRepoName()

function getRepoOwner() {
  try {
    const remoteUrl = execSync('git remote get-url origin', {
      encoding: 'utf-8',
    }).trim()
    // Extract owner from URLs like git@github.com:owner/repo.git or https://github.com/owner/repo.git
    const match = remoteUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)/)
    return match ? match[1] : 'nuxtjs-boilerplate'
  } catch {
    return 'nuxtjs-boilerplate'
  }
}

function getRepoName() {
  try {
    const remoteUrl = execSync('git remote get-url origin', {
      encoding: 'utf-8',
    }).trim()
    const match = remoteUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)/)
    return match ? match[2] : 'nuxtjs-boilerplate'
  } catch {
    return 'nuxtjs-boilerplate'
  }
}

// Get open issues with categorization
function getOpenIssues() {
  try {
    const cmd = `gh issue list --state open --json number,title,body,author,createdAt,labels,assignees --repo ${REPO_OWNER}/${REPO_NAME}`
    const output = execSync(cmd, { encoding: 'utf-8' })
    const issues = JSON.parse(output)

    // Categorize issues
    const categorizedIssues = issues.map(issue => {
      return {
        ...issue,
        category: categorizeIssue(issue),
        priority: determinePriority(issue),
        needsTriage: !issue.labels || issue.labels.length === 0,
      }
    })

    return categorizedIssues
  } catch (error) {
    if (process.env.DEBUG)
      console.error('✗ Failed to fetch issues:', error.message)
    return []
  }
}

// Categorize issue based on title and body content
function categorizeIssue(issue) {
  const title = (issue.title || '').toLowerCase()
  const body = (issue.body || '').toLowerCase()

  // Check existing labels first, if any match known categories
  if (issue.labels && Array.isArray(issue.labels)) {
    const labelNames = issue.labels.map(l => l.name || l)
    for (const label of labelNames) {
      if (label.includes('bug') || label.includes('error')) return 'bug'
      if (label.includes('enhancement') || label.includes('feature'))
        return 'feature'
      if (label.includes('documentation') || label.includes('docs'))
        return 'documentation'
      if (label.includes('maintenance') || label.includes('refactor'))
        return 'maintenance'
      if (label.includes('testing') || label.includes('test')) return 'testing'
      if (label.includes('security')) return 'security'
      if (label.includes('performance')) return 'performance'
      if (label.includes('accessibility') || label.includes('a11y'))
        return 'accessibility'
    }
  }

  // Define category keywords
  const categories = {
    bug: ['bug', 'error', 'fix', 'issue', 'crash', 'broken', 'problem', 'fail'],
    feature: [
      'feature',
      'enhancement',
      'add',
      'new',
      'implement',
      'request',
      'would like',
    ],
    maintenance: [
      'maintenance',
      'refactor',
      'update',
      'cleanup',
      'improve',
      'optimize',
    ],
    documentation: [
      'documentation',
      'docs',
      'readme',
      'guide',
      'tutorial',
      'help',
      'explain',
    ],
    testing: ['test', 'testing', 'coverage', 'spec', 'verify', 'validate'],
    security: [
      'security',
      'vulnerability',
      'secure',
      'auth',
      'permission',
      'privacy',
    ],
    performance: [
      'performance',
      'speed',
      'optimize',
      'efficiency',
      'memory',
      'cpu',
      'load',
    ],
    accessibility: [
      'accessibility',
      'a11y',
      'wcag',
      'screen reader',
      'keyboard navigation',
    ],
  }

  // Check for category matches
  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (title.includes(keyword) || body.includes(keyword)) {
        return category
      }
    }
  }

  // Default category
  return 'task'
}

// Determine priority based on labels and content
function determinePriority(issue) {
  const labels = (issue.labels || []).map(l => l.name || l)

  // Check for explicit priority labels (including common variations)
  if (
    labels.includes('priority/high') ||
    labels.includes('high-priority') ||
    labels.includes('high priority') ||
    labels.some(
      l => l.includes('high') && (l.includes('priority') || l.includes('prio'))
    )
  )
    return 'high'
  if (
    labels.includes('priority/medium') ||
    labels.includes('medium-priority') ||
    labels.includes('medium priority') ||
    labels.some(
      l =>
        l.includes('medium') && (l.includes('priority') || l.includes('prio'))
    )
  )
    return 'medium'
  if (
    labels.includes('priority/low') ||
    labels.includes('low-priority') ||
    labels.includes('low priority') ||
    labels.some(
      l => l.includes('low') && (l.includes('priority') || l.includes('prio'))
    )
  )
    return 'low'

  // Check for high priority indicators
  const title = (issue.title || '').toLowerCase()
  const body = (issue.body || '').toLowerCase()

  const highPriorityIndicators = [
    'critical',
    'urgent',
    'emergency',
    'security',
    'vulnerability',
    'crash',
    'broken',
    'urgent fix',
    'security issue',
    'production',
  ]

  for (const indicator of highPriorityIndicators) {
    if (title.includes(indicator) || body.includes(indicator)) {
      return 'high'
    }
  }

  // Check for low priority indicators
  const lowPriorityIndicators = [
    'nice to have',
    'minor',
    'low priority',
    'suggestion',
    'idea',
  ]

  for (const indicator of lowPriorityIndicators) {
    if (title.includes(indicator) || body.includes(indicator)) {
      return 'low'
    }
  }

  // Default priority
  return 'medium'
}

// Identify duplicate issues
function identifyDuplicates(issues) {
  const duplicates = []
  const processed = new Set()

  for (let i = 0; i < issues.length; i++) {
    for (let j = i + 1; j < issues.length; j++) {
      const issue1 = issues[i]
      const issue2 = issues[j]

      // Compare title similarity
      if (!processed.has(issue1.number) && !processed.has(issue2.number)) {
        const similarity = calculateTitleSimilarity(issue1.title, issue2.title)
        if (similarity > 0.7) {
          // 70% similarity
          duplicates.push({
            primary: issue1.number,
            duplicate: issue2.number,
            similarity: similarity,
          })
          processed.add(issue2.number)
        }
      }
    }
  }

  return duplicates
}

// Calculate title similarity using a simple algorithm
function calculateTitleSimilarity(title1, title2) {
  const t1 = title1.toLowerCase().replace(/[^\w\s]/g, '')
  const t2 = title2.toLowerCase().replace(/[^\w\s]/g, '')

  const words1 = t1.split(/\s+/).filter(w => w.length > 2)
  const words2 = t2.split(/\s+/).filter(w => w.length > 2)

  const commonWords = words1.filter(word => words2.includes(word))
  const allWords = new Set([...words1, ...words2])

  return commonWords.length / allWords.size
}

// Apply labels to issues based on categorization
function applyLabels(issueNumber, category, priority) {
  try {
    const labels = [category]

    // Check if priority labels exist in the repo first, if not, skip them
    try {
      // Try to apply priority label
      execSync(
        `gh issue edit ${issueNumber} --add-label "priority/${priority}"`,
        { stdio: 'pipe' }
      )
      labels.push(`priority/${priority}`)
    } catch (priorityError) {
      // Priority label doesn't exist, so we'll skip it
      if (process.env.DEBUG) {
        console.log(
          `⚠️ Priority label "priority/${priority}" not found in repo, skipping`
        )
      }
    }

    // Add additional labels based on content
    const cmd = `gh issue view ${issueNumber} --json body,title --repo ${REPO_OWNER}/${REPO_NAME}`
    const issueDetails = JSON.parse(execSync(cmd, { encoding: 'utf-8' }))

    const body = (issueDetails.body || '').toLowerCase()
    const title = (issueDetails.title || '').toLowerCase()

    // Check if good first issue label exists
    if (
      body.includes('good first issue') ||
      title.includes('good first issue')
    ) {
      try {
        execSync(
          `gh issue edit ${issueNumber} --add-label "good first issue"`,
          { stdio: 'pipe' }
        )
        labels.push('good first issue')
      } catch (labelError) {
        if (process.env.DEBUG)
          console.log(`⚠️ "good first issue" label not found in repo, skipping`)
      }
    }

    // Check if help wanted label exists
    if (body.includes('help wanted') || title.includes('help wanted')) {
      try {
        execSync(`gh issue edit ${issueNumber} --add-label "help wanted"`, {
          stdio: 'pipe',
        })
        labels.push('help wanted')
      } catch (labelError) {
        if (process.env.DEBUG)
          console.log(`⚠️ "help wanted" label not found in repo, skipping`)
      }
    }

    // Apply other common labels if they exist
    if (priority === 'high') {
      try {
        execSync(`gh issue edit ${issueNumber} --add-label "high-priority"`, {
          stdio: 'pipe',
        })
        labels.push('high-priority')
      } catch (labelError) {
        // Try alternative high priority label
        try {
          execSync(`gh issue edit ${issueNumber} --add-label "high priority"`, {
            stdio: 'pipe',
          })
          labels.push('high priority')
        } catch (altError) {
          if (process.env.DEBUG)
            console.log(`⚠️ High priority labels not found in repo, skipping`)
        }
      }
    }

    if (process.env.DEBUG)
      console.log(
        `✓ Applied labels to issue #${issueNumber}: ${labels.join(', ')}`
      )

    return true
  } catch (error) {
    if (process.env.DEBUG)
      console.error(
        `✗ Failed to apply labels to issue #${issueNumber}:`,
        error.message
      )
    return false
  }
}

// Identify stale issues for closure
function identifyStaleIssues(issues) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  return issues.filter(issue => {
    const createdAt = new Date(issue.createdAt)

    // For now, we'll just check creation date since we don't have detailed comment data
    return createdAt < thirtyDaysAgo
  })
}

// Create summary report of triage results
function generateTriageReport(issues, duplicates, staleIssues) {
  const report = {
    totalIssues: issues.length,
    categorized: issues.filter(i => !i.needsTriage).length,
    needsTriage: issues.filter(i => i.needsTriage).length,
    duplicatesFound: duplicates.length,
    staleIssues: staleIssues.length,
    categoryBreakdown: {},
    priorityBreakdown: {},
  }

  // Count categories
  for (const issue of issues) {
    report.categoryBreakdown[issue.category] =
      (report.categoryBreakdown[issue.category] || 0) + 1
    report.priorityBreakdown[issue.priority] =
      (report.priorityBreakdown[issue.priority] || 0) + 1
  }

  return report
}

// Main triage function
async function runIssueTriage() {
  if (process.env.DEBUG) console.log('🚀 Starting Issue Triage Process...\n')

  // Verify prerequisites
  if (!GITHUB_TOKEN) {
    if (process.env.DEBUG)
      console.error('✗ GH_TOKEN environment variable is required')
    return
  }

  try {
    // Get all open issues
    if (process.env.DEBUG) console.log('🔍 Fetching open issues...')
    const issues = getOpenIssues()

    if (process.env.DEBUG) {
      console.log(`📋 Found ${issues.length} open issues\n`)
      console.log('📊 Initial categorization:')
      const categories = {}
      issues.forEach(issue => {
        categories[issue.category] = (categories[issue.category] || 0) + 1
      })
      for (const [cat, count] of Object.entries(categories)) {
        console.log(`   ${cat}: ${count}`)
      }
      console.log('')
    }

    if (issues.length === 0) {
      if (process.env.DEBUG) console.log('✅ No open issues to triage')
      return
    }

    // Identify duplicates
    if (process.env.DEBUG) console.log('🔍 Identifying duplicate issues...')
    const duplicates = identifyDuplicates(issues)
    if (process.env.DEBUG)
      console.log(`📋 Found ${duplicates.length} potential duplicates\n`)

    // Identify stale issues
    if (process.env.DEBUG) console.log('🔍 Identifying stale issues...')
    const staleIssues = identifyStaleIssues(issues)
    if (process.env.DEBUG)
      console.log(`📋 Found ${staleIssues.length} stale issues\n`)

    // Apply labels to untriaged issues
    if (process.env.DEBUG)
      console.log('🏷️  Applying labels to untriaged issues...')
    let labelsApplied = 0
    for (const issue of issues) {
      if (issue.needsTriage) {
        const success = applyLabels(
          issue.number,
          issue.category,
          issue.priority
        )
        if (success) labelsApplied++
      }
    }
    if (process.env.DEBUG)
      console.log(`📋 Applied labels to ${labelsApplied} issues\n`)

    // Generate and display report
    const report = generateTriageReport(issues, duplicates, staleIssues)
    if (process.env.DEBUG) {
      console.log('📋 Triage Report:')
      console.log(`   Total Issues: ${report.totalIssues}`)
      console.log(`   Categorized: ${report.categorized}`)
      console.log(`   Needs Triage: ${report.needsTriage}`)
      console.log(`   Duplicates Found: ${report.duplicatesFound}`)
      console.log(`   Stale Issues: ${report.staleIssues}`)
      console.log('\n   Category Breakdown:')
      for (const [cat, count] of Object.entries(report.categoryBreakdown)) {
        console.log(`      ${cat}: ${count}`)
      }
      console.log('\n   Priority Breakdown:')
      for (const [pri, count] of Object.entries(report.priorityBreakdown)) {
        console.log(`      ${pri}: ${count}`)
      }
    }

    // Add comment to issue #211 with the results
    if (process.env.DEBUG) {
      const summary = `Issue triage process completed. Processed ${issues.length} issues, applied labels to ${labelsApplied} issues, identified ${duplicates.length} potential duplicates, and found ${staleIssues.length} stale issues.`
      try {
        execSync(
          `gh issue comment 211 --body "${summary}" --repo ${REPO_OWNER}/${REPO_NAME}`,
          { stdio: 'pipe' }
        )
        console.log('\n✅ Comment added to issue #211 with triage results')
      } catch (commentError) {
        console.log(
          '\n⚠️ Could not comment on issue #211:',
          commentError.message
        )
      }
    }

    if (process.env.DEBUG)
      console.log('\n✅ Issue Triage Process Completed Successfully!')
  } catch (error) {
    if (process.env.DEBUG)
      console.error('💥 Issue triage failed:', error.message)
    process.exit(1)
  }
}

// Export functions for testing/reuse
export {
  runIssueTriage,
  getOpenIssues,
  categorizeIssue,
  determinePriority,
  identifyDuplicates,
  calculateTitleSimilarity,
  applyLabels,
  identifyStaleIssues,
  generateTriageReport,
}

// Run when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIssueTriage().catch(error => {
    if (process.env.DEBUG)
      console.error('💥 Fatal error in issue triage:', error)
    process.exit(1)
  })
}
