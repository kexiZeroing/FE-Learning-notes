## Concepts not clear

### git reset
You’ve made some commits locally (not yet pushed), but everything is terrible, you want to undo last commits like they never happened.

`--soft`, does not touch the index file or the working tree at all (but resets the head). This leaves all your changed files "Changes to be committed", as git status would put it.

`--mixed`, resets the index but not the working tree. The commits are gone, but the contents are still on disk. This is the default action.

`--hard`, resets the index and working tree. Any changes to tracked files in the working tree are discarded.

### git merge
The `--no-ff` flag prevents `git merge` from executing a "fast-forward" if it detects that your current `HEAD` is an ancestor of the commit you're trying to merge. A fast-forward is when, instead of constructing a merge commit, git just moves your branch pointer to point at the incoming commit. This commonly occurs when doing a `git pull` without any local changes.

- `--ff`, when possible resolve the merge as a fast-forward (only update the branch pointer to match the merged branch; do not create a merge commit). When not possible (when the merged-in history is not a descendant of the current history), create a merge commit.

- `--no-ff`, create a merge commit in all cases, even when the merge could instead be resolved as a fast-forward.

- `--ff-only`, resolve the merge as a fast-forward when possible. When not possible, refuse to merge and exit with a non-zero status. (Unix systems have a convention that an exit status of 0 denotes success, and any non-zero exit status denotes failure)

### git pull --rebase vs. --merge
- If you pull remote changes with the flag `--rebase`, then your local changes are reapplied on top of the remote changes.

- If you pull remote changes with the flag `--merge`, which is also the default, then your local changes are merged with the remote changes. This results in a merge commit that points to the latest local commit and the latest remote commit.

### undo a git merge with conflicts
- Since your pull was unsuccessful then HEAD is the last "valid" commit on your branch: `git reset --hard HEAD`

- `git reset --merge` attempts to reset the working copy to whatever the state it was before the merge. It means that it should restore any uncommitted changes before the merge.

- Generally you shouldn't merge with uncommitted changes. If you have changes you don't want to commit before starting a merge, just `git stash` them before the merge and `git stash pop` after finishing the merge.

### git log and git reflog
- `git log` shows the current HEAD and its ancestry. That is, it prints the commit HEAD points to, then its parent, its parent, and so on. It traverses back through the repo's ancestry by recursively looking up each commit's parent. (often use `git log --pretty=oneline`)

- `git reflog` doesn't traverse HEAD's ancestry. The reflog is an ordered list of the commits that HEAD has pointed to: **it's the undo history for your repo**. The reflog isn't part of the repo itself (it's stored separately to the commits themselves) and isn't included in pushes, fetches or clones; it's purely local. If you accidentally reset to an older commit, or rebase wrongly, or any other operation that visually "removes" commits, you can use the reflog to see where you were before and `git reset --hard` back to that ref to restore your previous state.

### Rewrite History: squash commit, fixup and autosquash
- https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History
- https://fle.github.io/git-tip-keep-your-branch-clean-with-fixup-and-autosquash.html

### git restore and git switch
`git checkout` is one of the many reasons why newcomers find git confusing, and that is because its effect is context-dependent. In version 2.23 of git, two new commands have been introduced to split the old `git checkout` in two.

`git restore` implements the behavior of `git checkout` when running it against a file, `git restore -- test.txt`. 

`git switch` implements the behavior of `git checkout` when running it only against a branch name, so you can use it to switch between branches: `git switch develop`. While with `git checkout` you can switch to a commit and transition into a detached HEAD state, by default `git switch` does not allow that. You need to provide the `-d` flag: `git switch -d commit_id`. Another difference is that with `git checkout` you can create and switch to the new branch using the `-b` flag. You can do the same with the new one, but the flag is `-c`: `git switch -c new_branch`.
