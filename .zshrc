# ZSH Config
export ZSH="/home/nicolas.mahecha/.oh-my-zsh"

# ZSH_THEME="awesomepanda"
# ZSH_THEME="nanotech"
ZSH_THEME="avit-da2k"

CASE_SENSITIVE="true"
GREEN='\033[0;32m'
NC='\033[0m'
RED='\033[0;31m'

plugins=(
  git
  zsh-autosuggestions
  zsh-completions
  zsh-syntax-highlighting
  zsh-nvm
)

# alias
alias c="clear"
alias coz-again="yarn test -u && g al; coz --retry; pushy"
alias coz="git-cz"
alias g="git"
alias gasc="g add --all; g status; coz && pushy"
alias pully='for i in `git remote`; do git pull $i; done;'
alias pushy='for i in `git remote`; do git push $i; done;'
alias y="yarn"
alias zconfig="code ~/.zshrc"
alias zsource="source ~/.zshrc"
alias update="g al; g commit -m 'Update live workshop'; pushy"

# VS
source $ZSH/oh-my-zsh.sh

# clone subfolder
function gitsub() {
  svn checkout ${1:gs/tree\/master/trunk}
  find . -type d -name .svn|xargs rm -rf
}

# Exports
export LESS_TERMCAP_mb=$'\e[1;32m'
export LESS_TERMCAP_md=$'\e[1;32m'
export LESS_TERMCAP_me=$'\e[0m'
export LESS_TERMCAP_se=$'\e[0m'
export LESS_TERMCAP_so=$'\e[01;33m'
export LESS_TERMCAP_ue=$'\e[0m'
export LESS_TERMCAP_us=$'\e[1;4;31m'
export PAGER="most"
export SDKMAN_DIR="$HOME/.sdkman"

# Run scripts
[[ -s "$HOME/.sdkman/bin/sdkman-init.sh" ]] && source "$HOME/.sdkman/bin/sdkman-init.sh"
[[ -s $HOME/.nvm/nvm.sh ]] && . $HOME/.nvm/nvm.sh
