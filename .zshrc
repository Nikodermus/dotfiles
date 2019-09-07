# ZSH Config
export ZSH="/home/nicolas.mahecha/.oh-my-zsh"

# ZSH_THEME="awesomepanda"
ZSH_THEME="nanotech"

CASE_SENSITIVE="true"
GREEN='\033[0;32m'
NC='\033[0m'
RED='\033[0;31m'

plugins=(
  git
  zsh-autosuggestions
  zsh-completions
  zsh-syntax-highlighting
)

# alias
alias c="clear"
alias coz-again="yarn test -u && g al; coz --retry; pushy"
alias coz="git-cz"
alias g="git"
alias gasc="g add --all; g status; coz && pushy"
alias open="xdg-open"
alias pully='for i in `git remote`; do git pull $i; done;'
alias pushy='for i in `git remote`; do git push $i; done;'
alias y="yarn"
alias zconfig="code ~/.zshrc"
alias zsource="source ~/.zshrc"

# VS alias
alias java7="sdk use java 7.0.222-zulu"
alias java8="sdk use java 8.0.212-zulu"
alias java9="sdk use java 9.0.7-zulu"
alias keep-alive="watch -n 30 curl -I"
alias mcint="mvn -DskipTests clean install"
alias vpn="globalprotect"
alias vpnoff="globalprotect disconnect --portal vpn.vividseats.com"
alias vpnon="globalprotect connect --portal vpn.vividseats.com"

# VS folders
alias bpo-regression="/home/nicolas.mahecha/vs/vivid-sales-bpo-regression"
alias bpo="/home/nicolas.mahecha/vs/vivid-bpo"
alias broker-portal="/home/nicolas.mahecha/vs/broker-portal"
alias canon="/home/nicolas.mahecha/vs/canon"
alias coreapi="/home/nicolas.mahecha/vs/vivid-coreapi"
alias map-component="/home/nicolas.mahecha/vs/venue-map-component"
alias map-utils="/home/nicolas.mahecha/vs/venue-map-utils"
alias maps="/home/nicolas.mahecha/vs/venue-maps"
alias sales="/home/nicolas.mahecha/vs/vivid-sales"
alias test-core="/home/nicolas.mahecha/vs/test-core"
alias web-services="/home/nicolas.mahecha/vs/vivid-web-services"
alias web="/home/nicolas.mahecha/vs/vivid-web"

# Collections
declare -a vsprojects
vsprojects=(broker-portal test-core coreapi bpo-regression web web-services sales bpo maps map-utils map-component)

# VS Functions
function vpn-reinstall() {
  folder=$(pwd)
  cd ~/Downloads

  sudo dpkg -r GlobalProtect
  sudo dpkg -i GlobalProtect_deb-*.deb

  eval "$folder"
  vpnon
}

function run-sales() {
  folder=$(pwd)

  sudo pwd

  echo '#### 1. Changed to Java 8'
  java8

  echo '#### Change to coreapi folder'
  coreapi

  echo '#### Delete /target'
  rm -rf target

  echo '#### Maven Clean Install'
  mcint

  echo '#### Change to sales folder'
  sales

  echo '#### Change Docker Permissions'
  sudo chmod 777 -R /home/nicolas.mahecha/.docker
  sudo chmod 777 /var/run/docker.sock

  echo '#### Delete /target'
  sudo rm -rf target

  echo '#### Run Make'
  make

  eval "$folder"
}

function run-bpo() {
  echo '#### 1. Changed to Java 9'
  java9

  echo '#### 2. Changed to vivid-sales-bpo'
  bpo

  echo '#### 3. Clean install'
  rm -rf target/
  mcint

  echo '#### 4. Run app'
  java -jar target/vivid-bpo.jar
}

function vivid-update() {
  folder=$(pwd)

  for p in "${vsprojects[@]}"; do
    echo -e "${GREEN}#######${NC} $p ${GREEN}#######${NC}"
    eval "$p"

    pully
    g pos
    pushy
  done

  eval "$folder"
}

function back-to-stage() {
  folder=$(pwd)

  for p in "${vsprojects[@]}"; do
    echo -e "${GREEN}#######${NC} $p ${GREEN}#######${NC}"
    eval "$p"

    pully
    pushy
    g co stage
  done

  eval "$folder"
}

source $ZSH/oh-my-zsh.sh

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
export VAULT_ADDR=http://vault.vividseats.test:8200
export VAULT_TOKEN=90c97305-f9c4-c7cb-c52b-594c3a7d9ef0

# Run scripts
[[ -s "$HOME/.sdkman/bin/sdkman-init.sh" ]] && source "$HOME/.sdkman/bin/sdkman-init.sh"
[[ -s $HOME/.nvm/nvm.sh ]] && . $HOME/.nvm/nvm.sh
