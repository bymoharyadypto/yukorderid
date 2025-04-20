#!/bin/bash

TUNNEL_PORT=3307
DB_HOST="127.0.0.1"

echo "🔐 Mengecek apakah port $TUNNEL_PORT sudah digunakan..."

if lsof -i :$TUNNEL_PORT >/dev/null 2>&1; then
  echo "⚠️ Port $TUNNEL_PORT sudah dipakai. Lewati setup SSH tunnel."
else
  echo "🔐 Membuka SSH Tunnel ke server MySQL (production)..."
  ssh -f -N -L $TUNNEL_PORT:127.0.0.1:3306 u971238799@46.202.138.222 -p 65002
  sleep 2
fi

echo "🚀 Menjalankan migrasi & seeder Sequelize untuk production..."
npx sequelize db:migrate --env production
npx sequelize db:seed:all --env production

echo "🚀 Menjalankan migrasi & seeder Sequelize untuk development..."

echo "✅ Done! 🎉"
