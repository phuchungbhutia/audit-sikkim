
# 🛠️ AuditSikkim Portal — Deployment & Pipeline Troubleshooting Guide

This document records the exact failure points, underlying causes, and validated fixes encountered while setting up the **Sikkim ULB Audit Assessment & Certification Terminal** (`audit-sikkim`) using Hugo, Dexie.js (IndexedDB), and GitHub Actions on Windows.

---

## Table of Contents

- [🛠️ AuditSikkim Portal — Deployment \& Pipeline Troubleshooting Guide](#️-auditsikkim-portal--deployment--pipeline-troubleshooting-guide)
  - [Table of Contents](#table-of-contents)
  - [Error 1: Module / Theme Not Found (`themes/m10c`)](#error-1-module--theme-not-found-themesm10c)
    - [Symptom](#symptom)
  - [Error 2: Hugo 404 Page Not Found on Local](#error-2-hugo-404-page-not-found-on-local)
  - [Error 3: Windows CMD vs PowerShell Syntax](#error-3-windows-cmd-vs-powershell-syntax)
  - [Error 4: Git Push Rejections (non-fast-forward / Remote Work Exists)SymptomPlaintext! \[rejected\]        main -\> main (non-fast-forward)](#error-4-git-push-rejections-non-fast-forward--remote-work-existssymptomplaintext-rejected--------main---main-non-fast-forward)
  - [Error 5: Stuck Git Rebase State (rebase-merge Lock)SymptomPlaintextfatal: It seems that there is already a rebase-merge directory, and](#error-5-stuck-git-rebase-state-rebase-merge-locksymptomplaintextfatal-it-seems-that-there-is-already-a-rebase-merge-directory-and)
  - [Error 6: GitHub Actions Checkout Submodule Failure (Exit Code 128)SymptomPlaintextFetching submodules](#error-6-github-actions-checkout-submodule-failure-exit-code-128symptomplaintextfetching-submodules)
  - [Error 7: TOML Parser Failure — Invalid Character at Start of Key: ï (BOM Issue)SymptomPlaintextRun hugo --minify --baseURL "https://phuchungbhutia.github.io/audit-sikkim/"](#error-7-toml-parser-failure--invalid-character-at-start-of-key-ï-bom-issuesymptomplaintextrun-hugo---minify---baseurl-httpsphuchungbhutiagithubioaudit-sikkim)

---

## Error 1: Module / Theme Not Found (`themes/m10c`)

### Symptom

```text
ERROR command error: failed to load modules: module "m10c" not found in "D:\audit-sikkim-portal\themes\m10c";
either add it as a Hugo Module or store it in "D:\audit-sikkim-portal\themes".: module does not exist
Root Causeconfig.toml declared theme = "m10c", but the directory themes/m10c was either empty or missing.The initial clone URL https://github.com/vaga/m10c.git failed because the canonical repository name is https://github.com/vaga/hugo-theme-m10c.git.Because the terminal portal uses its own standalone custom layouts (layouts/_default/baseof.html and layouts/_default/terminal-generator.html), an external theme is unnecessary.Permanent SolutionRemove the theme directive entirely from config.toml and supply the minimal base layouts directly:PowerShell(Get-Content config.toml) | Where-Object { $_ -notmatch '^theme\s*=' } | Set-Content config.toml
```

## Error 2: Hugo 404 Page Not Found on Local 
```
ServerSymptomAccessing http://localhost:1313/generator/ returns a 404 page not found error.Root Causeconfig.toml defines baseURL = "https://phuchungbhutia.github.io/audit-sikkim/". By default, Hugo serves local pages under that exact subpath (http://localhost:1313/audit-sikkim/generator/), not the root.Missing layout lookup targets: content/generator.md could not find an matching baseof.html or terminal-generator.html inside layouts/_default/.Permanent SolutionEnsure layouts/_default/baseof.html and layouts/_default/terminal-generator.html exist.Run Hugo with the base URL flag forced to / for local development:PowerShellhugo server -D -b "/"
```

## Error 3: Windows CMD vs PowerShell Syntax 
```
ErrorsSymptomPlaintext:: : The term '::' is not recognized as the name of a cmdlet...
At line:1 char:60
+ :: 3. Stage all modified and newly created files...
Missing argument in parameter list.
Root Cause:: is a comment delimiter in legacy Windows Command Prompt (cmd.exe). In PowerShell, :: is reserved for static class method calls (e.g., [Math]::Round()). Pasting batch comments into PowerShell triggers parser errors.Permanent SolutionAlways use # for comments when operating in PowerShell:PowerShell# Correct PowerShell comment syntax
git status
git add -A
git commit -m "docs: clean commit message"
```

## Error 4: Git Push Rejections (non-fast-forward / Remote Work Exists)SymptomPlaintext! [rejected]        main -> main (non-fast-forward)
```
error: failed to push some refs to '[https://github.com/phuchungbhutia/audit-sikkim.git](https://github.com/phuchungbhutia/audit-sikkim.git)'
hint: Updates were rejected because a pushed branch tip is behind its remote counterpart.
Root CauseThe remote GitHub repository was initialized on GitHub with a default file (e.g., placeholder README, LICENSE, or an automatic starter workflow), resulting in commit history on origin/main that was absent from the local repository.Permanent SolutionWhen setting up a newly built project intended to supersede whatever initial commit was created remotely:PowerShellgit pull --rebase origin main
git push origin main

# OR force-push if replacing initial empty remote placeholders with your complete local code
git push -u origin main --force
```

## Error 5: Stuck Git Rebase State (rebase-merge Lock)SymptomPlaintextfatal: It seems that there is already a rebase-merge directory, and
I wonder if you are in the middle of another rebase.
If that is the case, please try
        git rebase (--continue | --abort | --skip)
If that is not the case, please
        rm -fr ".git/rebase-merge"
Root CauseAn interrupted git pull --rebase left Git's internal state machine locked in .git/rebase-merge, preventing any further pull, checkout, or standard commit commands.Permanent SolutionAbort the rebase operation and clean any orphaned state folder:PowerShellgit rebase --abort
if (Test-Path ".git/rebase-merge") { Remove-Item -Recurse -Force ".git/rebase-merge" }

## Error 6: GitHub Actions Checkout Submodule Failure (Exit Code 128)SymptomPlaintextFetching submodules
  /usr/bin/git submodule sync --recursive
  /usr/bin/git -c protocol.version=2 submodule update --init --force --recursive
  Error: fatal: No url found for submodule path 'themes/m10c' in .gitmodules
  Error: The process '/usr/bin/git' failed with exit code 128
Root CauseAn earlier git submodule add command registered themes/m10c as a gitlink (mode 160000) in the Git commit tree.Even if the local folder was deleted, the Git tree still pointed to the submodule without a valid URL in .gitmodules.The workflow file called actions/checkout@v4 with submodule syncing enabled, causing the runner to fail when locating the submodule source.Permanent SolutionCompletely remove the submodule pointer from git tracking:PowerShellgit rm -rf --cached themes/m10c 2>$null
if (Test-Path ".gitmodules") { git rm -f .gitmodules 2>$null }
git config --remove-section submodule.themes/m10c 2>$null
Update .github/workflows/gh-pages.yml to explicitly bypass submodule recursion:YAML- name: Checkout Repository
  uses: actions/checkout@v4
  with:
    submodules: false
    fetch-depth: 0
Commit and push the clean state:PowerShellgit add -A
git commit -m "fix(ci): purge submodule tracking and disable in actions"
git push origin main

## Error 7: TOML Parser Failure — Invalid Character at Start of Key: ï (BOM Issue)SymptomPlaintextRun hugo --minify --baseURL "[https://phuchungbhutia.github.io/audit-sikkim/](https://phuchungbhutia.github.io/audit-sikkim/)"
Total in 0 ms
Error: failed to load config: ".../config.toml:1:1": unmarshal failed: toml: invalid character at start of key: ï
Error: Process completed with exit code 1.
Root CauseIn Windows PowerShell 5.1, Set-Content and Out-File save text as UTF-8 with BOM (Byte Order Mark) by default. A UTF-8 BOM prepends three hidden bytes (0xEF, 0xBB, 0xBF, which display in non-Unicode terminals as ï»¿) at byte index 1:1. The strict TOML parser used by Hugo rejects these bytes before the first key name.Permanent SolutionRewrite config.toml using .NET's UTF-8 encoding constructor with the BOM flag explicitly disabled ($false):PowerShell$configContent = @"
baseURL = "[https://phuchungbhutia.github.io/audit-sikkim/](https://phuchungbhutia.github.io/audit-sikkim/)"
languageCode = "en-us"
title = "audit-sikkim ~ terminal"

[menu]
  [[menu.main]]
    identifier = "generator"
    name = "terminal-app"
    url = "/generator/"
    weight = 1
  [[menu.main]]
    identifier = "docs"
    name = "cag-framework"
    url = "/"
    weight = 2

[params]
  author = "Internal Audit & Local Fund Audit Division"
  description = "ULB Audit Assessment & Quality Certification Portal"
  menu_item_separator = " - "
"@

[System.IO.File]::WriteAllText(
  "$PWD\config.toml",
  $configContent,
  (New-Object System.Text.UTF8Encoding($false))
)

git add config.toml
git commit -m "fix: write config.toml as clean UTF-8 without BOM"
git push origin main
Quick-Reference Verification ChecklistBefore pushing changes to GitHub, run this 4-point sanity check:StepCheckVerification CommandExpected Output1No Submodule Remnantsgit ls-files -s themes/m10c(Empty output)2No BOM in Config(Get-Content -Encoding Byte -TotalCount 3 config.toml) -join ' 'Must NOT be 239 187 191 (e.g. 98 97 115 for bas...)3Local Hugo Renderhugo server -D -b "/"Renders without template warnings at localhost:1313/generator/4Workflow Submodule FlagSelect-String "submodules: false" .github/workflows/gh-pages.ymlLine exists and matchesCompiled for Directorate of Local Fund Audit (DLFA), Finance Department, Government of Sikkim.
```
