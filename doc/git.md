## Concepts not clear

### git merge --no-ff
The `--no-ff` flag prevents `git merge` from executing a "fast-forward" if it detects that your current `HEAD` is an ancestor of the commit you're trying to merge. A fast-forward is when, instead of constructing a merge commit, git just moves your branch pointer to point at the incoming commit. This commonly occurs when doing a `git pull` without any local changes.

- `--ff`, when possible resolve the merge as a fast-forward (only update the branch pointer to match the merged branch; do not create a merge commit). When not possible (when the merged-in history is not a descendant of the current history), create a merge commit.

- `--no-ff`, create a merge commit in all cases, even when the merge could instead be resolved as a fast-forward.

- `--ff-only`, resolve the merge as a fast-forward when possible. When not possible, refuse to merge and exit with a non-zero status. (Unix systems have a convention that an exit status of 0 denotes success, and any non-zero exit status denotes failure)

### git pull --rebase vs. --merge
- If you pull remote changes with the flag `--rebase`, then your local changes are reapplied on top of the remote changes.

- If you pull remote changes with the flag `--merge`, which is also the default, then your local changes are merged with the remote changes. This results in a merge commit that points to the latest local commit and the latest remote commit.

### Rewrite History: squash commit, fixup and autosquash
- https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History
- https://fle.github.io/git-tip-keep-your-branch-clean-with-fixup-and-autosquash.html