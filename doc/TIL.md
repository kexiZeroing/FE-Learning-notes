1. major, minor, and patch version: `^` instructs npm to install the newest version of the package with the same major version; Use `~` to have both the major and minor version match.
2. `__dirname` and `__filename`: running `node example.js` from `/Users/mjr`, **__dirname** is `/Users/mjr` and **__filename** is `/Users/mjr/example.js`
3. Passing arguments to other npm commands, we can leverage the `--` separator. e.g. `"pass-flags-to-other-script": "npm run my-script -- --watch"` will pass the `--watch` flag to the `my-script` command.
4. Quickly browse the history of a file in the repo: Go to a file in GitHub, replace `github.com` with `github.githistory.xyz` (i.e. https://github.githistory.xyz/kexiZeroing/FE-Learning-notes/blob/master/README.md)
5. `Cmd + Shift + .` toggles hidden files in Mac.
6. Open VS Code in terminal: `Cmd + Shift + p` -> type **Shell Command: Install 'code' command in PATH** -> restart the terminal for the new `$PATH` value to take effect, and type `code .` to open VS Code. (`open .` to open the Finder)
7. Drag the file tab from VS Code into the terminal to get the absolute path for that file.
8. Browser notepad: `data:text/html,<html contenteditable>`
9. Ever struggled with some forgotten processes taking over a port you're trying to use? Just run `npx kill-port [port-number]`
10. Type `printenv` in the terminal to list all the default environment variables.
11. Install tldr pages `npm install -g tldr` which simplify the `man pages` with practical examples, e.g. try to run `tldr tar` or `tldr git branch`.
12. Short link `react.new`, `vue.new`, `ng.new`, `js.new`, `csb.new` to create a new codeSandbox project.
13. Use `if (typeof window === 'undefined')` to execute code only in the server-side. We can’t do it using `if (window === undefined)` because we’d get a “window is not defined” runtime error.
14. `du` command is used to display disk usage statistics. It calculate and print the disk space used by files or directories. `du -ah` (`-a` means display an entry for each file; `-h` for human-readable output).