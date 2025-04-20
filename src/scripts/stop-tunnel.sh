#!/bin/bash

TUNNEL_PORT=3307

echo "🛑 Mencari proses yang memakai port $TUNNEL_PORT..."

PID=$(netstat -ano | grep ":$TUNNEL_PORT" | grep LISTENING | awk '{print $5}' | head -n 1)

if [ -z "$PID" ]; then
  echo "✅ Tidak ada proses SSH tunnel di port $TUNNEL_PORT."
else
  echo "🔍 Proses ditemukan dengan PID: $PID"
  echo "💥 Membunuh proses dengan PID $PID..."
  taskkill //PID $PID //F
  echo "✅ Tunnel di port $TUNNEL_PORT telah dihentikan."
fi

echo "✅ Done! 🎉"