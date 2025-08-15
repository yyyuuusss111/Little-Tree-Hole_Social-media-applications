#!/bin/bash

echo "正在启动 Natural Idyllic Vue3 前端项目..."
echo

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "依赖安装失败，请检查网络连接或Node.js版本"
        exit 1
    fi
fi

echo "启动开发服务器..."
npm run dev
