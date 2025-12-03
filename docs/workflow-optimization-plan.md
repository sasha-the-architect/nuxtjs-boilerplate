# GitHub Workflows Optimization Plan

## Issue

The repository currently has 22 GitHub workflow files causing CI/CD performance issues and maintenance overhead. According to issue #391, these over-engineered workflows are causing bottlenecks.

## Current State (as of Nov 30, 2025)

- 13 AI agent workflows (ai-ceo-agent.yml, ai-cfo-agent.yml, etc.)
- 5 OpenCode workflows (oc-issue-solver.yml, oc-maintainer.yml, etc.)
- 4 other workflows (PR Guard, iflow, etc.)

## Proposed Solution

Instead of having 18+ separate but functionally similar workflows, consolidate them into fewer, more configurable workflows.

### 1. Consolidated AI Agent Workflow

Create a single workflow that can handle all AI agent roles through configuration parameters:

- Single file: `.github/workflows/consolidated-ai-agent.yml`
- Uses `workflow_dispatch.inputs` to select agent type (ceo, cto, product-manager, etc.)
- Maintains all existing functionality
- Reduces from 13 workflows to 1 workflow

### 2. Consolidated OpenCode Workflow

Create a single workflow that can handle all OpenCode functions:

- Single file: `.github/workflows/consolidated-opencode.yml`
- Uses `workflow_dispatch.inputs` to select function type (issue-solver, pr-handler, etc.)
- Maintains all existing functionality
- Reduces from 5 workflows to 1 workflow

## Benefits

- Reduces workflow count from 22 to approximately 7
- Eliminates CI/CD bottlenecks caused by multiple concurrent workflows
- Reduces GitHub Actions costs
- Simplifies maintenance
- Maintains all existing functionality

## Implementation Steps

1. Create the new consolidated workflow files
2. Test new workflows to ensure functionality is preserved
3. Gradually migrate existing triggers to use consolidated workflows
4. Remove old redundant workflows after verification

## Configuration Example

The consolidated workflows would use parameters like:

```yaml
workflow_dispatch:
  inputs:
    agent_type:
      description: 'Type of AI agent to run'
      required: true
      default: 'issue-solver'
      type: choice
      options:
        - issue-solver
        - product-manager
        - cto
        - ceo
        - cfo
      # ... etc
```

This approach maintains all functionality while dramatically reducing the number of workflow files and associated overhead.
