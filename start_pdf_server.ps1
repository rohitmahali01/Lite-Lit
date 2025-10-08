# PDF Parser Server Startup Script
Write-Host "Starting PDF Parser Server..." -ForegroundColor Green
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Found: $pythonVersion" -ForegroundColor Yellow
} catch {
    Write-Host "Error: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.7+ from https://python.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if PyMuPDF is installed
try {
    python -c "import fitz" 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "PyMuPDF not found"
    }
    Write-Host "PyMuPDF is installed" -ForegroundColor Green
} catch {
    Write-Host "PyMuPDF not found. Installing..." -ForegroundColor Yellow
    pip install PyMuPDF
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install PyMuPDF" -ForegroundColor Red
        Write-Host "Please run: pip install PyMuPDF" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "Starting PDF Parser Server on port 8080..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

try {
    python pdf_parser.py
} catch {
    Write-Host "Server stopped or error occurred" -ForegroundColor Red
}

Read-Host "Press Enter to exit"
