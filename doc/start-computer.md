## Setting up development environment

1. Install the Homebrew package manager, and you can install almost any app from the command line. Make sure everything is up to date `brew update`.
2. Install VS Code, Chrome, iTerm2 through Homebrew
    ```shell
    brew install git yarn make
    brew cask install visual-studio-code google-chrome iterm2 docker rectangle
    ```
3. Catalina comes with `zsh` as the default shell. Install `Oh My Zsh`.
4. Use `nvm` to install Node.js, and install the latest version of node `nvm install node` (or `nvm install xx.xx` and `nvm use xx.xx`). Run `node -v && npm -v` to check the version.
5. Set global configuration with Git `touch ~/.gitconfig`
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
      lg     == log --pretty=format:'%h %ad%x09%an%x09%s' --date=short
    ```
    (%h = commit hash, %x09 = tab, %an = author name, %ad = author date, %s = subject)   
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
7. Install Chrome extension `DevTools Theme: New Moon`, then set devtool's theme to "Dark" and go to Experiments and select "Allow custom UI themes".
8. Install `Prettier`, `GitLens`, `New Moon Theme` for VS Code.
9. May use other's dotfiles https://github.com/mathiasbynens/dotfiles, https://github.com/kentcdodds/dotfiles
10. Try this tool to correct errors in previous console command: https://github.com/nvbn/thefuck

---

## Git for the first time
The first thing you should do when you install Git is to set your user name and email address. This is important because every Git commit uses this information. Use `git config --list` command to list all the settings.
```shell
git config --global user.name "Your name here"
git config --global user.email "your_email@example.com"
git config --global color.ui true
```

### Cloning with HTTPS or SSH
When you `git clone` using HTTPS URLs on the command line, Git will ask for your GitHub username and password the first time. It is likely that Git will use a credential helper provided by your operating system. If so, your GitHub credentials were cached and this setup applies across repos. Password-based authentication for Git is deprecated, and we recommend using a **personal access token (PAT)** when prompted for a password instead. Once you have a token, you can enter it instead of your password when performing Git operations over HTTPS. (If you are not prompted for the username and password, your credentials may be cached on your computer. You can update your credentials in the Keychain to replace your old password with the token).
   
SSH URLs provide access to a Git repository via SSH, a secure protocol. To use these URLs, you must generate an SSH keypair on your computer and add the public key to your GitHub account.
<img alt="https ssh" src="https://ftp.bmp.ovh/imgs/2020/10/830c711c7263ab75.png" width="700">

### PAT in Azure DevOps
> A personal access token (PAT) is used as an alternate password to authenticate into Azure DevOps. Treat and use a PAT like your password.

The **user's `.npmrc`** should contain credentials for all of the registries that you need to connect to. The NPM client will look at your **project's `.npmrc`**, discover the registry, and fetch matching credentials from user's `.npmrc`. This enables you to share project's `.npmrc` with the whole team while keeping your credentials secure.

If you are developing on Windows, you only need to provide registries like `@foo:registry=https://pkgs.dev.azure.com/xxx/` in the user `.npmrc` file and run `vsts-npm-auth -config .npmrc` command on a periodic basis. Vsts will automatically create PAT tokens in Azure DevOps for each registry and inject credentials into your `.npmrc` file.

If you are developing on Linux or Mac, vsts-npm-auth is not supported and we need to set up credentials manually. First generate a personal access token with packaging read & write scopes, and then Base64 encode the PAT. Now use the encoded PAT values as password in the user `.npmrc` file (also need the organization, feed, username, and email).
