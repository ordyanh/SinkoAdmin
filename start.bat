@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
title Sinko Admin Panel Launcher
cd /d "%~dp0"

:menu
cls
echo ================================================================
echo                   S I N K O   A D M I N   P A N E L
echo                  Интерактивное меню управления
echo ================================================================
echo.
echo  Выберите режим запуска:
echo.
echo   [1] Запуск с локальным бэкендом (http://localhost:5206)
echo   [2] Запуск с серверным бэкендом (DigitalOcean Cloud API)
echo   [3] Сборка проекта для продакшена (npm run build)
echo   [4] Проверить текущий статус подключения бэкенда
echo   [5] Выход
echo.
echo ================================================================
set /p choice="Введите номер [1-5]: "

if "%choice%"=="1" goto local
if "%choice%"=="2" goto server
if "%choice%"=="3" goto build
if "%choice%"=="4" goto status
if "%choice%"=="5" exit /b 0

echo Неверный выбор, попробуйте снова.
timeout /t 2 >nul
goto menu

:local
call "%~dp0start-local.bat"
goto menu

:server
call "%~dp0start-server.bat"
goto menu

:build
call "%~dp0build.bat"
goto menu

:status
cls
call node scripts\switch-backend.js status
echo.
pause
goto menu
