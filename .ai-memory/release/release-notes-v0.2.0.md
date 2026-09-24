## Quick Install v0.2.0

### Windows (PowerShell)

```powershell
Invoke-WebRequest -Uri https://raw.githubusercontent.com/alimtvnetwork/wp-exam-v2/v0.2.0/install.ps1 -OutFile install.ps1; .\install.ps1 -TargetDir ".ai-memory/prompts" -Version "v0.2.0"
```

### Unix / Linux / macOS (Bash)

```bash
curl -sL https://raw.githubusercontent.com/alimtvnetwork/wp-exam-v2/v0.2.0/install.sh | bash -s -- ".ai-memory/prompts" "v0.2.0"
```

---

## What's Changed in v0.2.0

### Added
- Enterprise Google Forms builder, dynamic theming, and focus quiz editor
