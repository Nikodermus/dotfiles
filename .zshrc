# Path to your oh-my-zsh installation.
export ZSH="/Users/nikodermus/.oh-my-zsh"

ZSH_THEME="avit-da2k"
ZSH_DISABLE_COMPFIX=true

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
alias y="yarn"
alias zconfig="code ~/.zshrc"
alias zsource="source ~/.zshrc"

# Git
alias coz="git-cz"
alias g="git"
alias gasc="g add --all; g status; coz && pushy"
alias gpod="g pull origin dev"
alias gpom="g pull origin master"
alias pully='for i in `git remote`; do git pull $i; done;'
alias pushy='for i in `git remote`; do git push $i; done;'
alias update="g al; g commit -m 'Update live workshop'; pushy"

# OhMyZSH
source $ZSH/oh-my-zsh.sh

# Sentry Folders
alias admin="/Users/nikodermus/sentry/admin"
alias auth="/Users/nikodermus/sentry/auth"
alias file="/Users/nikodermus/sentry/file"
alias forms="/Users/nikodermus/sentry/forms"
alias gateway="/Users/nikodermus/sentry/gateway"
alias linter="/Users/nikodermus/sentry/linter"
alias portal="/Users/nikodermus/sentry/portal"
alias postman="/Users/nikodermus/sentry/postman"
alias schedule="/Users/nikodermus/sentry/schedule"

# Front Apps
alias portal.ui="/Users/nikodermus/sentry/portal.ui"
alias schedule.ui="/Users/nikodermus/sentry/schedule.ui"

declare -a sentryprojects
sentryprojects=(admin auth file forms gateway linter portal postman schedule schedule.ui portal.ui)

# Sentry Commands
function back-to-dev(){
    folder=$(pwd)
    
    for project in "${sentryprojects[@]}"; do
        echo -e "${GREEN}#######${NC} $project ${GREEN}#######${NC}"
        eval "$project"
        
        g co dev
        pully
    done
    
    eval "$folder"
}

function update-repos(){
    folder=$(pwd)
    
    for project in "${sentryprojects[@]}"; do
        echo -e "${GREEN}#######${NC} $project ${GREEN}#######${NC}"
        eval "$project"
        
        pully
        gpod
        pushy
    done
    
    eval "$folder"
}

# Random Student
declare -a ac_students=(
    "Andrea"
    "Cinthya"
    "Daniel"
    "Diana"
    "Giorgio"
    "Juanjo"
    "Juanse"
    "Laura"
    "Leo"
    "Lina"
    "Maco"
    "Nata"
    "Pao"
)

function ar() {
    RANDOM=$$$(date +%s)
    selected_student=${ac_students[$RANDOM % ${#ac_students[@]} ]}
    echo ${selected_student}
}

# clone subfolder
function gitsub() {
    svn checkout ${1:gs/tree\/master/trunk}
    find . -type d -name .svn|xargs rm -rf
}

export NVM_COMPLETION=true
export PATH="/usr/local/opt/openjdk/bin:$PATH"
export CPPFLAGS="-I/usr/local/opt/openjdk/include"