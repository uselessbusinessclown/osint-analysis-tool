// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_DOCUMENT_TYPES = ['text/plain', 'application/pdf'];

// DOM Elements Cache
const domElements = {
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    rfSpectrum: document.getElementById('rfSpectrum'),
    uploadProgress: document.getElementById('uploadProgress'),
    progressBar: document.querySelector('.progress-fill'),
    progressText: document.querySelector('.progress-text'),
    previewGrid: document.getElementById('previewGrid'),
    errorMessages: document.getElementById('errorMessages'),
    searchInput: document.getElementById('searchInput'),
    fileTypeFilter: document.getElementById('fileTypeFilter'),
    dateFilter: document.getElementById('dateFilter'),
    freqMin: document.getElementById('freqMin'),
    freqMax: document.getElementById('freqMax'),
    resultsGrid: document.getElementById('resultsGrid'),
    exportBtn: document.getElementById('exportBtn')
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeUploadPage();
    initializeResultsPage();
});

// Upload Page Initialization
function initializeUploadPage() {
    if (!domElements.dropZone) return; // Not on upload page

    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        domElements.dropZone.addEventListener(eventName, preventDefaults);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        domElements.dropZone.addEventListener(eventName, highlight);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        domElements.dropZone.addEventListener(eventName, unhighlight);
    });

    domElements.dropZone.addEventListener('drop', handleDrop);
    domElements.fileInput.addEventListener('change', handleFileSelect);
    
    // RF Spectrum checkbox event
    if (domElements.rfSpectrum) {
        domElements.rfSpectrum.addEventListener('change', updateRFStatus);
    }
}

// Results Page Initialization
function initializeResultsPage() {
    if (!domElements.searchInput) return; // Not on results page

    domElements.searchInput?.addEventListener('input', filterResults);
    domElements.fileTypeFilter?.addEventListener('change', filterResults);
    domElements.dateFilter?.addEventListener('change', filterResults);
    domElements.freqMin?.addEventListener('input', filterResults);
    domElements.freqMax?.addEventListener('input', filterResults);
    domElements.exportBtn?.addEventListener('click', exportResults);
}

// File Upload Handlers
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(Array.from(files));
    unhighlight(e);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(Array.from(files));
}

function handleFiles(files) {
    console.log('Handling files:', files.length, 'files selected');
    
    if (files.length === 0) {
        showError('No files selected');
        return;
    }

    const validFiles = Array.from(files).filter(file => {
        console.log('Validating file:', file.name, file.type, file.size);
        
        if (!isValidFileType(file)) {
            showError(`Invalid file type: ${file.name}. Supported formats: JPEG, PNG, PDF, TXT`);
            return false;
        }
        if (file.size > MAX_FILE_SIZE) {
            showError(`File too large: ${file.name}. Maximum size: 10MB`);
            return false;
        }
        return true;
    });

    console.log('Valid files:', validFiles.length);

    if (validFiles.length === 0) {
        showError('No valid files to process');
        return;
    }

    // Process each valid file
    validFiles.forEach(file => {
        console.log('Processing file:', file.name);
        processFile(file).catch(error => {
            console.error('Error processing file:', error);
            showError(`Error processing ${file.name}: ${error.message}`);
        });
    });
}

// File Processing
async function processFile(file) {
    console.log('Starting file processing:', file.name);
    showProgress(0);
    
    try {
        // Create FormData and append file
        const formData = new FormData();
        formData.append('file', file);
        
        // Add RF Spectrum flag if checked
        if (domElements.rfSpectrum?.checked) {
            console.log('RF Spectrum analysis enabled for:', file.name);
            formData.append('isRFSpectrum', 'true');
        }
        
        console.log('Uploading file to server:', file.name);
        showProgress(20);
        
        // Upload file to server
        const response = await fetch('server_upload.php', {
            method: 'POST',
            body: formData
        });
        
        console.log('Server response status:', response.status);
        showProgress(50);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Server response:', result);
        
        if (!result.success) {
            throw new Error(result.message);
        }
        
        showProgress(70);
        
        // Process based on file type
        let analysisResult;
        if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
            console.log('Processing image file:', file.name);
            analysisResult = await processImage(file, result.data);
        } else if (ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
            console.log('Processing document file:', file.name);
            analysisResult = await processDocument(file, result.data);
        }
        
        showProgress(90);
        
        // If we're on the upload page, show preview
        if (domElements.previewGrid) {
            console.log('Displaying file preview:', file.name);
            displayFilePreview(file, { ...result.data, ...analysisResult });
        }
        
        showProgress(100);
        console.log('File processing completed:', file.name);
        
        return analysisResult;
        
    } catch (error) {
        console.error('Error in processFile:', error);
        showError(`Error processing ${file.name}: ${error.message}`);
        showProgress(0);
        throw error;
    }
}

async function processImage(file, serverData) {
    const metadata = await extractImageMetadata(file);
    
    if (domElements.rfSpectrum?.checked) {
        const rfAnalysis = await analyzeRFSpectrum(file);
        metadata.rfAnalysis = rfAnalysis;
    }
    
    return {
        type: 'image',
        metadata,
        serverData
    };
}

async function processDocument(file, serverData) {
    if (file.type === 'text/plain') {
        const content = await readTextFile(file);
        const analysis = analyzeText(content);
        return {
            type: 'document',
            analysis,
            serverData
        };
    } else {
        throw new Error('PDF processing requires manual text input');
    }
}

// Utility Functions
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    domElements.dropZone?.classList.add('highlight');
}

function unhighlight(e) {
    domElements.dropZone?.classList.remove('highlight');
}

function updateRFStatus(e) {
    const isRF = e.target.checked;
    if (isRF) {
        showInfo('RF Spectrum analysis enabled. Processing may take longer.');
    }
}

function isValidFileType(file) {
    return [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES].includes(file.type);
}

// UI Updates
function showProgress(percent) {
    if (!domElements.uploadProgress) return;

    domElements.uploadProgress.classList.remove('hidden');
    domElements.progressBar.style.width = `${percent}%`;
    domElements.progressText.textContent = `Processing... ${percent}%`;

    if (percent === 100) {
        setTimeout(() => {
            domElements.uploadProgress.classList.add('hidden');
        }, 1000);
    }
}

function showError(message) {
    if (!domElements.errorMessages) return;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    domElements.errorMessages.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showInfo(message) {
    if (!domElements.errorMessages) return;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'info-message';
    infoDiv.textContent = message;
    domElements.errorMessages.appendChild(infoDiv);

    setTimeout(() => {
        infoDiv.remove();
    }, 3000);
}

// File Analysis Functions
async function extractImageMetadata(file) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const metadata = {
                dimensions: `${img.width}x${img.height}`,
                size: formatFileSize(file.size),
                type: file.type,
                lastModified: new Date(file.lastModified).toLocaleString()
            };
            resolve(metadata);
        };
        img.src = URL.createObjectURL(file);
    });
}

async function analyzeRFSpectrum(file) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const analysis = performRFAnalysis(imageData);
            resolve(analysis);
        };
        img.src = URL.createObjectURL(file);
    });
}

function performRFAnalysis(imageData) {
    const { data, width, height } = imageData;
    const patterns = detectSignalPatterns(data, width, height);
    
    return {
        frequencyRange: { min: 0, max: 6000 }, // MHz
        timeRange: { start: new Date(), end: new Date() },
        patterns,
        interpretation: interpretPatterns(patterns)
    };
}

function detectSignalPatterns(data, width, height) {
    const patterns = [];
    
    // Simple pattern detection based on color intensity
    let hasStrongSignal = false;
    let hasIntermittent = false;
    
    // Sample the middle row of pixels
    const middleRow = Math.floor(height / 2);
    for (let x = 0; x < width; x++) {
        const idx = (middleRow * width + x) * 4;
        const intensity = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        
        if (intensity > 200) hasStrongSignal = true;
        if (intensity > 150 && intensity <= 200) hasIntermittent = true;
    }
    
    if (hasStrongSignal) {
        patterns.push({
            type: 'continuous',
            frequency: '2.4 GHz',
            intensity: 'high',
            description: 'Strong continuous signal detected'
        });
    }
    
    if (hasIntermittent) {
        patterns.push({
            type: 'burst',
            frequency: '900 MHz',
            intensity: 'medium',
            description: 'Intermittent signal activity'
        });
    }
    
    return patterns;
}

function interpretPatterns(patterns) {
    if (patterns.length === 0) {
        return 'No significant RF patterns detected';
    }
    
    return patterns.map(pattern => {
        switch (pattern.type) {
            case 'continuous':
                return `Continuous ${pattern.intensity} intensity signal at ${pattern.frequency}`;
            case 'burst':
                return `Intermittent ${pattern.intensity} intensity signal at ${pattern.frequency}`;
            default:
                return pattern.description;
        }
    }).join('. ');
}

async function readTextFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Error reading file'));
        reader.readAsText(file);
    });
}

function analyzeText(content) {
    return {
        summary: summarizeText(content),
        entities: extractEntities(content),
        sentiment: analyzeSentiment(content)
    };
}

function summarizeText(text) {
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    return sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '...' : '');
}

function extractEntities(text) {
    const entities = {
        names: [],
        locations: [],
        organizations: []
    };

    // Simple name detection (capitalized words)
    const nameRegex = /[A-Z][a-z]+ [A-Z][a-z]+/g;
    entities.names = [...new Set(text.match(nameRegex) || [])];

    // Simple location detection (City, State format)
    const locationRegex = /[A-Z][a-z]+,\s*[A-Z]{2}/g;
    entities.locations = [...new Set(text.match(locationRegex) || [])];

    // Simple organization detection (capitalized words ending in common suffixes)
    const orgRegex = /[A-Z][a-z]+ (?:Inc\.|Corp\.|Ltd\.|LLC|Company)/g;
    entities.organizations = [...new Set(text.match(orgRegex) || [])];

    return entities;
}

function analyzeSentiment(text) {
    const positiveWords = ['good', 'great', 'excellent', 'positive', 'happy', 'success'];
    const negativeWords = ['bad', 'poor', 'negative', 'unhappy', 'terrible', 'fail'];

    const words = text.toLowerCase().split(/\W+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
}

// Preview Functions
function displayFilePreview(file, serverData) {
    if (!domElements.previewGrid) return;

    const preview = document.createElement('div');
    preview.className = 'preview-item';
    
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
        displayImagePreview(preview, file, serverData);
    } else {
        displayDocumentPreview(preview, file, serverData);
    }
    
    domElements.previewGrid.appendChild(preview);
}

function displayImagePreview(container, file, serverData) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(img.src);
    
    const info = document.createElement('div');
    info.className = 'file-info';
    info.innerHTML = `
        <strong>${file.name}</strong><br>
        Size: ${formatFileSize(file.size)}<br>
        Type: ${file.type}<br>
        ${serverData.isRFSpectrum ? '<strong>RF Spectrum Analysis Enabled</strong>' : ''}
    `;
    
    appendPreviewElements(container, img, info);
}

function displayDocumentPreview(container, file, serverData) {
    const icon = document.createElement('i');
    icon.className = 'fas fa-file-alt fa-3x';
    
    const info = document.createElement('div');
    info.className = 'file-info';
    info.innerHTML = `
        <strong>${file.name}</strong><br>
        Size: ${formatFileSize(file.size)}<br>
        Type: ${file.type}
    `;
    
    appendPreviewElements(container, icon, info);
}

function appendPreviewElements(container, preview, info) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-file';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.onclick = () => container.remove();
    
    container.appendChild(preview);
    container.appendChild(info);
    container.appendChild(removeBtn);
}

// Results Page Functions
function filterResults() {
    if (!domElements.resultsGrid) return;

    const searchTerm = domElements.searchInput.value.toLowerCase();
    const fileType = domElements.fileTypeFilter.value;
    const dateFilter = domElements.dateFilter.value;
    const minFreq = parseFloat(domElements.freqMin.value);
    const maxFreq = parseFloat(domElements.freqMax.value);

    const results = document.querySelectorAll('.result-card');
    let visibleCount = 0;

    results.forEach(result => {
        const matches = shouldShowResult(result, {
            searchTerm,
            fileType,
            dateFilter,
            minFreq,
            maxFreq
        });
        
        result.style.display = matches ? 'grid' : 'none';
        if (matches) visibleCount++;
    });

    updateNoResultsMessage(visibleCount === 0);
}

function shouldShowResult(result, filters) {
    const { searchTerm, fileType, dateFilter, minFreq, maxFreq } = filters;
    
    const text = result.textContent.toLowerCase();
    const isRfResult = result.classList.contains('rf-result');
    
    // Search term filter
    if (searchTerm && !text.includes(searchTerm)) return false;
    
    // File type filter
    if (fileType !== 'all') {
        if (fileType === 'rf' && !isRfResult) return false;
        if (fileType === 'image' && !result.classList.contains('image-result')) return false;
        if (fileType === 'document' && !result.classList.contains('document-result')) return false;
    }
    
    // RF frequency filter
    if (isRfResult && !isNaN(minFreq) && !isNaN(maxFreq)) {
        const freqMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:MHz|GHz)/);
        if (freqMatch) {
            const freq = parseFloat(freqMatch[1]);
            if (freq < minFreq || freq > maxFreq) return false;
        }
    }
    
    return true;
}

function updateNoResultsMessage(show) {
    const noResultsElement = document.getElementById('noResults');
    if (noResultsElement) {
        noResultsElement.style.display = show ? 'block' : 'none';
    }
}

function exportResults() {
    if (!domElements.resultsGrid) return;

    const results = Array.from(document.querySelectorAll('.result-card'))
        .filter(card => card.style.display !== 'none')
        .map(card => {
            const type = card.classList.contains('rf-result') ? 'RF Spectrum' :
                        card.classList.contains('document-result') ? 'Document' : 'Image';
            
            return {
                type,
                content: formatCardContent(card)
            };
        });

    if (results.length === 0) {
        showError('No results to export');
        return;
    }

    downloadText(formatExportText(results), 'osint-analysis-results.txt');
}

function formatCardContent(card) {
    const title = card.querySelector('h3')?.textContent || 'Untitled';
    const metadata = card.querySelector('.metadata-list')?.textContent || '';
    const analysis = card.querySelector('.analysis-content')?.textContent || '';
    
    return `${title}\n${metadata}\n${analysis}`.trim();
}

function formatExportText(results) {
    const timestamp = new Date().toISOString();
    const header = `OSINT Analysis Results\nExported: ${timestamp}\n${'='.repeat(50)}\n\n`;
    
    const content = results.map(result => (
        `Type: ${result.type}\n${'-'.repeat(20)}\n${result.content}\n\n`
    )).join('\n');
    
    return header + content;
}

function downloadText(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Utility Functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
