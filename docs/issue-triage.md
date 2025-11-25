# Issue Triage and Organization System

This document describes the automated issue triage and organization system implemented to address issue #211: "📋 Sub-Issue: Repository Triage and Issue Organization".

## Overview

The issue triage system is designed to automatically categorize, prioritize, and organize GitHub issues to maintain repository health and improve community engagement. The system processes open issues by:

- Categorizing issues based on content analysis
- Assigning priority levels
- Identifying potential duplicates
- Marking stale issues for closure
- Generating triage reports

## Features

### Automatic Issue Categorization

The system categorizes issues into the following types:

- **Bug**: Issues related to errors, crashes, or broken functionality
- **Feature**: Enhancement requests and new feature implementations
- **Maintenance**: Refactoring, cleanup, and optimization tasks
- **Documentation**: Documentation updates and improvements
- **Testing**: Test coverage and validation tasks
- **Security**: Security-related issues and vulnerabilities
- **Performance**: Performance optimization and efficiency improvements
- **Accessibility**: Accessibility and WCAG compliance tasks
- **Task**: General tasks that don't fit other categories

### Priority Assignment

Issues are assigned priority levels:

- **High**: Critical issues, security vulnerabilities, production bugs
- **Medium**: Standard features and improvements
- **Low**: Nice-to-have features, minor improvements

### Duplicate Detection

The system identifies potential duplicate issues by analyzing title similarity using a custom algorithm that compares common words and phrases.

### Stale Issue Identification

Issues older than 30 days without recent activity are marked as potentially stale.

## Usage

### Running the Triage System

```bash
# Run the issue triage system
npm run triage-issues

# Run both issue triage and PR automation
npm run triage
```

### Environment Configuration

The system requires a GitHub token with appropriate permissions:

```bash
export GH_TOKEN=your_github_token_here
```

### Configuration

The system is configured through environment variables:

- `GH_TOKEN`: GitHub token for API access
- `DEBUG`: Enable detailed logging when set to any value

## Implementation Details

### Categorization Algorithm

The categorization algorithm analyzes both the issue title and body content, looking for keywords that match predefined categories. Each issue is assigned a single primary category based on keyword matches.

### Priority Determination

Priority is determined by:

1. Explicit priority labels (priority/high, priority/medium, priority/low)
2. Keyword analysis in title/body for urgency indicators
3. Default assignment based on issue type

### Duplicate Detection Algorithm

The system uses a similarity algorithm that:

1. Normalizes titles by removing special characters
2. Splits titles into words (minimum 3 characters)
3. Calculates similarity based on common words
4. Marks issues with >70% similarity as potential duplicates

## Integration with GitHub

The system integrates with GitHub through the GitHub CLI (`gh`) and requires the following permissions:

- Read access to issues
- Write access to apply labels
- Write access to comment on issues

## Reports and Metrics

The system generates a comprehensive triage report including:

- Total issues processed
- Categorized vs. untriaged issues
- Duplicates identified
- Stale issues detected
- Category and priority breakdowns

## Maintaining the System

### Adding New Categories

To add new categories, update the `categories` object in `scripts/issue-triage.js` with new category names and associated keywords.

### Adjusting Similarity Threshold

The duplicate detection similarity threshold can be adjusted in the `identifyDuplicates` function.

### Customizing Priority Logic

Priority assignment logic can be customized in the `determinePriority` function.

## Best Practices

- Regularly review the triage results to ensure accuracy
- Update category keywords as the project evolves
- Monitor the system's duplicate detection accuracy
- Review stale issue identification to avoid false positives
- Keep the system updated with project-specific terminology

## Troubleshooting

If the system fails to run:

1. Verify the GitHub token is valid and has appropriate permissions
2. Ensure the GitHub CLI (`gh`) is installed and configured
3. Check that the repository URL is correctly detected
4. Enable DEBUG mode to see detailed error messages

Example:

```bash
DEBUG=1 npm run triage-issues
```
