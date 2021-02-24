## Setting up development environment
1. Install the Homebrew package manager, and you can install almost any app from the command line. Make sure everything is up to date `brew update`.
2. Install VS Code, Chrome, iTerm2, Docker through Homebrew
    ```shell
    brew install git yarn make
    brew cask install visual-studio-code google-chrome iterm2 docker
    ```
3. Catalina comes with `zsh` as the default shell. Install [Oh My Zsh](https://github.com/ohmyzsh/ohmyzsh).
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
    
    A curated list of shell commands specific to macOS: https://github.com/herrbischoff/awesome-macos-command-line

7. Install Chrome extension [DevTools Theme: New Moon](https://github.com/taniarascia/new-moon-chrome-devtools), then set devtool's theme to "Dark" and go to Experiments and select "Allow custom UI themes".
8. Add VS code extentions. Install `Prettier`, `GitLens`, `New Moon Theme`. Add `Emoji Snippets`, `Markdown Emoji` for emoji support :tada: and check https://github.com/ikatyang/emoji-cheat-sheet for emoji shortcode to use.
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

macOS Terminal considers every new shell to be a login shell and an interactive shell. So, in Terminal a new `zsh` will potentially run all configuration files. For simplicity’s sake, you should use just one file and the common choice is `.zshrc`. Most tools you download to configure `zsh`, such as `Oh My Zsh`, will override or re-configure your `.zshrc`.

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

#### Get verified commits
Commit verification allows other users to know that these commits are actually made by the person claiming to have made them. Aren’t usernames and passwords enough to keep users’ work adequately secured? Or SSH keys? The short answer is no and no. Both mechanisms work to grant or deny access to the Git repository. Once I’m granted access with either password or SSH key, it is very easy to commit pretending to be someone else. Using the `git config` command you can change your email and name to act like someone else made these commits. A simple run of the `git log` would tell me all I need to know about user's identity.

Git turns to GPG, a widely-adopted and open-source program. The team behind GPG, or the GNU Privacy Guard, describes it as a program that “allows you to encrypt and sign your data and communications.” All of the major players in the Git world reward those who go the extra mile to provide their identity with GPG. GitLab, GitHub, and Bitbucket all **show a badge next to each commit whose author has signed it with GPG**. 

> 1. Type `gpg --full-generate-key` to enter the creation flow.
> 2. Select the desired key type `RSA and RSA (default)`.
> 3. Enter the key size `4096 bits`.
> 4. Specify the validity duration, using `0` to indicate no expiration.
> 5. For the next few prompts, enter your name and email to identify the key.
> 6. Verify that GPG keys have been generated successfully by using `gpg --list-secret-keys --keyid-format LONG` command. The IDs beside the word `sec` refer to your short and long key IDs respectively.

Now that you have successfully generated the GPG key, the next step is to tell Git to use this key for signing your commits. Just like telling Git your name and email, you can also provide the GPG key configuration (using the long key ID is preferable here for greater precision): `git config --global user.signingkey <long-key-id>` and `git config --global commit.gpgsign true`. 

Export both your Public and Private keys using the commands: `gpg --export -a long-key-id > my-key-public.asc` and `gpg --export-secret-key -a long-key-id > my-key-private.asc`. Open the Public key file in a text editor and copy its contents from `-----BEGIN PGP PUBLIC KEY BLOCK-----` till `-----END PGP PUBLIC KEY BLOCK-----` (included). Then you need to share the public key with a Git provider. (Settings - Choose SSH and GPG Keys - New GPG Key - Paste the public key into the text box, and press the Add Key button.)

### PAT in Azure DevOps
> A personal access token (PAT) is used as an alternate password to authenticate into Azure DevOps. Treat and use a PAT like your password.

The **user's `.npmrc`** should contain credentials for all of the registries that you need to connect to. The NPM client will look at your **project's `.npmrc`**, discover the registry, and fetch matching credentials from user's `.npmrc`. This enables you to share project's `.npmrc` with the whole team while keeping your credentials secure.

If you are developing on Windows, you only need to provide registries like `@foo:registry=https://pkgs.dev.azure.com/xxx/` in the user `.npmrc` file and run `vsts-npm-auth -config .npmrc` command on a periodic basis. Vsts will automatically create PAT tokens in Azure DevOps for each registry and inject credentials into your `.npmrc` file.

If you are developing on Linux or Mac, vsts-npm-auth is not supported and we need to set up credentials manually. First generate a personal access token with packaging read & write scopes, and then Base64 encode the PAT. Now use the encoded PAT values as password in the user `.npmrc` file (also need the organization, feed, username, and email).
