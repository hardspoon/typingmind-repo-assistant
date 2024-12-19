# GitHub Repository Assistant Plugin

A TypingMind plugin that helps answer questions about GitHub repositories and provides insights about their content and structure.

## Overview

This plugin acts as an intelligent assistant for GitHub repositories, helping users understand repositories better by:

- Answering general questions about repositories
- Finding relevant code and documentation
- Providing repository statistics and insights
- Suggesting improvements

## Installation

1. Install the plugin in your TypingMind environment
2. Configure your GitHub Personal Access Token in the plugin settings
3. Start asking questions about repositories

## Usage

You can ask various types of questions about repositories:

1. **General Questions**:
   ```
   What is the owner/repo repository about?
   ```

2. **Technical Questions**:
   ```
   How is feature X implemented in owner/repo?
   Where can I find the main function in owner/repo?
   ```

3. **Statistics Questions**:
   ```
   How many stars does owner/repo have?
   What languages are used in owner/repo?
   ```

## Configuration

The plugin requires a GitHub Personal Access Token with `repo` scope access. You can create one at [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens).

## Features

- Repository overview and description
- Code search and navigation
- Repository statistics
- Language analysis
- Issue tracking
- Improvement suggestions

## Question Types

The plugin can handle different types of questions:

1. **General Questions**
   - Repository purpose and description
   - Project overview
   - Topics and categories

2. **Technical Questions**
   - Code implementation details
   - Function locations
   - File structure
   - Dependencies

3. **Statistics Questions**
   - Star count
   - Fork count
   - Language distribution
   - Issue statistics

## Security

- Your GitHub token is stored securely
- All API requests are made using official GitHub API
- No repository data is stored or cached
- Sensitive information is never exposed

## Limitations

- Only public repositories can be analyzed unless the GitHub token has private repository access
- Some technical questions may require context
- Rate limits apply based on GitHub API restrictions

## Support

For issues or feature requests, please visit the [GitHub repository](https://github.com/hardspoon/typingmind-repo-assistant).
