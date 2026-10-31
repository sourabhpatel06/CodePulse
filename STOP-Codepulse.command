#!/bin/zsh
# Double-click to stop CodePulse (backend + website + database + cache).
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
pkill -f "node server.js"
pkill -f "vite"
redis-cli shutdown nosave >/dev/null 2>&1
pkill -x mongod
echo "🛑  CodePulse stopped. You can close this window."
