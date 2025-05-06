OSINT Analysis Tool
==================

A web-based tool for analyzing images and documents for Open Source Intelligence (OSINT) purposes.

Features
--------
- Upload and analyze images (JPEG, PNG) and documents (TXT, PDF)
- Extract and display image metadata
- Analyze RF spectrum waterfall images
- Process text documents for entity recognition
- Search and filter analysis results
- Export findings as text files

Requirements
-----------
- Web server with PHP 7.4+ support
- Modern web browser (Chrome, Firefox, Safari)
- JavaScript enabled
- 10MB+ free disk space for temporary file storage

Installation
-----------
1. Copy all files to your web server directory:
   - index.html
   - upload.html
   - results.html
   - styles.css
   - script.js
   - server_upload.php

2. Create a temporary upload directory:
   mkdir -p tmp/uploads
   chmod 777 tmp/uploads

3. Ensure PHP has write permissions to the tmp/uploads directory.

Usage
-----
1. Access the tool through index.html in your web browser.

2. Upload Files:
   - Drag and drop files onto the upload area
   - Or click to select files manually
   - Check "RF Spectrum Image" for waterfall diagram analysis
   - Maximum file size: 10MB
   - Supported formats: JPEG, PNG, TXT, PDF

3. File Analysis:
   Images:
   - Metadata extraction (dimensions, size, type, date)
   - For RF spectrum images: frequency band detection and signal pattern analysis
   
   Documents:
   - TXT files: Full text analysis, entity recognition, sentiment analysis
   - PDF files: Manual text input required (limitation of client-side processing)

4. View Results:
   - Browse analysis results in a grid layout
   - Use search bar to find specific content
   - Filter by file type, date, or frequency range
   - Export results as text file

Limitations
----------
1. PDF Processing:
   - No direct PDF parsing (requires manual text input)
   - Convert PDFs to TXT for full analysis

2. RF Spectrum Analysis:
   - Basic signal pattern detection
   - Frequency range estimation based on image dimensions
   - Manual verification recommended for critical analysis

3. Image Analysis:
   - Basic metadata extraction
   - No advanced OCR capabilities
   - Limited to JPEG and PNG formats

4. Security:
   - Files are processed client-side where possible
   - Temporary server storage (1-hour retention)
   - No user authentication or data persistence

Privacy & Security
----------------
- Files are processed in the browser where possible
- Uploaded files are temporarily stored server-side
- All files are automatically deleted after 1 hour
- No user data or analysis results are permanently stored
- No external services or APIs are used

Troubleshooting
--------------
1. Upload Issues:
   - Verify file size is under 10MB
   - Check file format is supported
   - Ensure tmp/uploads directory is writable

2. Analysis Problems:
   - For RF spectrum images, ensure "RF Spectrum Image" is checked
   - For text analysis, use UTF-8 encoded text files
   - Clear browser cache if results don't update

3. Display Issues:
   - Enable JavaScript in your browser
   - Use a modern browser (Chrome, Firefox, Safari)
   - Check browser console for error messages

Contact
-------
For support: support@osintanalyzer.com

License
-------
This tool is provided as-is without any warranties.
All rights reserved.

Version: 1.0.0
Last Updated: 2024
