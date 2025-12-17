# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2025-12-17

### 🔒 Security Fix

**Problem:** API credentials exposed in git repository
**Solution:** Removed .mcp.json from tracking, created template file
**Files Modified:** .gitignore, .mcp.json.example, CHANGELOG.md
**Impact:** Credentials now properly secured, users must create their own .mcp.json

**IMPORTANT:** If you cloned this repository, rotate your n8n API key immediately at your n8n instance settings.

## [1.0.0] - 2025-12-16

### 🚀 Initial Release

**Problem:** No integrated n8n-mcp solution for Claude Code CLI
**Solution:** Created wrapper project with optimized configuration
**Files Modified:** All project files
**Impact:** 543+ n8n nodes accessible via 20 MCP tools

### Features
- n8n-mcp v2.30.0 integration
- 20 MCP tools for workflow management (documentation, CRUD, execution, version control)
- Complete documentation (README.md, FEATURES.md, CLAUDE.md)
- Optimized environment configuration
- Safety guidelines and best practices
- 2,709+ workflow templates accessible
- 99% node property coverage
