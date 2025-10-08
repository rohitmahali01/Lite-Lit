import requests
import fitz
import re

# Debug the overtime extraction issue
def debug_overtime_extraction():
    # Check what's in the current PDF
    doc = fitz.open('test_salary_slip.pdf')
    page = doc.load_page(0)
    text = page.get_text()
    doc.close()
    
    print("Current PDF content:")
    print("=" * 60)
    print(text)
    print("=" * 60)
    
    # Test overtime patterns manually
    text_lower = text.lower()
    overtime_patterns = [
        r'overtime\s+salary[\s:·]*₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',
        r'overtime\s+pay[\s:·]*₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',
        r'overtime\s+amount[\s:·]*₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',
        r'overtime\s+salary\s+(\d+(?:,\d{3})*(?:\.\d{2})?)(?=\s|$)',  # Columnar
        r'overtime[\s:·]*₹?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)(?![\s]*(?:hours?|units?|hrs?))',
    ]
    
    print("\n🔍 Testing overtime patterns manually:")
    for i, pattern in enumerate(overtime_patterns, 1):
        matches = re.findall(pattern, text_lower, re.IGNORECASE)
        print(f"  Pattern {i}: {pattern}")
        print(f"  Matches: {matches}")
        print()
    
    # Test API response
    print("🌐 Testing API response:")
    try:
        with open('test_salary_slip.pdf', 'rb') as f:
            response = requests.post('http://localhost:8080/parse', files={'file': f})
        
        data = response.json()
        if 'data' in data:
            overtime_value = data['data'].get('overtimeAmount', 'NOT FOUND')
            print(f"API Response - overtimeAmount: {overtime_value}")
            
            # Show all extracted values
            print("\nAll extracted values:")
            for field, value in data['data'].items():
                if isinstance(value, (int, float)) and value > 0:
                    print(f"  {field}: {value}")
        else:
            print("Error in API response:", data)
            
    except Exception as e:
        print(f"Error testing API: {e}")

if __name__ == "__main__":
    debug_overtime_extraction()
