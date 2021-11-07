## Setting up development environment
1. Install the Homebrew package manager, and you can install almost any app from the command line. Make sure everything is up to date `brew update`. (M1 installation at `/opt/homebrew/`, Intel at `/usr/local/Cellar/`)
2. Install VS Code, Chrome, iTerm2, Docker through Homebrew, then you can use `brew list` and `brew info google-chrome` to check.
    ```shell
    # refer to https://formulae.brew.sh
    brew install git yarn make
    brew install --cask visual-studio-code google-chrome iterm2 docker
    ```
3. Catalina comes with `zsh` as the default shell. Install [Oh My Zsh](https://github.com/ohmyzsh/ohmyzsh) anc check the `.zshrc` file.
4. Use `nvm` to install Node.js, then install a version of node `nvm install xx.xx`, `nvm use xx.xx` and run `nvm ls`. Use `node -v && npm -v` to check the version. (`echo $PATH` or `which node`)
5. Set global configuration with Git `touch ~/.gitconfig`, and check with `git config --list`.
    ```
    [user]
      name   = Firstname Lastname
      email  = you@example.com
    [github]
      user   = username
    [alias]
      a      = add
      cm     = commit -m
      s      = status
      pom    = push origin master
      puom   = pull origin master
      co     = checkout
      lg     = log --pretty=format:'%h %ad%x09%an%x09%s' --date=short
    ```
    *(%h = commit hash, %x09 = tab, %an = author name, %ad = author date, %s = subject)*   
6. Some commands for Finder
    ```shell
    # Show Library folder
    chflags nohidden ~/Library

    # Show hidden files
    defaults write com.apple.finder AppleShowAllFiles YES

    # Show path bar
    defaults write com.apple.finder ShowPathbar -bool true

    # Show status bar
    defaults write com.apple.finder ShowStatusBar -bool true
    ```
    
    A curated list of shell commands specific to macOS: https://github.com/herrbischoff/awesome-macos-command-line

7. Install Chrome extension [DevTools Theme: New Moon](https://github.com/taniarascia/new-moon-chrome-devtools), then set devtool's theme to "Dark" and go to Experiments and select "Allow custom UI themes".
8. Add VS code extentions. Install `Prettier`, `GitLens`, `New Moon Theme`. Set `Format On Save` and `Format Document With... (Prettier)` if needed. Add `Emoji Snippets`, `Markdown Emoji` for emoji support :tada: and check https://github.com/ikatyang/emoji-cheat-sheet for emoji shortcode to use.
   - `Emoji Snippets` (typing `:smile`) helps to insert emoji in HTML, JS, CSS, React and more. You can also add `"editor.quickSuggestions": true` in user settings.
   - `Markdown Emoji` (typing `:smile:`) supports to built-in Markdown preview.
9. Check out dotfiles https://github.com/mathiasbynens/dotfiles

Some references:
- https://dev.to/swyx/my-new-mac-setup-4ibi
- https://www.taniarascia.com/setting-up-a-brand-new-mac-for-development
- https://github.com/nicolashery/mac-dev-setup
- https://github.com/kentcdodds/dotfiles
- https://github.com/stefanjudis/dotfiles

### Moving to zsh
From macOS Catalina the default shell is `zsh`. `zsh` has a list of configuration files (`.z*` files) that will get executed at shell startup. `zsh` will start with `/etc/zshenv`, then the user’s `.zshenv`. Since changes in the `zshenv` will affect `zsh` behavior in all contexts, you should be very cautious about the changes applied here. Next, when the shell is a login shell, `zsh` will run `/etc/zprofile` and `.zprofile`. For interactive shells `/etc/zshrc` and `.zshrc`. Then, again, for login shells `/etc/zlogin` and `.zlogin`.

**macOS Terminal considers every new shell to be a login shell and an interactive shell**. So, in Terminal a new `zsh` will potentially run all configuration files. For simplicity’s sake, you should use just one file and the common choice is `.zshrc`. Most tools you download to configure `zsh`, such as `Oh My Zsh`, will override or re-configure your `.zshrc`.

## Git for the first time
The first thing you should do when you install Git is to set your user name and email address. This is important because every Git commit uses this information. Use `git config --list` ( `git config --global --list` ) command to list all the settings.
```shell
# settings in a global ~/.gitconfig file located in your home directory
git config --global user.name "Your name here"
git config --global user.email "your_email@example.com"
git config --global color.ui true
```

### Cloning with HTTPS or SSH
When you `git clone` using HTTPS URLs on the command line, Git will ask for your GitHub username and password the first time. It is likely that Git will use a credential helper provided by your operating system. If so, your GitHub credentials were cached and this setup applies across repos. Password-based authentication for Git is [deprecated](https://github.blog/2020-12-15-token-authentication-requirements-for-git-operations), and we recommend using a **personal access token (PAT)** when prompted for a password instead. Once you have a token, you can enter it instead of your password when performing Git operations over HTTPS. (If you are not prompted for the username and password, your credentials may be cached on your computer. You can update your credentials in the Keychain to replace your old password with the token).
   
SSH URLs provide access to a Git repository via SSH, a secure protocol. To use these URLs, you must generate an SSH keypair on your computer and add the public key to your GitHub account.

1. Enter the directory `cd ~/.ssh`
2. Generate the personalised SSH key `ssh-keygen`
3. Copy the key `cat id_rsa.pub | pbcopy`
4. Go to Github Settings -> select SSH and GPG keys -> New SSH Key. Give the SSH key a description so we can know which device it belongs too (i.e., MacBook Pro 2020).

<img alt="https ssh" src="https://ftp.bmp.ovh/imgs/2020/10/830c711c7263ab75.png" width="700">

### PAT in Azure DevOps
> A personal access token (PAT) is used as an alternate password to authenticate into Azure DevOps. Treat and use a PAT like your password.

The **user's `.npmrc`** should contain credentials for all of the registries that you need to connect to. The NPM client will look at your **project's `.npmrc`**, discover the registry, and fetch matching credentials from user's `.npmrc`. This enables you to share project's `.npmrc` with the whole team while keeping your credentials secure.

If you are developing on Windows, you only need to provide registries like `@foo:registry=https://pkgs.dev.azure.com/xxx/` in the user `.npmrc` file and run `vsts-npm-auth -config .npmrc` command on a periodic basis. Vsts will automatically create PAT tokens in Azure DevOps for each registry and inject credentials into your `.npmrc` file.

If you are developing on Linux or Mac, vsts-npm-auth is not supported and we need to set up credentials manually. First generate a personal access token with packaging read & write scopes, and then Base64 encode the PAT. Now use the encoded PAT values as password in the user `.npmrc` file (also need the organization, feed, username, and email).
