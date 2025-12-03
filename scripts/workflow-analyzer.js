#!/usr/bin/env node

/**
 * Script to analyze GitHub workflows and identify redundancies
 * This helps address issue #391: Over-Engineered GitHub Workflows Causing CI/CD Bottlenecks
 */

import fs from 'fs'
import path from 'path'

function analyzeWorkflows() {
  const workflowsDir = path.join(process.cwd(), '.github', 'workflows')

  if (!fs.existsSync(workflowsDir)) {
    console.error('Workflows directory does not exist')
    return
  }

  const workflowFiles = fs
    .readdirSync(workflowsDir)
    .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
    .filter(file => !file.includes('backup') && !file.includes('template'))

  console.log(`Found ${workflowFiles.length} workflow files:`)

  const aiAgentWorkflows = []
  const opencodeWorkflows = []
  const otherWorkflows = []

  workflowFiles.forEach(file => {
    if (file.startsWith('ai-') && file.includes('-agent')) {
      aiAgentWorkflows.push(file)
    } else if (file.startsWith('oc-') || file.includes('opencode')) {
      opencodeWorkflows.push(file)
    } else {
      otherWorkflows.push(file)
    }
  })

  console.log('\n--- Analysis ---')
  console.log(
    `AI Agent Workflows (${aiAgentWorkflows.length}):`,
    aiAgentWorkflows
  )
  console.log(
    `OpenCode Workflows (${opencodeWorkflows.length}):`,
    opencodeWorkflows
  )
  console.log(`Other Workflows (${otherWorkflows.length}):`, otherWorkflows)

  console.log('\n--- Recommendations ---')
  console.log(
    `1. The ${aiAgentWorkflows.length} AI agent workflows are highly redundant with similar structure and functionality.`
  )
  console.log(
    `2. The ${opencodeWorkflows.length} OpenCode workflows follow the same pattern with minor variations.`
  )
  console.log(
    '3. Consider consolidating these into configurable workflows to reduce CI/CD overhead.'
  )
  console.log(
    '4. This would reduce workflow count and eliminate bottlenecks mentioned in issue #391.'
  )

  const totalReduction = aiAgentWorkflows.length + opencodeWorkflows.length - 2 // Assuming consolidation to 2 main workflows
  console.log(`\n--- Potential Impact ---`)
  console.log(
    `Potential reduction: ${workflowFiles.length} → ${workflowFiles.length - totalReduction} workflows`
  )
  console.log(`Workflows eliminated: ~${totalReduction}`)
}

analyzeWorkflows()
