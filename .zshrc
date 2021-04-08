# Path to your oh-my-zsh installation.
export ZSH="/Users/nikodermus/.oh-my-zsh"

ZSH_THEME="avit-da2k"
ZSH_DISABLE_COMPFIX=true
ZSH_CUSTOM_AUTOUPDATE_QUIET=true

plugins=(
    git
    zsh-autosuggestions
    zsh-completions
    zsh-syntax-highlighting
    zsh-nvm
)

# alias
alias c="clear"
alias y="yarn"
alias zconfig="code ~/.zshrc"
alias zsource="source ~/.zshrc"

# Git
alias coz="git-cz"
alias g="git"
alias gasc="g al; g status; coz && g push"
alias gpod="g pull origin dev"
alias gpom="g pull origin master"
alias update="g al; g commit -m 'Update live workshop'; g push"

# OhMyZSH
source $ZSH/oh-my-zsh.sh

# clone subfolder
function gitsub() {
    svn checkout ${1:gs/tree\/master/trunk}
    find . -type d -name .svn|xargs rm -rf
}

export NVM_COMPLETION=true
export PATH="/usr/local/opt/openjdk/bin:$PATH"
export CPPFLAGS="-I/usr/local/opt/openjdk/include"

# The next line updates PATH for the Google Cloud SDK.
if [ -f '/Users/nikodermus/Downloads/google-cloud-sdk/path.zsh.inc' ]; then . '/Users/nikodermus/Downloads/google-cloud-sdk/path.zsh.inc'; fi

# The next line enables shell command completion for gcloud.
if [ -f '/Users/nikodermus/Downloads/google-cloud-sdk/completion.zsh.inc' ]; then . '/Users/nikodermus/Downloads/google-cloud-sdk/completion.zsh.inc'; fi
