## Customizing Zsh Prompt

It's not cool if you don’t display some Git status information in your prompt. First, add these two lines to your `~/.zshrc` file:

```zsh
autoload -Uz vcs_info
precmd() { vcs_info }
```

Zsh ships with a framework for getting information from version control systems, called `vcs_info`. It populates a variable for you. This variable can then be used inside your prompt to print information.

Next, you want to add the Git branch details into your prompt.

```zsh
zstyle ':vcs_info:git:*' formats '%b '
```

That `%b` is the branch name variable. You can add other variables in the string there, for example information about stashes, the name of the root directory of the repo, staged changes, etc.

- `%s` current version control system, like git or svn
- `%r` the name of the root directory of the repository
- `%S` the current path relative to the repository root directory
- `%u` unstaged changes in the repository
- `%c` staged changes in the repository

Now, you'll add these final two lines to put your prompt together.

```zsh
setopt PROMPT_SUBST
PROMPT='%F{green}%*%f %F{blue}%~%f %F{red}${vcs_info_msg_0_}%f$ '
```

Let's break it down.

### Colors
When you surround things in `%F` and `%f`, that changes the foreground color of anything in between them. The color in the `{curly braces}` is the color that's edited. There's similar things like this with `%U` and `%u` to underline, `%K` and `%k` for background colors. Zsh understands the colors black, red, green, yellow, blue, magenta, cyan and white by default.

### Dates and times
The `%*` that you see is the time (in 24-hour format, with seconds). There's more options for this, like `%W` for the date in `mm/dd/yy` format, `%D` for the date in `yy-mm-dd` format, for example.

### The directory
The `%~` shows the current working directory, and its path.

### The variable
Load in the variable `${vcs_info_msg_0_}`, which puts your branch variable that we made before in that red text wrapper.

The final `$` at the end is just to lead the user input. You can replace it with `>` or `;`, or whatever you'd like.


Here is the whole prompt that you can paste in and customize:

```zsh
autoload -Uz vcs_info
precmd() { vcs_info }

zstyle ':vcs_info:git:*' formats '%b '

setopt PROMPT_SUBST
PROMPT='%F{green}%*%f %F{blue}%~%f %F{red}${vcs_info_msg_0_}%f$ '
```

Once you've saved this, run `source ~/.zshrc` to load it in the terminal (or just restart your terminal/open a new tab).
