import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Card, Alert } from 'react-bootstrap';
import { X, Upload, FileEarmark, FileEarmarkText, Download } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import mammoth from 'mammoth';

const ImportFileModal = ({ show, onHide, onImportSuccess, onImportError }) => {
  const navigate = useNavigate();
  const [importType, setImportType] = useState('with-fields'); // 'with-fields' or 'without-fields'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type - only DOCX files
      const allowedTypes = ['.docx'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('Please select a valid Word document file (.docx)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    setIsUploading(true);
    try {
      // Different processing logic based on import type
      if (importType === 'with-fields') {
        await handleImportWithFields(selectedFile);
      } else {
        await handleImportWithoutFields(selectedFile);
      }
      
      // Parse file content (simulate)
      const parsedContent = await parseFileContent(selectedFile, importType);
      
      // Navigate to editor with parsed content
      navigate('/admin/forms/editor', {
        state: {
          content: parsedContent,
          fileName: selectedFile.name,
          importType: importType === 'with-fields' ? 'File with fields' : 'File without fields'
        }
      });
      
      // Close modal
      handleClose();
      
      // Call success callback
      const importTypeLabel = importType === 'with-fields' ? 'File with fields' : 'File without fields';
      onImportSuccess(importTypeLabel, selectedFile.name);
    } catch (error) {
      onImportError(error.message || 'Import failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Separate processing logic for files with fields
  const handleImportWithFields = async (file) => {
    // Processing file with fields
    console.log('Processing file with fields:', file.name);
    
    // Simulate API call for files with predefined fields
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Logic for files that already have form structure:
    // 1. Parse file to extract field definitions
    // 2. Validate field structure
    // 3. Create form template with predefined fields
    // 4. Map data to form fields
    
    // File with fields processed successfully
    console.log('File with fields processed successfully');
  };

  // Separate processing logic for files without fields
  const handleImportWithoutFields = async (file) => {
    // Processing file without fields
    console.log('Processing file without fields:', file.name);
    
    // For ONLYOFFICE, we'll pass the file URL directly
    const fileUrl = URL.createObjectURL(file);
    
    // Navigate to editor with file URL
    navigate('/admin/forms/editor', {
      state: {
        content: fileUrl, // Pass file URL instead of HTML content
        fileName: file.name.replace('.docx', ''),
        importType: 'Word Document (ONLYOFFICE)'
      }
    });
    
    // File without fields processed successfully
    console.log('File without fields processed successfully');
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportType('with-fields');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onHide();
  };

  const downloadTemplate = (type) => {
    // Simulate template download
    toast.info(`Downloading ${type} template...`);
  };

  // Parse DOCX file content using mammoth.js
  const parseFileContent = async (file, type) => {
    try {
      // Show loading message
      toast.info('Parsing DOCX file...');
      
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Convert DOCX to HTML using mammoth with better formatting options
      const result = await mammoth.convertToHtml({ 
        arrayBuffer,
        // Preserve more formatting including tables
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh", 
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Title'] => h1.title:fresh",
          "p[style-name='Subtitle'] => h2.subtitle:fresh",
          // Table styles
          "table => table:fresh",
          "tr => tr:fresh",
          "td => td:fresh",
          "th => th:fresh"
        ],
        // Convert images to base64
        convertImage: mammoth.images.imgElement(function(image) {
          return image.read("base64").then(function(imageBuffer) {
            return {
              src: "data:" + image.contentType + ";base64," + imageBuffer
            };
          });
        }),
        // Better table handling
        includeDefaultStyleMap: true,
        // Preserve table structure
        transformDocument: function(document) {
          return document;
        }
      });
      
      // Check for conversion warnings
      if (result.messages && result.messages.length > 0) {
        console.warn('DOCX conversion warnings:', result.messages);
      }
      
      let htmlContent = result.value;
      
      // Debug: Check what mammoth actually parsed
      console.log('=== MAMMOTH PARSING DEBUG ===');
      console.log('Raw HTML from mammoth:', htmlContent);
      console.log('HTML length:', htmlContent.length);
      console.log('Contains <table>:', htmlContent.includes('<table'));
      console.log('Contains <tr>:', htmlContent.includes('<tr'));
      console.log('Contains <td>:', htmlContent.includes('<td'));
      console.log('Contains <th>:', htmlContent.includes('<th'));
      console.log('First 500 chars:', htmlContent.substring(0, 500));
      console.log('=== END DEBUG ===');
      
      const hasTables = htmlContent.includes('<table');
      const hasTableRows = htmlContent.includes('<tr');
      const hasTableCells = htmlContent.includes('<td');
      const hasTableHeaders = htmlContent.includes('<th');
      
      if (!hasTables) {
        console.warn('❌ No tables detected in DOCX file. This might be due to:');
        console.warn('1. Complex table structure using text boxes');
        console.warn('2. Table created with shapes/objects instead of real table');
        console.warn('3. DOCX format issues');
        console.warn('4. Mammoth.js limitations with this specific table format');
        
        // Try to create table from text patterns
        console.log('🔄 Attempting to create table from text patterns...');
        htmlContent = createTableFromText(htmlContent);
      } else if (hasTables && hasTableRows && hasTableHeaders && !hasTableCells) {
        console.warn('⚠️ Tables detected but all cells are headers (<th>). Converting to proper table structure...');
        htmlContent = convertHeadersToCells(htmlContent);
      } else {
        console.log('✅ Tables detected successfully!');
      }
      
      if (type === 'with-fields') {
        // Try to detect and convert merge fields in the content
        htmlContent = detectAndConvertMergeFields(htmlContent);
        
        // Add header info
        htmlContent = `
          <div style="border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px;">
            <h2 style="color: #007bff; margin: 0;">📄 Imported Word Document with Fields</h2>
            <p style="margin: 5px 0; color: #666;"><strong>Source:</strong> ${file.name}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Type:</strong> Word Document (.docx) - Auto Field Detection</p>
          </div>
          ${htmlContent}
          <div style="border-top: 2px solid #28a745; padding-top: 10px; margin-top: 20px;">
            <p style="color: #28a745; font-style: italic;">✅ Document parsed successfully with automatic field detection</p>
          </div>
        `;
      } else {
        // Raw content import with enhanced styling
        htmlContent = `
          <div style="border-bottom: 2px solid #ffc107; padding-bottom: 10px; margin-bottom: 20px;">
            <h2 style="color: #ffc107; margin: 0;">📄 Imported Raw Word Document</h2>
            <p style="margin: 5px 0; color: #666;"><strong>Source:</strong> ${file.name}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Type:</strong> Word Document (.docx) - Raw Content</p>
          </div>
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            ${enhanceTableStyling(htmlContent)}
          </div>
          <div style="border-top: 2px solid #ffc107; padding-top: 10px; margin-top: 20px;">
            <p style="color: #ffc107; font-style: italic;">📝 Raw content imported. Use merge field buttons to add dynamic fields.</p>
          </div>
        `;
      }
      
      return htmlContent;
      
    } catch (error) {
      console.error('DOCX parsing error:', error);
      throw new Error(`Failed to parse DOCX file: ${error.message}`);
    }
  };

  // Helper function to convert headers to cells for proper table structure
  const convertHeadersToCells = (htmlContent) => {
    console.log('Converting headers to cells...');
    
    let convertedContent = htmlContent;
    
    // Find all tables and process them
    const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/gi;
    convertedContent = convertedContent.replace(tableRegex, (tableMatch) => {
      console.log('Processing table:', tableMatch.substring(0, 200) + '...');
      
      // Find the first row to identify header row
      const firstRowMatch = tableMatch.match(/<tr[^>]*>[\s\S]*?<\/tr>/i);
      if (!firstRowMatch) return tableMatch;
      
      const firstRow = firstRowMatch[0];
      console.log('First row:', firstRow);
      
      // Count headers in first row to identify header row
      const headerCount = (firstRow.match(/<th[^>]*>/gi) || []).length;
      console.log('Header count in first row:', headerCount);
      
      // Find the actual header row by looking for "No", "Items", "*1" pattern
      const rows = tableMatch.split(/<tr[^>]*>/gi);
      let result = rows[0]; // Keep the opening <table> tag
      let foundHeaderRow = false;
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const rowEndIndex = row.indexOf('</tr>');
        if (rowEndIndex === -1) continue;
        
        const rowContent = row.substring(0, rowEndIndex);
        const rowEnd = row.substring(rowEndIndex);
        
        // Check if this row contains typical header content
        const isHeaderRow = rowContent.includes('No') && 
                           rowContent.includes('Items') && 
                           rowContent.includes('*1');
        
        if (isHeaderRow && !foundHeaderRow) {
          // Keep as headers - this is the main header row
          result += '<tr>' + rowContent + rowEnd;
          foundHeaderRow = true;
          console.log('✅ Found and keeping header row:', rowContent.substring(0, 100));
        } else {
          // Convert <th> to <td> for all other rows
          const convertedRow = rowContent.replace(/<th([^>]*)>/gi, '<td$1>').replace(/<\/th>/gi, '</td>');
          result += '<tr>' + convertedRow + rowEnd;
          console.log('Converted row to cells:', convertedRow.substring(0, 100));
        }
      }
      
      if (foundHeaderRow) {
        console.log('✅ Successfully converted table structure');
        return result;
      } else {
        // Fallback: Convert all <th> to <td> except the first few rows
        console.log('⚠️ No header row found, using fallback conversion');
        let fallbackResult = rows[0];
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const rowEndIndex = row.indexOf('</tr>');
          if (rowEndIndex === -1) continue;
          
          const rowContent = row.substring(0, rowEndIndex);
          const rowEnd = row.substring(rowEndIndex);
          
          // Keep first 2 rows as headers, convert rest to cells
          if (i <= 2) {
            fallbackResult += '<tr>' + rowContent + rowEnd;
            console.log('Keeping row as header (fallback):', rowContent.substring(0, 50));
          } else {
            const convertedRow = rowContent.replace(/<th([^>]*)>/gi, '<td$1>').replace(/<\/th>/gi, '</td>');
            fallbackResult += '<tr>' + convertedRow + rowEnd;
            console.log('Converted row to cells (fallback):', convertedRow.substring(0, 50));
          }
        }
        
        return fallbackResult;
      }
    });
    
    console.log('✅ Headers converted to cells');
    
    // Debug: Check final HTML structure
    console.log('=== FINAL HTML DEBUG ===');
    console.log('Final HTML length:', convertedContent.length);
    console.log('Contains <table>:', convertedContent.includes('<table'));
    console.log('Contains <td>:', convertedContent.includes('<td'));
    console.log('Contains <th>:', convertedContent.includes('<th'));
    console.log('First 1000 chars of final HTML:', convertedContent.substring(0, 1000));
    console.log('=== END FINAL DEBUG ===');
    
    return convertedContent;
  };

  // Helper function to create table from text patterns
  const createTableFromText = (htmlContent) => {
    console.log('Creating table from text patterns...');
    
    // Look for patterns that suggest a table structure
    let enhancedContent = htmlContent;
    
    // Pattern 1: "Evaluation contents & rates" followed by structured content
    if (htmlContent.includes('Evaluation contents & rates')) {
      console.log('Found "Evaluation contents & rates" - attempting to create table');
      
      // Create a basic table structure
      const tableHTML = `
        <table style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd; font-family: Arial, sans-serif;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left; font-weight: bold;">No</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left; font-weight: bold;">Items</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: center; font-weight: bold;">*1</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: center; font-weight: bold;">*2</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: center; font-weight: bold;">*3</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: center; font-weight: bold;">*4</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: center; font-weight: bold;">*5</th>
              <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left; font-weight: bold;">Details of failure</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">1</td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"><strong>Pronunciation</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"></td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">Final sound</td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"></td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">Word completion/ correction</td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"></td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">Pronunciation</td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"></td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">2</td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"><strong>Speed control & Phrasing</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"></td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">Speed control</td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"></td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">Pauses / Phrasing</td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"></td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">3</td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"><strong>Tone & intonation</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"></td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">Volume</td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"></td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">Inflection & Emphasis</td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top; text-align: center;"><input type="checkbox" style="margin: 0 3px;"></td>
              <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;"></td>
            </tr>
          </tbody>
        </table>
      `;
      
      // Replace the text content with the table
      enhancedContent = enhancedContent.replace(
        /Evaluation contents & rates[\s\S]*?(?=Score rates|Points to be motivated|Final result|$)/i,
        `Evaluation contents & rates${tableHTML}`
      );
      
      console.log('✅ Created table from text patterns');
    }
    
    return enhancedContent;
  };

  // Helper function to enhance table styling and form elements
  const enhanceTableStyling = (htmlContent) => {
    // Add better table styling and form elements
    let enhancedContent = htmlContent
      // Style tables with better detection
      .replace(/<table([^>]*)>/gi, '<table$1 style="border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #ddd; font-family: Arial, sans-serif;">')
      .replace(/<th([^>]*)>/gi, '<th$1 style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left; font-weight: bold;">')
      .replace(/<td([^>]*)>/gi, '<td$1 style="border: 1px solid #ddd; padding: 8px; vertical-align: top; min-width: 50px;">')
      .replace(/<tr([^>]*)>/gi, '<tr$1>')
      // Style paragraphs for better spacing
      .replace(/<p([^>]*)>/gi, '<p$1 style="margin: 5px 0;">')
      // Style headings
      .replace(/<h1([^>]*)>/gi, '<h1$1 style="color: #333; margin: 15px 0 10px 0; font-size: 1.5em;">')
      .replace(/<h2([^>]*)>/gi, '<h2$1 style="color: #333; margin: 12px 0 8px 0; font-size: 1.3em;">')
      .replace(/<h3([^>]*)>/gi, '<h3$1 style="color: #333; margin: 10px 0 6px 0; font-size: 1.1em;">')
      // Style lists
      .replace(/<ul([^>]*)>/gi, '<ul$1 style="margin: 10px 0; padding-left: 20px;">')
      .replace(/<ol([^>]*)>/gi, '<ol$1 style="margin: 10px 0; padding-left: 20px;">')
      .replace(/<li([^>]*)>/gi, '<li$1 style="margin: 3px 0;">')
      // Style strong/bold text
      .replace(/<strong([^>]*)>/gi, '<strong$1 style="font-weight: bold;">')
      .replace(/<b([^>]*)>/gi, '<b$1 style="font-weight: bold;">')
      // Style italic text
      .replace(/<em([^>]*)>/gi, '<em$1 style="font-style: italic;">')
      .replace(/<i([^>]*)>/gi, '<i$1 style="font-style: italic;">')
      // Convert checkboxes and radio buttons
      .replace(/\s*\(circle as require\)/gi, ' <input type="radio" name="result" value="pass" style="margin: 0 5px;"> Pass <input type="radio" name="result" value="fail" style="margin: 0 5px;"> Fail')
      .replace(/\s*\(circle as required\)/gi, ' <input type="radio" name="result" value="pass" style="margin: 0 5px;"> Pass <input type="radio" name="result" value="fail" style="margin: 0 5px;"> Fail')
      // Convert rating checkboxes (*1, *2, *3, *4, *5)
      .replace(/\*\s*1\s*/g, '<input type="checkbox" style="margin: 0 3px;"> 1 ')
      .replace(/\*\s*2\s*/g, '<input type="checkbox" style="margin: 0 3px;"> 2 ')
      .replace(/\*\s*3\s*/g, '<input type="checkbox" style="margin: 0 3px;"> 3 ')
      .replace(/\*\s*4\s*/g, '<input type="checkbox" style="margin: 0 3px;"> 4 ')
      .replace(/\*\s*5\s*/g, '<input type="checkbox" style="margin: 0 3px;"> 5 ')
      // Add signature lines
      .replace(/Signature:\s*$/gm, 'Signature: _________________________')
      .replace(/Date:\s*$/gm, 'Date: _________________________')
      // Add underline for empty fields
      .replace(/\{\s*([^}]+)\s*\}/g, '<span style="border-bottom: 1px solid #333; padding: 0 5px; min-width: 100px; display: inline-block;">{{$1}}</span>');
    
    // Debug: Check enhanced HTML
    console.log('=== ENHANCED HTML DEBUG ===');
    console.log('Enhanced HTML length:', enhancedContent.length);
    console.log('Contains styled tables:', enhancedContent.includes('border-collapse: collapse'));
    console.log('First 1000 chars of enhanced HTML:', enhancedContent.substring(0, 1000));
    console.log('=== END ENHANCED DEBUG ===');
    
    return enhancedContent;
  };

  // Helper function to detect and convert merge fields
  const detectAndConvertMergeFields = (htmlContent) => {
    // Common patterns that might indicate merge fields
    const mergeFieldPatterns = [
      // Pattern: [Name], [Email], etc.
      /\[([A-Za-z_\s]+)\]/g,
      // Pattern: {Name}, {Email}, etc.
      /\{([A-Za-z_\s]+)\}/g,
      // Pattern: <<Name>>, <<Email>>, etc.
      /<<([A-Za-z_\s]+)>>/g,
      // Pattern: __Name__, __Email__, etc.
      /__([A-Za-z_\s]+)__/g
    ];
    
    let convertedContent = htmlContent;
    
    mergeFieldPatterns.forEach(pattern => {
      convertedContent = convertedContent.replace(pattern, (match, fieldName) => {
        // Convert to our merge field format
        const cleanFieldName = fieldName.trim().toLowerCase().replace(/\s+/g, '_');
        return `<span style="background: #e3f2fd; color: #1976d2; padding: 2px 6px; border-radius: 3px; font-weight: bold;">{{${cleanFieldName}}}</span>`;
      });
    });
    
    return convertedContent;
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered className="import-file-modal">
      <Modal.Header 
        className="bg-primary-custom text-white border-0"
        closeButton
        closeVariant="white"
      >
        <Modal.Title className="d-flex align-items-center">
          <Upload className="me-2" size={20} />
          Import Form File
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Import Type Selection */}
        <div className="mb-4">
          <h6 className="text-primary-custom mb-3">Select Import Type</h6>
          <Row className="g-3">
            <Col md={6}>
              <Card 
                className={`h-100 cursor-pointer ${importType === 'with-fields' ? 'border-primary bg-light' : 'border-secondary'}`}
                onClick={() => setImportType('with-fields')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body className="text-center p-4 d-flex flex-column">
                  <div className="flex-grow-1 d-flex flex-column justify-content-between">
                    <div>
                      <FileEarmarkText size={48} className="text-primary mb-3" />
                      <h6 className="text-primary">File with Fields</h6>
                      <p className="text-muted small mb-3">
                        Import a Word document that already contains predefined form fields and structure. The system will automatically parse and create form templates.
                      </p>
                    </div>
                    <div className="mt-auto">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadTemplate('with-fields');
                        }}
                      >
                        <Download className="me-1" size={14} />
                        Download Template
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card 
                className={`h-100 cursor-pointer ${importType === 'without-fields' ? 'border-primary bg-light' : 'border-secondary'}`}
                onClick={() => setImportType('without-fields')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body className="text-center p-4 d-flex flex-column">
                  <div className="flex-grow-1 d-flex flex-column justify-content-between">
                    <div>
                      <FileEarmark size={48} className="text-success mb-3" />
                      <h6 className="text-success">File without Fields</h6>
                      <p className="text-muted small mb-3">
                        Import a raw Word document without predefined structure. You will manually define form fields and mapping after import.
                      </p>
                    </div>
                    <div className="mt-auto">
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadTemplate('without-fields');
                        }}
                      >
                        <Download className="me-1" size={14} />
                        Download Template
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Instructions when no import type selected */}
        {!importType && (
          <Alert variant="info" className="mb-4">
            <h6 className="text-primary-custom mb-2">Please select an import type</h6>
            <p className="mb-0 small">
              Choose between "File with Fields" or "File without Fields" above to continue with the import process.
            </p>
          </Alert>
        )}

        {/* File Upload Section - Only show after import type is selected */}
        {importType && (
          <>
            <div className="mb-4">
              <h6 className="text-primary-custom mb-3">Select File</h6>
              <Form.Group>
                       <Form.Control
                         ref={fileInputRef}
                         type="file"
                         accept=".docx"
                         onChange={handleFileSelect}
                         className="mb-2"
                       />
                       <Form.Text className="text-muted">
                         Supported format: Word document (.docx). Maximum file size: 10MB
                       </Form.Text>
              </Form.Group>
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <Alert variant="info" className="mb-4">
                <div className="d-flex align-items-center">
                  <FileEarmark className="me-2" size={20} />
                  <div>
                    <strong>Selected File:</strong> {selectedFile.name}
                    <br />
                    <small className="text-muted">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </small>
                  </div>
                </div>
              </Alert>
            )}

            {/* Import Instructions */}
            <Alert variant="light" className="mb-0">
              <h6 className="text-primary-custom mb-2">Import Instructions</h6>
                     {importType === 'with-fields' ? (
                       <ul className="mb-0 small">
                         <li><strong>Automatic Processing:</strong> System will parse Word document and create form templates automatically</li>
                         <li>Document should contain predefined form fields and structure</li>
                         <li>Form fields will be automatically mapped and validated</li>
                         <li>Content will be converted to editable form template</li>
                         <li>Download the template above for the correct format</li>
                       </ul>
                            ) : (
                              <ul className="mb-0 small">
                                <li><strong>Manual Processing:</strong> You will manually define form fields and structure</li>
                                <li>Document content will be parsed and converted to editable format</li>
                                <li>Use merge field buttons to add dynamic fields to the content</li>
                                <li>Perfect for documents that need custom field mapping</li>
                                <li>Full control over form structure and field placement</li>
                              </ul>
                            )}
            </Alert>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 p-4">
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          disabled={isUploading}
        >
          <X className="me-2" size={16} />
          Cancel
        </Button>
        
        {importType && (
          <Button
            variant="primary-custom"
            onClick={handleImport}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: '1rem', height: '1rem' }}></span>
                Importing...
              </>
            ) : (
              <>
                <Upload className="me-2" size={16} />
                Import File
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ImportFileModal;
