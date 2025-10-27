# Git Merge Workflow Scripts

This directory contains Windows batch files to help manage the shared workflow between you and Claude Code.

## 📁 Available Scripts

### 1. `merge-to-main.bat` ⭐ **RECOMMENDED**
**Simple, safe merge workflow with error handling**

**What it does:**
1. Fetches latest changes from remote
2. Pulls from Claude's branch (`claude/swf-011CUXJPdZbEdDyjL5FcyUBX`)
3. Switches to main branch
4. Pulls latest main
5. Merges Claude's branch into main
6. Pushes to remote main

**When to use:** When you want to merge Claude's work into main with safety checks

**How to run:**
```cmd
merge-to-main.bat
```

---

### 2. `merge-to-main-advanced.bat` 🛡️ **SAFEST**
**Advanced version with comprehensive checks and conflict resolution**

**Extra features:**
- ✅ Checks for uncommitted changes before starting
- ✅ Verifies Claude branch exists
- ✅ Detailed step-by-step progress
- ✅ Conflict resolution guidance
- ✅ Merge abort option
- ✅ Option to switch back to Claude branch after merge
- ✅ Comprehensive error messages

**When to use:** When you want maximum safety and detailed feedback

**How to run:**
```cmd
merge-to-main-advanced.bat
```

---

### 3. `quick-merge.bat` ⚡ **FASTEST**
**One-liner merge with no prompts**

**What it does:** Everything in one command, no pauses or prompts

**When to use:** When you're confident everything is ready and want speed

**How to run:**
```cmd
quick-merge.bat
```

---

### 4. `check-status.bat` 🔍 **DIAGNOSTIC**
**Check repository status and branch differences**

**What it shows:**
- Current branch
- Uncommitted changes
- Latest commits
- Differences between Claude branch and main
- Files changed
- Remote branch status

**When to use:** Before merging, to see what changes will be merged

**How to run:**
```cmd
check-status.bat
```

---

### 5. `rollback-merge.bat` ⚠️ **EMERGENCY ONLY**
**Undo the last merge on main (DANGEROUS)**

**What it does:**
- Resets main branch to before last merge
- Option to force push to remote

**When to use:** ONLY if you need to undo a merge that went wrong

**⚠️ WARNING:** This is destructive! Use with caution!

**How to run:**
```cmd
rollback-merge.bat
```

---

## 🔄 Typical Workflow

### Scenario 1: Regular Merge (Recommended)
```cmd
1. check-status.bat          (See what will be merged)
2. merge-to-main.bat         (Perform the merge)
```

### Scenario 2: First Time / Want Extra Safety
```cmd
1. check-status.bat          (Review changes)
2. merge-to-main-advanced.bat (Merge with full safety checks)
```

### Scenario 3: Quick Merge (Experienced Users)
```cmd
quick-merge.bat              (One command, done)
```

### Scenario 4: Something Went Wrong
```cmd
rollback-merge.bat           (Undo the merge)
```

---

## 🚨 Handling Merge Conflicts

If you encounter merge conflicts, the advanced script will:

1. **Detect the conflict** and show conflicted files
2. **Give you options:**
   - Abort the merge (safe)
   - Continue to resolve manually

### Manual Resolution Steps:
```cmd
# 1. Open conflicted files in your editor
# Look for these markers:
<<<<<<< HEAD
your changes
=======
Claude's changes
>>>>>>> claude/swf-011CUXJPdZbEdDyjL5FcyUBX

# 2. Edit the file to keep the changes you want
# Remove the conflict markers

# 3. Stage the resolved files
git add <filename>

# 4. Complete the merge
git commit

# 5. Push to remote
git push origin main
```

---

## 📋 Branch Names

Current configuration:
- **Claude Branch:** `claude/swf-011CUXJPdZbEdDyjL5FcyUBX`
- **Main Branch:** `main`
- **Remote:** `origin`

If branch names change in the future, edit the scripts and update these variables:
```batch
set CLAUDE_BRANCH=claude/swf-011CUXJPdZbEdDyjL5FcyUBX
set MAIN_BRANCH=main
set REMOTE=origin
```

---

## ✅ Pre-Merge Checklist

Before running merge scripts:

1. ✅ All your local changes are committed
2. ✅ You've reviewed Claude's changes (run `check-status.bat`)
3. ✅ Backend and frontend tests pass (if applicable)
4. ✅ You have network connection
5. ✅ You're ready to update main branch

---

## 🐛 Common Issues

### Issue: "Not a git repository"
**Solution:** Run the script from the `gas_app` directory

### Issue: "Failed to fetch from remote"
**Solution:** Check your internet connection and GitHub access

### Issue: "Branch does not exist"
**Solution:** Claude hasn't pushed yet, or branch name is different

### Issue: "Merge conflict detected"
**Solution:**
1. Use advanced script for guidance
2. Resolve conflicts manually
3. Or abort and ask Claude to resolve

### Issue: "Permission denied (push)"
**Solution:** Check your GitHub credentials and repository access

---

## 📞 Need Help?

If something goes wrong:
1. Run `check-status.bat` to see current state
2. Don't panic - Git can undo most things
3. If unsure, don't run `rollback-merge.bat`
4. Ask Claude Code for help!

---

## 🔒 Safety Features

All scripts include:
- ✅ Error detection at each step
- ✅ Pause on errors (won't continue if something fails)
- ✅ Clear error messages
- ✅ Confirmation prompts for dangerous operations
- ✅ No automatic force pushes (except rollback)

---

## 💡 Tips

1. **Always check status first** - Run `check-status.bat` before merging
2. **Use advanced for important merges** - Extra safety is worth it
3. **Keep backups** - Push your work before merging
4. **Read the output** - Scripts tell you what's happening
5. **Don't force push main** - Unless you really know what you're doing

---

Generated for Gas App Shared Workflow
Last Updated: 2025-10-27
