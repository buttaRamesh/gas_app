@echo off
REM Quick merge - No prompts, assumes everything is ready
git fetch origin && git checkout claude/swf-011CUXJPdZbEdDyjL5FcyUBX && git pull origin claude/swf-011CUXJPdZbEdDyjL5FcyUBX && git checkout main && git pull origin main && git merge claude/swf-011CUXJPdZbEdDyjL5FcyUBX --no-ff -m "Merge claude/swf-011CUXJPdZbEdDyjL5FcyUBX into main" && git push origin main && echo SUCCESS: Merged and pushed to main! || echo ERROR: Something went wrong. Check the output above.
pause
