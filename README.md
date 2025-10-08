# Lite-Lit
Develop a technology-driven solution that helps users calculate, understand, and file income tax seamlessly. Use intelligent document processing and natural language understanding to extract data from inputs, compare tax regimes, and guide users step-by-step while ensuring high data security.

# Tax Calculator with PDF Parsing

This application now includes **real PDF parsing** using PyMuPDF instead of simulation.

## Setup Instructions

### 1. Install Python Dependencies

First, make sure you have Python 3.7+ installed, then install PyMuPDF:

```bash
pip install PyMuPDF
```

### 2. Start the PDF Parser Server

Choose one of these methods:

**Option A: Using Batch Script (Windows)**
```cmd
start_pdf_server.bat
```

**Option B: Using PowerShell (Windows)**
```powershell
.\start_pdf_server.ps1
```

**Option C: Manual Start**
```bash
python pdf_parser.py
```

The server will start on `http://localhost:8080`

### 3. Start the Frontend Application

Open another terminal and start the frontend:

```bash
python -m http.server 3000
```

Then open `http://localhost:3000` in your browser.

## How PDF Parsing Works

### Supported Formats
- **PDF files** (primary format)
- **Images**: JPG, JPEG, PNG (OCR not implemented yet)
- **Maximum file size**: 10MB

### Extracted Fields

The PDF parser automatically extracts these fields from salary slips:

✅ **Successfully Extracted:**
- Gross Salary
- Basic Salary  
- HRA (House Rent Allowance)
- TDS (Tax Deducted at Source)
- Overtime Amount
- Leave Travel Assistance (LTA)
- Medical Allowance
- Flexi Allowance
- Transportation Allowance
- Interest Income

⚙️ **Pattern Matching:**
The parser uses intelligent regex patterns to find amounts like:
- "Gross Salary: ₹118,521.00"
- "Basic: 35,833"
- "H.R.A: ₹17,917"
- "TDS: 2000"

### What Happens to Missing Fields

If a field is not found in your PDF:
- It will be set to **₹0** (not fake data)
- You can manually edit these fields in the review step
- The app clearly shows which fields were extracted vs. set to zero

## API Endpoints

### POST /parse
Upload and parse a PDF file.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: file (PDF document)

**Response:**
```json
{
  "success": true,
  "data": {
    "grossSalary": 118521.00,
    "basicSalary": 35833,
    "hraComponent": 17917,
    "interestIncome": 0,
    "tds_26as": 2000,
    ...
  },
  "metadata": {
    "found_fields": ["grossSalary", "basicSalary", "hraComponent"],
    "missing_fields": ["interestIncome", "medicalAllowance"],
    "total_fields_found": 3
  }
}
```

## Troubleshooting

### Server Won't Start
1. Check if Python is installed: `python --version`
2. Install PyMuPDF: `pip install PyMuPDF`
3. Check if port 8080 is free: `netstat -an | findstr 8080`

### PDF Not Parsing Correctly
1. Ensure the PDF contains text (not just images)
2. Check if field names match expected patterns
3. Verify the PDF is a salary slip or tax document

### Frontend Can't Connect
1. Make sure the PDF server is running on port 8080
2. Check browser console for CORS errors
3. Try restarting both servers

## File Structure

```
fintech tax/new/
├── pdf_parser.py           # PyMuPDF backend server
├── requirements.txt        # Python dependencies
├── start_pdf_server.bat    # Windows batch script
├── start_pdf_server.ps1    # PowerShell script
├── app.js                  # Updated frontend with PDF parsing
├── index.html              # Main HTML file
└── README.md              # This file
```

## Development Notes

- The parser server runs on port 8080
- Frontend expects the parser at `http://localhost:8080/parse`
- CORS is enabled for local development
- Files are processed in temporary storage and cleaned up automatically
- Real-time parsing status is shown in the frontend

Enjoy automated tax document processing! 🚀📄
