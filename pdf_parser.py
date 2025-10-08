#!/usr/bin/env python3
"""
PDF Parser for Tax Document Processing
Uses PyMuPDF to extract text and data from uploaded PDF files
"""

import fitz  # PyMuPDF
import json
import re
import sys
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import tempfile
import io
from typing import Dict, Any, Optional

# --- Gemini AI Integration ---
import google.generativeai as genai

# --- Configuration ---
# Load the Gemini API key from an environment variable for security
# Or fallback to the config file if the variable is not set.
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY environment variable not set.")
    # As a fallback for this project, we'll try to read it from the JS config.
    # In a real production app, NEVER expose the key on the client-side.
    try:
        with open('config/api-config.js', 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r"GEMINI_API_KEY:\s*['\"](AIza[a-zA-Z0-9_-]+)['\"]", content)
            if match:
                GEMINI_API_KEY = match.group(1)
                print("Loaded API key from config/api-config.js as a fallback.")
    except Exception as e:
        print(f"Could not read API key from config file: {e}")

if GEMINI_API_KEY and not GEMINI_API_KEY.startswith("AIza"):
    print("Error: Invalid Gemini API Key found.")
    GEMINI_API_KEY = None

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class PDFParser:
    def __init__(self):
        # The model can be changed to 'gemini-1.5-pro-latest' for higher accuracy
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.prompt = """
Analyze the following document, which is a salary slip or tax form (like Form 16/26AS).
Extract the following fields and their corresponding numeric values.
Present the output as a simple key-value list. If a field is not found, state 'Not Found'.
Do not add any extra commentary, just the list.

Fields to extract:
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
"""

    def get_pdf_images(self, pdf_path: str):
        """Convert PDF pages to a list of PIL Images"""
        try:
            doc = fitz.open(pdf_path)
            images = []
            for page_num in range(doc.page_count):
                page = doc.load_page(page_num)
                pix = page.get_pixmap(dpi=150) # Render page to an image
                img_data = pix.tobytes("png")
                images.append(io.BytesIO(img_data))
            doc.close()
            return images
        except Exception as e:
            print(f"Error converting PDF to images: {e}")
            return None
    
    def parse_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Parse PDF using Gemini and return the extracted text."""
        if not GEMINI_API_KEY:
            return {"error": "Gemini API key is not configured on the server."}

        images = self.get_pdf_images(pdf_path)
        if not images:
            return {"error": "Could not convert PDF to images for analysis."}

        try:
            # Prepare content for Gemini API
            # The content list will contain the prompt first, then all page images
            content = [self.prompt]
            for img_bytes in images:
                content.append({'mime_type': 'image/png', 'data': img_bytes.getvalue()})

            print("Sending request to Gemini API...")
            response = self.model.generate_content(content)
            print("Received response from Gemini API.")

            extracted_text = response.text

            return {
                'success': True,
                'extracted_text': extracted_text,
                'metadata': {
                    'model_used': 'gemini-1.5-flash-latest',
                    'page_count': len(images)
                }
            }
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return {"error": f"An error occurred while communicating with the Gemini API: {str(e)}"}

class PDFParserHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.parser = PDFParser()
        super().__init__(*args, **kwargs)
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Max-Age', '86400') # Cache preflight for 1 day
        self.end_headers()
    
    def do_POST(self):
        """Handle PDF upload and parsing"""
        try:
            if not GEMINI_API_KEY:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                error_response = {'error': 'Server is not configured with a Gemini API key. Please set the GEMINI_API_KEY environment variable.'}
                self.wfile.write(json.dumps(error_response).encode())
                return

            # Check if the request is for the /parse endpoint
            if self.path != '/parse':
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                error_response = {'error': f'Endpoint not found: {self.path}. Use /parse'}
                self.wfile.write(json.dumps(error_response).encode())
                return
            
            # Parse the multipart form data
            content_type = self.headers.get('content-type', '')
            
            if not content_type.startswith('multipart/form-data'):
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {'error': 'Invalid content type. Expected multipart/form-data'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            # Use cgi module for robust multipart form parsing
            from cgi import FieldStorage
            form = FieldStorage(fp=self.rfile, headers=self.headers, environ={'REQUEST_METHOD': 'POST'})
            
            if 'file' not in form or not form['file'].filename:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {'error': 'No file uploaded. Please upload a file with the key "file".'}
                self.wfile.write(json.dumps(response).encode())
                return
            
            file_item = form['file']
            file_data = file_item.file.read()
            
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                temp_file.write(file_data)
                temp_path = temp_file.name
            
            try:
                # Parse the PDF
                result = self.parser.parse_pdf(temp_path)
                
                # Send success response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())
            finally:
                # Clean up temporary file
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                    
        except Exception as e:
            import traceback
            print(f"Error in do_POST: {e}")
            print(f"Traceback: {traceback.format_exc()}")
            error_response = {'error': f'Server error: {str(e)}'}
            
            try:
                if not self.headers_sent:
                    self.send_response(500)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                self.wfile.write(json.dumps(error_response).encode())
            except:
                pass
    
    def log_message(self, format, *args):
        """Override to reduce log noise"""
        pass

def run_server(port=8080):
    """Run the PDF parser server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, PDFParserHandler)
    
    print(f"PDF Parser Server running on http://localhost:{port}")
    print("Endpoints:")
    print(f"  POST http://localhost:{port}/parse - Upload and parse PDF")
    print("\nReady to process PDF files...")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.shutdown()

if __name__ == "__main__":
    # Check if PyMuPDF is installed
    try:
        import fitz
        import google.generativeai
    except ImportError:
        print("Error: PyMuPDF is not installed. Please install it using:")
        print("pip install PyMuPDF")
        print("Error: google-generativeai is not installed. Please install it using:")
        print("pip install google-generativeai")
        sys.exit(1)

    if not GEMINI_API_KEY:
        print("\n" + "="*50)
        print("WARNING: Gemini API Key is not configured.")
        print("The server will run, but PDF parsing will fail.")
        print("Please set the 'GEMINI_API_KEY' environment variable or update 'config/api-config.js'.")
        print("="*50 + "\n")
    
    # Start the server
    port = 8080
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Invalid port number. Using default port 8080.")
    
    run_server(port)
