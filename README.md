# FE-Learning-notes

- `doc/FE_basic_notes` 是很早期学习前端，为面试做准备时的笔记。从本地放到 Github 上保存，便于留存和日后可能更新。当前就是 txt 文件，无格式，非常原始，可以在 sublime/vs code 打开查看，后期会调整为 md 格式，便于阅读

- `demo/*.html` 文件为一些前端常用概念的使用或者基本组件的封装，均为原生 JS，和现代框架完全无关，仅用于学习

- `doc/start.md` 开始一个现代 JS 项目的流程

---

## Tips

- Quickly browse the history of a file in the repo: Go to a file in GitHub, replace `github.com` with `github.githistory.xyz` (i.e. https://github.githistory.xyz/kexiZeroing/FE-Learning-notes/blob/master/README.md)
- `Cmd + Shift + .` toggles hidden files in Mac
- Open VS Code in terminal: `Cmd + Shift + p` -> type **Shell Command: Install 'code' command in PATH** -> restart the terminal for the new `$PATH` value to take effect
- Drag the file tab from VS Code straight into the terminal to get the absolute path for that file
- `git log --pretty=format:"%h %ad%x09%an%x09%s" --date=short` (%h = commit hash, %x09 = tab, %an = author name, %ad = author date, %s = subject)
- Browser notepad: `data:text/html,<html contenteditable>`
- Ever struggled with some forgotten processes taking over a port you're trying to use? Just run `npx kill-port [port-number]`
- Type `printenv` in the terminal to list all the default environment variables.
- Learn a command quickly https://tldr.sh and can install it from `npm install -g tldr`