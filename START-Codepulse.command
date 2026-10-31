#!/bin/zsh
# Double-click this file to start the whole CodePulse project locally.
# It starts: MongoDB (database) -> Redis (cache) -> Backend (port 5050) -> Frontend (port 5173)
# and then opens the website in your browser.

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
PROJECT="${0:A:h}"
DATA="$HOME/codepulse-data"
LOGS="$DATA/logs"
mkdir -p "$DATA/db" "$LOGS"

echo "================================================"
echo "        Starting CodePulse... please wait"
echo "================================================"

for tool in node mongod redis-server; do
  if ! command -v $tool >/dev/null; then
    echo "❌  '$tool' is not installed. Install it first (see README → Local setup)."
    exit 1
  fi
done

# First run: create local .env files and install packages
if [ ! -f "$PROJECT/server/.env" ]; then
  echo "Creating server/.env for local use..."
  SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
  sed "s/^JWT_SECRET=.*/JWT_SECRET=$SECRET/" "$PROJECT/server/.env.local.example" > "$PROJECT/server/.env"
  chmod 600 "$PROJECT/server/.env"
fi
[ -f "$PROJECT/client/.env" ] || echo "VITE_API_URL=http://localhost:5050/api" > "$PROJECT/client/.env"
[ -d "$PROJECT/server/node_modules" ] || (echo "Installing backend packages..." && cd "$PROJECT/server" && npm install --no-audit --no-fund)
[ -d "$PROJECT/client/node_modules" ] || (echo "Installing frontend packages..." && cd "$PROJECT/client" && npm install --no-audit --no-fund)

# Clean up any old copies still running from last time
pkill -f "node server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1

# 1) Database
if ! nc -z 127.0.0.1 27017 2>/dev/null; then
  echo "[1/4] Starting MongoDB (database)..."
  nohup mongod --dbpath "$DATA/db" --port 27017 --bind_ip 127.0.0.1 --logpath "$DATA/mongod.log" >/dev/null 2>&1 &
  for i in {1..20}; do nc -z 127.0.0.1 27017 2>/dev/null && break; sleep 1; done
else
  echo "[1/4] MongoDB already running"
fi

# 2) Cache
if ! nc -z 127.0.0.1 6379 2>/dev/null; then
  echo "[2/4] Starting Redis (cache)..."
  redis-server --port 6379 --bind 127.0.0.1 --daemonize yes >/dev/null 2>&1
  sleep 1
else
  echo "[2/4] Redis already running"
fi

# 3) Backend
echo "[3/4] Starting Backend server (port 5050)..."
cd "$PROJECT/server" && nohup npm start > "$LOGS/server.log" 2>&1 &
for i in {1..30}; do curl -s http://localhost:5050/api/health >/dev/null 2>&1 && break; sleep 1; done

# 4) Frontend
echo "[4/4] Starting Website (port 5173)..."
cd "$PROJECT/client" && nohup npm run dev > "$LOGS/client.log" 2>&1 &
for i in {1..30}; do curl -s http://localhost:5173 >/dev/null 2>&1 && break; sleep 1; done

echo ""
if curl -s http://localhost:5050/api/health | grep -q ok && curl -s -o /dev/null http://localhost:5173; then
  # First run on an empty database: add demo users so the app has data to show
  node "$PROJECT/server/scripts/seedDemo.js" --if-empty
  echo "✅  CodePulse is READY!"
  echo ""
  echo "   Website : http://localhost:5173"
  echo "   Login   : demo@codepulse.test"
  echo "   Password: Demo@1234"
  echo ""
  open "http://localhost:5173"
else
  echo "❌  Something did not start. Check logs in: $LOGS"
fi
echo ""
echo "Keep this window open. To stop, double-click STOP-CodePulse.command"
