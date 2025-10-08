@echo off
echo Starting PDF Parser Server...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.7+ from https://python.org
    pause
    exit /b 1
)

REM Check if PyMuPDF is installed
python -c "import fitz" >nul 2>&1
if %errorlevel% neq 0 (
    echo PyMuPDF not found. Installing...
    pip install PyMuPDF
    if %errorlevel% neq 0 (
        echo Error: Failed to install PyMuPDF
        echo Please run: pip install PyMuPDF
        pause
        exit /b 1
    )
)

echo Starting PDF Parser Server on port 8080...
echo Press Ctrl+C to stop the server
echo.
python pdf_parser.py
pause
