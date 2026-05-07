@echo off
cd /d "%~dp0"
node node_modules\vite\bin\vite.js --host localhost --port 5173 --strictPort
