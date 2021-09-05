## Terminal Primer
Date back to the days when computing started with big mainframe computers, many users had to share access. They did this by typing and reading on a 'terminal' or 'console' — a dedicated device talking to the mainframe. Terminals used mechanical printers or typewriters to show the results, these were called teletypewriters or tty. The protocol that the mainframe used to communicate with the typewriters was named `tty` as well. The protocol and its name have remained, long after the mechanical typewriters are gone. A `tty` is a particular kind of device file that represents a terminal. In its most common meaning, terminal is synonymous with `tty`. `ttys001` it's essentially "terminal input device #1".

The Terminal application on macOS is a virtual terminal program to run a shell, either locally or to connect to servers. The terminal only provides a means to enter and display text. It will display a 'prompt' which tells the user, that the system is ready and the user can enter a command.

A shell protects the user from the dangerous, complicated parts of the system and abstracts differences from one system to the other. Another way of looking at it, is that a shell protects the vulnerable, fragile parts of the system from the user. Technically, GUI which display files, folders and programs as icons in windows such as macOS, Windows, and even iOS and Android are also shells, since they shield the system internals from the user and vice versa. However, usually the term 'shell' is used for interfaces where the user has to type commands, or CLI. Command Line shells commonly have two major roles. The first is to interpret and execute commands entered in an interactive prompt and deliver the results back to the user. The second role is to interpret and process list of commands called scripts.

Many Unix and Unix-like systems have `sh` as well as bash and other shells available. `sh` goes back to the very early UNIX shells. `sh` has survived because it serves as the lowest common standard for shell scripting. These standards are defined in the POSIX specification. When you have to build scripts that need to run across many different flavors and versions of Unix where you cannot rely on bash being present, then conforming to `sh` might be necessary. (bash is also POSIX compliant, but it has more features). As a macOS administrator you should always choose `/bin/bash` over `/bin/sh`. You can check all the available shells in macOS `cat /etc/shells`, show the current shell being used `echo $SHELL`, and use `chsh -s /bin/zsh` to change the current interactive shell.

## Finding Commands
All commands are files in the file system. They have a special file setting which makes them executable, so the system can interpret it as commands. If you want to know where a given command resides, you can use the `which` command. When you enter a command without a path such as `ls`, bash will start looking for the command executable in `/usr/local/bin`, then in `/usr/bin`, and then in `/bin` (defined in `PATH`). When it finds an executable `ls`, stop looking and execute that.

## Terminal–Finder Interaction
The CLI and the UI are not entirely separate areas in macOS, there is a lot of overlap and there are functions in Finder and Terminal that allow for quick interaction between them.

If you drag any folder from Finder to the Terminal application icon in the dock, Terminal will open a new window and change the working directory to the folder you dragged. When you drag any file into an open Terminal window, it will insert the full path to that file with spaces and other special characters properly escaped. If you prefer, you can get the same effect with copy and paste.

In Terminal if you type `open .`, it will open the current working directory in a Finder. The `open` command can do much more. In general you can think of `open` as the command line equivalent of double-clicking a file or folder in Finder. `open document.pdf` will open the PDF with the default application usually Preview. `open https://google.com` will open the default browser, but you can use the `-a` option to override the default application `open -a Firefox https://google.com`.

## Hidden Files
In UNIX, files or directories with a name beginning with `.` are considered hidden and will not be shown in a normal file list with `ls`. However you can list them with the option `ls -a`. Usually dot files are configuration files or folders. macOS Sierra added a Finder keyboard shortcut to quickly show hidden files using `Command + Shift + .`, which will quickly show all hidden files and a second time will re-hide them.

## Deleting Files
In the Finder, deleted files are moved to the Trash, which is actually the invisible directory `~/.Trash`. There the file will remain until the user chooses 'Empty Trash'. Only then is the file removed from disk. The command line has no such safety net. When you delete a file with the `rm` command it is gone. You can add the `-i` option to the `rm` command which will ask for confirmation before actually deleting it. There is a command `rmdir` which is the destructive equivalent of `mkdir`. However, `rmdir` can only remove empty directories.

## The Clipboard
There are two commands specific to macOS that connect the clipboard closer to the shell commands. `pbcopy` will take the contents of `stdin` and put them in the clipboard. So anything you pipe into `pbcopy` will end up in the clipboard, so you can paste it into a different place. For example, `cat test.txt | pbcopy` is easier than open, select all, and copy. `pbpaste` is the counterpart to `pbcopy`. You can easily make the clipboard contents visible by typing `pbpaste` as the next command.

## The '[' Marks
Using Terminal you may notice that there is a small gray square brackets before the prompt. They are called 'Marks' and every command that is executed automatically gets marked. You can quickly scroll the Terminal output to previous marks with `Cmd + Up Arrow` and to the next mark with `Cmd + Down Arrow`. You can hide them with 'Hide Marks' from the 'View' menu.

## Navigating the Terminal Prompt
Instead of hitting the up arrow several times, you can also use `Ctrl + R` and start typing a command you used before. This will search through the history backwards and recall the latest command you used starting with what you typed. By typing `sudo !!`, the shell will substitute the `!!` with the previous command, print the entire command after the substitution and immediately execute it with `sudo`.

Once you have recalled a command and want to edit it, you will have to move the cursor. You can use `Option + Left/Right Arrow` to move word by word. You can use `Ctrl + A` to jump to the beginning of the line and `Ctrl + E` to jump to the end. `Ctrl + U` will clear the entire current line. And you can option-click with the mouse pointer on a character in the command line to move the cursor there.

The configuration for the prompt is stored in the `PS1` environment variable. You can see the default value by `echo $PS1`.

## Escaping Characters
The escape character in bash is the backslash `\`. A character that follows a backslash will be treated with no special meaning. For a directory named `Project (Old & New)`, you would type `cd Project\ \(Old\ \&\ New\)`. Since escaping characters can make the path quite unreadable, you can also place the name in single quotes `cd 'Project (Old & New)'`. Any character in single quotes is used as is, with no special function. (you cannot use single quotes when the filename contains a single quote). Tab-completion will escape spaces and other nasty characters automatically.

## Making tab-completion case-insensitive
The problem is that the file system of macOS is "case preserving, but case-insensitive". That means the file system will remember wether you named a file `README.TXT`, `ReadMe.txt` or `readme.TXT` and preserve that case, but using either of these will point to the same file. This may be confusing in Terminal. Since most other Unix file system are case-sensitive (i.e. `README.TXT` and `readme.txt` are different files) and most shells are case-sensitive too.

One thing you can change is wether tab-completion is case-sensitive or not. Since the underlying file system is insensitive, there is no reason tab-completion should be. To make tab-completion in bash case-insensitive, put `set completion-ignore-case on` in your `.inputrc` (create if necessary).

## Viewing `man` Pages
`open x-man-page://ls` will open the `man` page in a new yellow Terminal window, so you can still see what you are actually doing while reading the man page. Since this window shows the entire man page, you can scroll and use Command-F in this window. This behavior can also be achieved by right clicking on a word in a Terminal window and choose 'Open man Page' from the context menu.

For the normal `man` page, this special display mode is actually controlled by the command `less`. You can use `/word<return>` to search in document, `n` to find next occurrence of search term, `N` to find previous occurrence of search term.

## bash_profile and bashrc
There are two user level files which `bash` may run when a bash shell starts. `~/.bash_profile` and `~/.bashrc`. The usual convention is that `.bash_profile` will be executed at login shells, i.e. when you ssh into a remote host, it will ask you for user name and password to log in, so it is a login shell. But when you open a terminal, it does not ask for login and you will just get a command prompt. In other versions of Unix or Linux, this will not run the `.bash_profile` but `.bashrc`. The underlying idea is that the `.bash_profile` should be run only when you login, and the `.bashrc` for every new interactive shell. However, Terminal on macOS does not follow this convention. When Terminal opens a new window, it will run `.bash_profile`. (Other third-party terminal applications on macOS may follow the precedent set by the Terminal or not.)

- When you are living mostly on macOS and the Terminal, you can create a `.bash_profile`, ignore all the special cases and be happy.
- If you want to have an approach that is more resilient to other terminal applications and might work across Unix/Linux platforms, put your configuration in `.bashrc` and source `.bashrc` from `.bash_profile`.
- Usually the contents of a `.bash_profile` or `.bashrc` will be setting environment variables, aliases, and functions.

There are more files which may be executed when a shell is created. When bash cannot find `~/.bash_profile`, it will look for `~/.bash_login`. When neither `~/.bash_profile` nor `~/.bash_login` exist, then `~/.profile`. If `~/.bash_profile` is present, the succeeding files will be ignored though you can source them in the `.bash_profile`.

## Environment Variables
The `PATH` environment variable contains a list of directories that bash will search through for commands. `echo $PATH` will show the current `PATH` variable. If you want to know which command is actually executed, you can use the `which` command to get the effective path like `which python` or `which bash`. You can add your own directories by either appending (safe) or prepending (risky) your own directories to the `PATH` variable such as `export PATH=$PATH:~/bin`. Since bash stops looking when it finds a match, the order of the directories in the `PATH` is important. When you place your directories before the default directories you can override some of the system commands. This can be dangerous. You should add your directory to the end of the `PATH` to be safe.

## Changing the Editor
Some terminal commands will open a text editor directly. For example `git` may open a text editor so you can enter a commit message. By default the system will open `vi` but you can change the editor that will be used. The environment variable for this behavior is `EDITOR`. So you can set the editor using `export EDITOR=vim` or `export EDITOR=nano` or `export EDITOR=emacs`. (The `export` command tells bash it should export this variable to child processes.)

You can also tell bash to color for some commands such as `ls`. To do that you just need to set `export CLICOLOR=1` and use `unset CLICOLOR` to remove that variable.

## Configuring aliases
Bash aliases are basically text substitutions. For example a common alias is to define `alias ll="ls -l"`, but this definition will only exist for that particular shell. If you want an alias to exist in all your shells, you need to add them to your `.bash_profile` or `.bashrc`. Whenever you modify the `.bash_profile`, it will not automatically be loaded into the shell that is already open, you either have to close the Terminal and open a new one or run `source ~/.bash_profile`. Note the lack of spaces around the `=` as usual when assigning values in bash. Some users like to alias the potentially dangerous commands such as `rm` or `mv` with the `-i` option, which forces the user to confirm when a file is going to be deleted or overwritten `alias rm="rm -i"`.

You can list all the defined aliases by running `alias` command without any arguments, and you can unset or delete an alias with the `unalias` command like `unalias ll`.

## The Shebang
Every script you want to run from the command line should have a shebang as the first line. A shebang looks like this `#!/bin/bash`. Files are usually identified by certain codes (i.e. magic numbers) in the first few bytes of data. The hex code `23 21` converts to the ascii characters `#!` and tells the system that a file is script. After the shebang comes the command that should interpret the script. Generally, any command that can interpret text files can be used. Since the value of the `PATH` variable is not guaranteed in many contexts that scripts run in, the path needs to be absolute.

There are environments where you cannot predict the absolute path of a given tool. For example the bash v3.2 shell on macOS is installed by default in `/bin/bash`. Users can also download and install bash version 4.4 onto their computers. The location for the the bash 4 is usually at `/usr/local/bin/bash`. Since `/usr/local/bin` is the first item of the default `PATH` on macOS, the newer bash 4 will be chosen before the built-in bash 3.2 when the user types bash into their shell. When you use the absoute path to `/bin/bash` in a shebang, you are ensuring that the provided built-in version of bash will be used. However, there are cases where you want scripts to be run with the user’s preferred tool, rather than a set path. In this case you can use `#!/usr/bin/env bash`, which will determine the preferred bash tool in the user’s environment and use that to interpret the script.

## sh and source
When you call `sh`, you initiate a fork (sub-process) that runs a new session of `/bin/sh`, which is usually a symbolic link to bash. If you launch it using `./test.sh`, the first line `#!/bin/sh` would be detected, then it would be exactly the same as `/bin/sh ./test.sh`. (`chmod +x test.sh` to make the script executable). It executes shell scripts in a new shell process, so any variables which are assigned will disappear after the script is done. `. test.sh` or `source test.sh` will run the commands in the current shell (source is a synonym for dot).

## Moving to zsh
From macOS Catalina the default shell is zsh. The bash bundled with macOS has been stuck on version 3.2 for a long time now. bash v4 was released in 2009 and bash v5 in January 2019. The reason Apple has not switched to these newer versions is that they are licensed with `GPL v3`. bash v3 is still `GPL v2`. zsh, on the other hand, has an MIT-like license, which makes it much more palatable for Apple to include in the system by default.

Users that have `/bin/bash` as their default shell on Catalina will see a prompt at the start of each Terminal session stating that zsh is now the recommended default shell. If you want to continue using `/bin/bash`, you can supress this message by setting `export BASH_SILENCE_DEPRECATION_WARNING=1`. You can also download and install a newer version of bash yourself. (Custom bash installations reside in a different directory usually `/usr/local/bin/bash`)

The first change you will see in zsh is that the prompt looks different. zsh uses the `%` character as the default prompt (of course you can change that). zsh derives from the Bourne family of shells. Because of this common ancestry, it behaves very similar in day-to-day use. There is an entire eco-system of configuration tools and themes called `oh-my-zsh` which is very popular.

## Hard Links and Symbolic Links
Underneath the file system, files are represented by inodes. A file in the file system is basically a link to an inode. When you delete a file, it removes the link to the underlying inode. The inode is only deleted when all links to the inode have been deleted. A hard link (`ln <source> <target>`) creates another file with a link to the same underlying inode. If the real copy is deleted, the link still works because it accesses the underlying data which the real copy was accessing.

Symbolic links (i.e. `etc -> private/etc`) are links to another name in the file system like shortcuts in Windows. `/etc`, `/tmp` and `/var` are standard directories in Unix systems, but in this case these directories are actually located in `/private`. You can use `readlink` command to determine where a symbolic links points to. Most operations such as reading or changing are directed to the original, rather than the symbolic link. To create a symbolic link use the `ln -s <source> <target>` command. The first argument is the path the symbolic link points to. If a symbolic link is deleted, its target remains unaffected. If the target is moved, renamed or deleted, the symbolic link is not automatically updated or deleted, but continues to points to the old target, a non-existing location (the link will not work).

In macOS Finder, you can create aliases with the menu item 'Make Alias' from the context menu. Finder Aliases have much the same role as symbolic links, but when the original is deleted and replaced by an item of the same name, a Finder Alias will resolve to the new item. Finder will display Aliases and symbolic links with a small arrow in the corner of the icon. Both symbolic links and Finder Aliases have a 'Show Original' menu item in the context menu.

## The `sudo` Command
Users and their access privileges control what user can read, write, or change in the system. When managing the users and their access privileges, there had to be a 'super user' which has access to anything. In Unix and Unix-like systems this user account is traditionally called `root`.

The recommended way of gaining super user privileges from the command line is the `sudo` command. The name means 'super user do' and will perform the command with `root` privileges after verifying the user has the permission to do so. The system will prompt for your password when executing a command with `sudo`. However, there is a 5 minute grace period where the sudo system caches your credentials and you do not have to re-enter the password. The Terminal prompt is set up to `#` when you are running with super user privileges. To leave the `root` shell, just type exit.

There is a different command which allows you to change the user: `su` (short for 'switch user'). `su` will ask for credentials of the user you are switching to. So if you run `su bob`, you need to have Bob’s credentials. When you run `su` without a username, it assumes `root`. But since logging in as `root` is disabled by default on macOS, it will fail, but you can use `sudo -s` or `sudo -i` instead. When you run `sudo -s` it will invoke a new shell running as `root`. The shell that is run is the default shell of your account, and it doesn't change the working directory. Alternatively you can use `sudo -i` to invoke a `root` shell. The working directory becomes `/var/root`, and the shell will be `/bin/sh` on macOS. It will be set up as if the `root` user were logging in and will read `root`'s profile.
