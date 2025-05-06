
Built by https://www.blackbox.ai

---

# OSINT Analysis Tool

## Project Overview

The OSINT Analysis Tool is a web-based application designed for conducting comprehensive Open Source Intelligence (OSINT) analysis. The tool allows users to upload images and documents, extract metadata, analyze RF spectrum images, and visualize data through interactive charts. It provides a robust environment for analyzing multiple file types, including JPEG, PNG, PDF, and TXT.

## Installation

To set up the OSINT Analysis Tool on your local machine, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/osint-analysis-tool.git
   ```

2. **Navigate to the project directory**:
   ```bash
   cd osint-analysis-tool
   ```

3. **Set up a local server**:
   For example, you can use [XAMPP](https://www.apachefriends.org/index.html) to create a local PHP environment or use any other compatible server.

4. **Access the tool**:
   Open your web browser and navigate to `http://localhost/path/to/osint-analysis-tool/index.html`.

## Usage

1. Launch the application by opening `index.html` in your web browser.
2. Use the **Upload** section to drag and drop files or select them manually.
3. After uploading, navigate to the **Results** section to see the analysis and metadata extracted from your files.

## Features

- **Image Analysis**: Extract EXIF data and analyze RF spectrum images for signal patterns.
- **Document Processing**: Analyze TXT files and process PDFs to extract meaningful entities.
- **Data Visualization**: View analysis results through interactive charts and visualizations.
- **Export Results**: Download analysis results in text format for further processing.

## Dependencies

The tool includes key dependencies for CSS and font icons:
- Font Awesome for icons:
  ```html
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  ```

For local development, ensure you include:
- CSS and JS files used in the project.

## Project Structure

```
osint-analysis-tool/
├── index.html           # Main page displaying welcome and features
├── upload.html          # Page for file uploads
├── results.html         # Page displaying analysis results
├── styles.css           # CSS styles for the application
├── script.js            # JavaScript functionalities for interaction
└── server_upload.php    # PHP backend for handling file uploads
```

This tool leverages a client-side interface to interact with users while the server-side handles file uploads and analysis processing.

## Contact

For support, please contact us at: [support@osintanalyzer.com](mailto:support@osintanalyzer.com).

## Privacy Notice

Files are processed client-side and temporarily stored server-side. All files are deleted after processing to ensure user privacy and data security.