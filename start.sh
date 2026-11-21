#!/bin/bash
# Script khởi chạy nhanh hệ thống AI Agent Bán lẻ Phúc An

echo "=========================================================="
echo "🌸 KHỞI ĐỘNG HỆ THỐNG AI AGENT - PHÚC AN RETAIL CHAIN"
echo "=========================================================="

ELECTRON_PATH="/Applications/Antigravity IDE.app/Contents/MacOS/Electron"

if [ -f "$ELECTRON_PATH" ]; then
  echo "✔ Đã tìm thấy môi trường thực thi runtime Node.js"
  export ELECTRON_RUN_AS_NODE=1
  "$ELECTRON_PATH" server.js
elif which node > /dev/null 2>&1; then
  echo "✔ Sử dụng Node.js hệ thống"
  node server.js
else
  echo "Mở trực tiếp giao diện tĩnh trên trình duyệt..."
  open public/index.html
fi

