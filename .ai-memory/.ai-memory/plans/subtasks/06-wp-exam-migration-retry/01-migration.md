# Subtask 1: Migration

## Goal
Delete old folders in wp-exam and copy new folders from coding-guidelines.

## Instructions
Run the following PowerShell commands:
1. `Remove-Item -Recurse -Force D:\work\wp-exam\.lovable, D:\work\wp-exam\spec, D:\work\wp-exam\AGENTS.md -ErrorAction SilentlyContinue`
2. `Copy-Item -Recurse -Force D:\work\coding-guidelines\02-spec D:\work\wp-exam\02-spec`
3. `Copy-Item -Recurse -Force D:\work\coding-guidelines\.ai-memory D:\work\wp-exam\.ai-memory`
4. `Copy-Item -Recurse -Force D:\work\coding-guidelines\01-prompts D:\work\wp-exam\01-prompts`
5. `Copy-Item -Recurse -Force D:\work\coding-guidelines\03-ai-scripts D:\work\wp-exam\03-ai-scripts`
6. `Copy-Item -Force D:\work\coding-guidelines\agents.md D:\work\wp-exam\agents.md`
