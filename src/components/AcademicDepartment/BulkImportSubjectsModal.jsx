import React, { useState, useRef } from 'react';
import { Modal, Button, Table, Card, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { X, Upload, FileEarmarkExcel, CheckCircle, XCircle, Download, Trash } from 'react-bootstrap-icons';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

const BulkImportSubjectsModal = ({ show, onClose, onImport, loading = false, courseId }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Required columns for subject import (based on database schema)
  const requiredColumns = [
    'code',
    'name',
    'course_id'
  ];

  // All possible columns (based on database schema)
  const allColumns = [
    'code',           // varchar (U) - Subject Code
    'name',           // varchar - Subject Name
    'course_id',      // uuid (FK) - Course ID
    'description',    // text - Description
    'method',         // enum - Training Method (E_LEARNING|CLASSROOM|ERO)
    'duration',       // integer - Duration in days
    'type',           // enum - Subject Type (UNLIMIT|RECURRENT)
    'room_name',      // varchar - Room Name
    'remark_note',    // varchar - Remark Note
    'time_slot',      // varchar - Time Slot
    'pass_score',     // float - Pass Score
    'start_date',     // datetime - Start Date
    'end_date',       // datetime - End Date
    'is_sim'          // boolean - Is SIM subject
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setErrors(['Please select a valid Excel file (.xlsx or .xls)']);
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB
      setErrors(['File size must be less than 100MB']);
      return;
    }

    setUploadedFile(file);
    setErrors([]);
    parseExcelFile(file);
  };

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          setErrors(['Excel file must contain at least a header row and one data row']);
          return;
        }

        const headers = jsonData[0].map(h => h?.toString().toLowerCase().trim());
        const dataRows = jsonData.slice(1);

        // Validate headers
        // If courseId is provided via props, course_id column is optional
        const columnsToCheck = courseId 
          ? requiredColumns.filter(col => col !== 'course_id')
          : requiredColumns;
        
        const missingColumns = columnsToCheck.filter(col => !headers.includes(col));
        if (missingColumns.length > 0) {
          setErrors([`Missing required columns: ${missingColumns.join(', ')}`]);
          return;
        }
        
        // If course_id is missing but courseId prop exists, add a warning
        if (courseId && !headers.includes('course_id')) {
          console.log('⚠️ course_id column not found in file, will use courseId from props:', courseId);
        }

        // Process data
        const subjects = dataRows.map((row, index) => {
          // Get course_id from file if exists, otherwise use courseId from props
          const courseIdFromFile = headers.includes('course_id') 
            ? row[headers.indexOf('course_id')]?.toString().trim() || ''
            : (courseId || '');

          const subject = {
            id: `temp_${index}`,
            rowNumber: index + 2,
            code: row[headers.indexOf('code')]?.toString().trim() || '',
            name: row[headers.indexOf('name')]?.toString().trim() || '',
            course_id: courseIdFromFile,
            description: row[headers.indexOf('description')]?.toString().trim() || '',
            method: row[headers.indexOf('method')]?.toString().trim() || 'THEORY',
            duration: row[headers.indexOf('duration')]?.toString().trim() || '',
            type: row[headers.indexOf('type')]?.toString().trim() || 'MANDATORY',
            room_name: row[headers.indexOf('room_name')]?.toString().trim() || '',
            remark_note: row[headers.indexOf('remark_note')]?.toString().trim() || '',
            time_slot: row[headers.indexOf('time_slot')]?.toString().trim() || '',
            pass_score: row[headers.indexOf('pass_score')]?.toString().trim() || '',
            // Handle dates - preserve original format (could be Date object, number, or string)
            start_date: (() => {
              const dateValue = row[headers.indexOf('start_date')];
              if (!dateValue) return '';
              // If it's a Date object, convert to ISO string
              if (dateValue instanceof Date) {
                return dateValue.toISOString().split('T')[0]; // YYYY-MM-DD format
              }
              // If it's a number (Excel serial number), keep as number for formatDate to handle
              if (typeof dateValue === 'number') {
                return dateValue;
              }
              // Otherwise, treat as string
              return String(dateValue).trim();
            })(),
            end_date: (() => {
              const dateValue = row[headers.indexOf('end_date')];
              if (!dateValue) return '';
              // If it's a Date object, convert to ISO string
              if (dateValue instanceof Date) {
                return dateValue.toISOString().split('T')[0]; // YYYY-MM-DD format
              }
              // If it's a number (Excel serial number), keep as number for formatDate to handle
              if (typeof dateValue === 'number') {
                return dateValue;
              }
              // Otherwise, treat as string
              return String(dateValue).trim();
            })(),
            is_sim: headers.includes('is_sim') || headers.includes('issim')
              ? row[headers.indexOf(headers.includes('is_sim') ? 'is_sim' : 'issim')]
              : undefined,
            hasError: false,
            errors: []
          };

          // Validate subject data
          if (!subject.code) {
            subject.hasError = true;
            subject.errors.push('Subject code is required');
          }

          if (!subject.name) {
            subject.hasError = true;
            subject.errors.push('Subject name is required');
          }

          // Only validate course_id if not provided via props
          if (!subject.course_id && !courseId) {
            subject.hasError = true;
            subject.errors.push('Course ID is required (either in file or must be importing from course detail page)');
          } else if (subject.course_id) {
            // Validate UUID format if course_id is provided
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(subject.course_id)) {
              subject.hasError = true;
              subject.errors.push('Course ID must be a valid UUID format');
            }
          }

          // Validate duration
          if (subject.duration && (isNaN(subject.duration) || parseInt(subject.duration) <= 0)) {
            subject.hasError = true;
            subject.errors.push('Duration must be a positive number');
          }

          // Validate pass_score
          if (subject.pass_score && (isNaN(subject.pass_score) || parseFloat(subject.pass_score) < 0 || parseFloat(subject.pass_score) > 100)) {
            subject.hasError = true;
            subject.errors.push('Pass score must be between 0 and 100');
          }

          // Normalize and validate method enum - BE expects E_LEARNING|CLASSROOM|ERO
          if (subject.method) {
            // Auto-fix common syntax errors: E-LEARNING -> E_LEARNING
            let normalizedMethod = subject.method.toUpperCase().trim();
            
            // Replace common variations
            if (normalizedMethod === 'E-LEARNING' || normalizedMethod === 'E LEARNING' || normalizedMethod === 'ELEARNING') {
              normalizedMethod = 'E_LEARNING';
            } else if (normalizedMethod === 'CLASSROOM' || normalizedMethod === 'CLASS ROOM' || normalizedMethod === 'CLASS-ROOM') {
              normalizedMethod = 'CLASSROOM';
            } else if (normalizedMethod === 'ERO') {
              normalizedMethod = 'ERO';
            }
            
            // Update subject with normalized method
            subject.method = normalizedMethod;
            
            // Validate against allowed values
            if (!['E_LEARNING', 'CLASSROOM', 'ERO'].includes(normalizedMethod)) {
            subject.hasError = true;
            subject.errors.push('Method must be E_LEARNING, CLASSROOM, or ERO');
            }
          }

          // Validate type enum - BE expects UNLIMIT|RECURRENT
          if (subject.type && !['UNLIMIT', 'RECURRENT'].includes(subject.type.toUpperCase())) {
            subject.hasError = true;
            subject.errors.push('Type must be UNLIMIT or RECURRENT');
          }

          // Validate dates - normalize to ISO datetime format for API
          // Keep original value for display, but validate format
          if (subject.start_date) {
            try {
              let parsedDate;
            
            // Check if it's an Excel serial number (numeric and large number)
            if (typeof subject.start_date === 'number' && subject.start_date > 10000) {
              // Convert Excel serial number to JavaScript Date
              const excelSerial = parseFloat(subject.start_date);
                parsedDate = new Date((excelSerial - 25569) * 86400 * 1000);
            } else {
                // Parse string format
              const dateStr = String(subject.start_date).trim();
                parsedDate = new Date(dateStr);
              }
              
              if (isNaN(parsedDate.getTime())) {
                subject.hasError = true;
                subject.errors.push('Start date must be a valid date');
              }
              // Keep original format for now, will be converted to ISO in formatDate function
            } catch (error) {
              subject.hasError = true;
              subject.errors.push('Start date must be a valid date');
            }
          }

          if (subject.end_date) {
            try {
              let parsedDate;
            
            // Check if it's an Excel serial number (numeric and large number)
            if (typeof subject.end_date === 'number' && subject.end_date > 10000) {
              // Convert Excel serial number to JavaScript Date
              const excelSerial = parseFloat(subject.end_date);
                parsedDate = new Date((excelSerial - 25569) * 86400 * 1000);
            } else {
                // Parse string format
              const dateStr = String(subject.end_date).trim();
                parsedDate = new Date(dateStr);
              }
              
              if (isNaN(parsedDate.getTime())) {
                subject.hasError = true;
                subject.errors.push('End date must be a valid date');
              }
              // Keep original format for now, will be converted to ISO in formatDate function
            } catch (error) {
              subject.hasError = true;
              subject.errors.push('End date must be a valid date');
            }
          }

          return subject;
        }).filter(subject => subject.code || subject.name); // Remove completely empty rows

        setPreviewData(subjects);
        setValidationErrors([]);

      } catch (error) {
        setErrors(['Failed to parse Excel file. Please check the file format.']);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportAll = async () => {
    const subjectsToImport = previewData.filter(subject => !subject.hasError);
    
    if (subjectsToImport.length === 0) {
      setErrors(['No valid subjects to import']);
      return;
    }

    // Validate that courseId is available if not in file
    if (!courseId) {
      const subjectsWithoutCourseId = subjectsToImport.filter(s => !s.course_id);
      if (subjectsWithoutCourseId.length > 0) {
        setErrors(['Course ID is required. Please ensure courseId is provided when importing from Course Detail page, or include course_id column in your Excel file.']);
        return;
      }
    }

    // Format data for API
    // ALWAYS prioritize courseId from props (if importing from Course Detail page)
    // Only use course_id from file if courseId prop is not available
    const formattedSubjects = subjectsToImport.map(subject => {
      // Parse isSIM - must be boolean, not null
      // Default to false if not provided
      let isSIM = false;
      const isSimValue = subject.is_sim !== undefined ? subject.is_sim : undefined;
      
      if (isSimValue !== undefined && isSimValue !== null && isSimValue !== '') {
        if (typeof isSimValue === 'string') {
          const normalized = isSimValue.toLowerCase().trim();
          isSIM = ['true', '1', 'yes', 'y'].includes(normalized);
        } else if (typeof isSimValue === 'boolean') {
          isSIM = isSimValue;
        } else if (typeof isSimValue === 'number') {
          isSIM = isSimValue !== 0;
        }
      }
      // If not provided, default to false (already set above)

      // Format dates - must be ISO datetime string or null (not empty string)
      const formatDate = (dateValue) => {
        if (!dateValue || dateValue === '' || dateValue === 'N/A') {
          return null; // Return null if empty, backend will accept null for optional dates
        }
        
        try {
          let parsedDate;
          
          // Handle different input formats
          if (typeof dateValue === 'string') {
            const dateStr = dateValue.trim();
            
            // Check if it's a numeric string that could be an Excel serial number
            // Excel serial numbers are typically between 1 (1900-01-01) and 100000 (2173-09-27)
            // For reasonable dates (2020-2100), Excel serial numbers are roughly 43831-80337
            if (/^\d+$/.test(dateStr)) {
              const numericValue = parseInt(dateStr);
              
              // Check if it looks like an Excel serial number (typically 1000-100000 for reasonable dates)
              // Excel serial number 1 = 1900-01-01
              // Excel serial number ~43831 = 2020-01-01
              // Excel serial number ~80337 = 2100-01-01
              if (numericValue >= 1 && numericValue <= 100000) {
                // It's likely an Excel serial number
                // Excel serial number: days since 1900-01-01
                // Conversion: (excelSerial - 25569) * 86400 * 1000
                // Where 25569 = days from 1900-01-01 to 1970-01-01 (Unix epoch)
                const excelSerial = numericValue;
                const daysSinceEpoch = excelSerial - 25569;
                const millisecondsSinceEpoch = daysSinceEpoch * 86400 * 1000;
                
                parsedDate = new Date(millisecondsSinceEpoch);
                
                // Validate the converted date is reasonable
                const year = parsedDate.getFullYear();
                if (year < 1900 || year > 2100) {
                  // Maybe it's not an Excel serial number, try parsing as timestamp or date string
                  console.warn('Excel serial number conversion resulted in unreasonable year:', year, 'for input:', dateStr);
                  parsedDate = new Date(dateStr);
                }
              } else {
                // Too large to be an Excel serial number, might be a timestamp
                parsedDate = new Date(numericValue < 1000000000000 ? numericValue * 1000 : numericValue);
              }
            }
            // If already in ISO format with time, use as is
            else if (dateStr.includes('T') && dateStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
              return dateStr;
            }
            // If in YYYY-MM-DD format, add time component to make it ISO datetime
            else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              // Parse as date and convert to ISO datetime (start of day in UTC)
              parsedDate = new Date(dateStr + 'T00:00:00.000Z');
            }
            // Try to parse as date string
            else {
              parsedDate = new Date(dateStr);
            }
          } else if (typeof dateValue === 'number') {
            // Handle Excel serial number
            // Excel serial numbers are typically between 1 and 100000
            if (dateValue >= 1 && dateValue <= 100000) {
              // Excel serial number: days since 1900-01-01
              // 25569 = days from 1900-01-01 to 1970-01-01
              parsedDate = new Date((dateValue - 25569) * 86400 * 1000);
            } else if (dateValue > 100000 && dateValue < 1000000000000) {
              // Might be a timestamp in seconds
              parsedDate = new Date(dateValue * 1000);
            } else {
              // Might be a timestamp in milliseconds
              parsedDate = new Date(dateValue);
            }
          } else {
            parsedDate = new Date(dateValue);
          }
          
          // Validate parsed date
          if (isNaN(parsedDate.getTime())) {
            console.warn('Invalid date value:', dateValue, 'type:', typeof dateValue);
            return null;
          }
          
          // Check if date is reasonable (between 1900 and 2100)
          const year = parsedDate.getFullYear();
          if (year < 1900 || year > 2100) {
            console.warn('Date out of reasonable range:', dateValue, '→', parsedDate.toISOString(), 'year:', year);
            return null;
          }
          
          // Return ISO datetime string: YYYY-MM-DDTHH:mm:ss.sssZ
          return parsedDate.toISOString();
        } catch (error) {
          console.error('Error formatting date:', dateValue, error);
          return null;
        }
      };

      // Format dates - return null if empty, otherwise ISO datetime
      const formattedStartDate = formatDate(subject.start_date);
      const formattedEndDate = formatDate(subject.end_date);

      // Build payload - only include date fields if they have valid values
      const payload = {
      code: subject.code,
      name: subject.name,
        // Always use courseId from props if available (importing from Course Detail page)
        // Otherwise, use course_id from file
        courseId: courseId ? String(courseId) : String(subject.course_id),
      description: subject.description || '',
      method: subject.method ? subject.method.toUpperCase() : 'CLASSROOM', // BE expects E_LEARNING|CLASSROOM|ERO
      duration: subject.duration ? parseInt(subject.duration) : 1,
      type: subject.type ? subject.type.toUpperCase() : 'UNLIMIT', // BE expects UNLIMIT|RECURRENT
        roomName: subject.room_name || '',
        remarkNote: subject.remark_note || '',
        timeSlot: subject.time_slot || '',
        passScore: subject.pass_score ? parseFloat(subject.pass_score) : 70,
        isSIM: isSIM // Must be boolean, not null
      };

      // Only add date fields if they have valid ISO datetime values
      // Backend requires ISO datetime format (YYYY-MM-DDTHH:mm:ss.sssZ)
      if (formattedStartDate) {
        payload.startDate = formattedStartDate;
      } else {
        // If date is required but empty, use default (start of day today)
        // Or leave it out if optional
        // For now, leave it out if empty (backend may accept missing dates)
      }
      
      if (formattedEndDate) {
        payload.endDate = formattedEndDate;
      } else {
        // If date is required but empty, use default (end of day today)
        // Or leave it out if optional
        // For now, leave it out if empty (backend may accept missing dates)
      }

      // Debug log for first subject
      if (subjectsToImport.indexOf(subject) === 0) {
        console.log('📅 Sample date formatting:', {
          originalStartDate: subject.start_date,
          formattedStartDate: formattedStartDate,
          originalEndDate: subject.end_date,
          formattedEndDate: formattedEndDate,
          payloadStartDate: payload.startDate,
          payloadEndDate: payload.endDate
        });
      }

      return payload;
    });

    try {
      const result = await onImport(formattedSubjects);
      
      // Log full response for debugging
      console.log('📦 Bulk Import Response:', result);
      console.log('📦 Response type:', typeof result);
      console.log('📦 Response keys:', result ? Object.keys(result) : 'null/undefined');
      
      // Handle different response formats
      // Format 1: { summary: { created, failed, total, skipped? } }
      // Format 2: { createdSubjects: [], failedSubjects: [], skippedSubjects?: [] }
      // Format 3: { message: "...", data: { ... } } (wrapped response)
      // Format 4: { message: "...", subjects: [...] } (success response without summary)
      // Format 5: null/undefined (POST 201 but no response body)
      
      // Normalize response - handle wrapped format
      let normalizedResult = result;
      if (result && result.data && typeof result.data === 'object') {
        normalizedResult = result.data;
      }
      
      // Extract counts from various possible formats
      const created = normalizedResult?.summary?.created ?? 
                     normalizedResult?.createdSubjects?.length ?? 
                     normalizedResult?.summary?.createdCount ??
                     (normalizedResult?.subjects?.length ?? 0); // If POST 201 returned subjects array
      const failed = normalizedResult?.summary?.failed ?? 
                     normalizedResult?.failedSubjects?.length ?? 
                     normalizedResult?.summary?.failedCount ??
                     0;
      const skipped = normalizedResult?.summary?.skipped ?? 
                      normalizedResult?.skippedSubjects?.length ?? 
                      normalizedResult?.summary?.skippedCount ??
                      0;
      const total = normalizedResult?.summary?.total ?? 
                    formattedSubjects.length;

      // IMPORTANT: If POST returned 201 (success) but no summary, assume all succeeded
      // This handles the case where backend returns 201 but doesn't provide detailed summary
      const hasSummary = normalizedResult?.summary || 
                        normalizedResult?.createdSubjects !== undefined ||
                        normalizedResult?.failedSubjects !== undefined;
      
      const isSuccessWithoutSummary = !hasSummary && 
                                      result !== null && 
                                      result !== undefined &&
                                      !result?.error &&
                                      !result?.message?.toLowerCase().includes('fail');

      if (isSuccessWithoutSummary) {
        // POST returned 201 but no summary - assume all succeeded
        toast.success(`Imported ${total}/${total} subjects successfully.`);
        handleClose();
        return;
      }

      // Check if response indicates subjects already exist (304 or empty response with no errors)
      const isAlreadyExists = (!normalizedResult || 
                                (created === 0 && failed === 0 && skipped === 0 && total === 0)) &&
                               !result?.error &&
                               normalizedResult?.message?.toLowerCase().includes('exist');

      if (isAlreadyExists || skipped > 0) {
        // Subjects already exist or were skipped
        if (skipped > 0) {
          toast.info(`${skipped} subject(s) already exist and were skipped. ${created > 0 ? `${created} new subject(s) were imported.` : ''}`);
        } else {
          toast.info('All subjects already exist. No new subjects were imported.');
        }
      } else if (created > 0 && failed === 0) {
        toast.success(`Imported ${created}/${total} subjects successfully.`);
      } else if (created > 0 && failed > 0) {
        toast.warn(`Imported ${created}/${total}. ${failed} failed. Check errors in the file or API response.`);
      } else if (created === 0 && failed > 0) {
        toast.error(`All ${failed}/${total} subjects failed to import.`);
      } else {
        // Fallback: POST likely succeeded (201) but response format unexpected
        // If we got here without error, assume success
        console.warn('⚠️ Unexpected response format, assuming success:', result);
        toast.success(`Imported ${total}/${total} subjects successfully.`);
      }

      handleClose();
    } catch (error) {
      // Handle 304 Not Modified specifically
      if (error?.response?.status === 304) {
        toast.info('All subjects already exist. No new subjects were imported.');
        handleClose();
      } else {
        console.error('❌ Bulk Import Error:', error);
        console.error('❌ Error Response:', error?.response?.data);
        toast.error(error?.response?.data?.message || error.message || 'Failed to import subjects.');
        setErrors([error?.response?.data?.message || error.message || 'Failed to import subjects. Please try again.']);
      }
    }
  };

  const handleClose = () => {
    setUploadedFile(null);
    setPreviewData([]);
    setErrors([]);
    setValidationErrors([]);
    setDragActive(false);
    onClose();
  };

  const getStatusIcon = (status) => {
    if (status === 'valid') {
      return <CheckCircle className="text-success" size={16} />;
    } else {
      return <XCircle className="text-danger" size={16} />;
    }
  };

  const downloadTemplate = () => {
    // Create sample data for template based on database schema
    const templateData = [
      allColumns, // Header row
      [
        'MATH101', // code
        'Mathematics', // name
        courseId || '550e8400-e29b-41d4-a716-446655440000', // course_id (UUID format)
        'Basic mathematics course covering algebra and geometry', // description
        'CLASSROOM', // method (BE expects E_LEARNING|CLASSROOM|ERO)
        '14', // duration
        'UNLIMIT', // type (BE expects UNLIMIT|RECURRENT)
        'Room A101', // room_name
        'This is a required course for all students', // remark_note
        '09:00-17:00', // time_slot
        '70.0', // pass_score
        '2025-01-15 09:00:00', // start_date
        '2025-01-29 17:00:00' // end_date
      ],
      [
        'PHYS101', // code
        'Physics', // name
        courseId || '550e8400-e29b-41d4-a716-446655440000', // course_id (UUID format)
        'Introduction to physics concepts and principles', // description
        'E_LEARNING', // method (BE expects E_LEARNING|CLASSROOM|ERO)
        '7', // duration
        'RECURRENT', // type (BE expects UNLIMIT|RECURRENT)
        'Lab B201', // room_name
        'Hands-on experiments and demonstrations', // remark_note
        '14:00-18:00', // time_slot
        '75.0', // pass_score
        '2025-02-01 14:00:00', // start_date
        '2025-02-08 18:00:00' // end_date
      ],
      [
        'SAFETY301', // code
        'Safety Procedures', // name
        courseId || '550e8400-e29b-41d4-a716-446655440000', // course_id (UUID format)
        'Emergency response and safety protocols training', // description
        'ERO', // method (BE expects E_LEARNING|CLASSROOM|ERO)
        '5', // duration
        'UNLIMIT', // type (BE expects UNLIMIT|RECURRENT)
        'Training Hall B', // room_name
        'Hands-on practical training required', // remark_note
        '08:00-16:00', // time_slot
        '80.0', // pass_score
        '2025-03-01 08:00:00', // start_date
        '2025-03-06 16:00:00' // end_date
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subjects');
    
    XLSX.writeFile(wb, 'Subject_Upload_Template.xlsx');
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header className="bg-primary-custom text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <Upload className="me-2" size={20} />
          Bulk Import Subjects
        </Modal.Title>
        <Button variant="link" onClick={handleClose} className="text-white p-0">
          <X size={24} />
        </Button>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        
        {/* Error Messages */}
        {errors.length > 0 && (
          <Alert variant="danger" className="mb-3">
            <ul className="mb-0">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* File Upload Section */}
        <Card className="mb-4">
          <Card.Body>
            <div
              className={`upload-area ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #dee2e6',
                borderRadius: '8px',
                padding: '3rem',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: dragActive ? '#f8f9fa' : '#fff',
                transition: 'all 0.3s ease'
              }}
            >
              <FileEarmarkExcel size={48} className="text-muted mb-3" />
              <h5 className="text-muted">Select or Drop your file here</h5>
              <p className="text-muted mb-0">File size up to 100MBs</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
            </div>

            <div className="mt-3 d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">
                  <strong>Required columns:</strong> Code, Name
                  {!courseId && <span>, Course ID (UUID format)</span>}
                </small>
                <br />
                <small className="text-muted">
                  <strong>Optional columns:</strong> Description, Method (E_LEARNING|CLASSROOM|ERO), Duration, Type (UNLIMIT|RECURRENT), Room Name, Remark Note, Time Slot, Pass Score, Start Date, End Date
                </small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={downloadTemplate}
                  className="d-flex align-items-center"
                >
                  <Download className="me-1" size={14} />
                  Download Template
                </Button>
                {uploadedFile && (
                  <div className="d-flex align-items-center">
                    <FileEarmarkExcel className="text-success me-2" size={16} />
                    <span className="text-success fw-semibold">{uploadedFile.name}</span>
                  </div>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Preview Table */}
        {previewData.length > 0 && (
          <Card>
            <Card.Header>
              <h6 className="mb-0">Preview Data ({previewData.length} records)</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <div 
                className="bulk-import-preview"
                style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  overflowX: 'auto'
                }}
              >
                <Table striped hover className="mb-0" style={{ minWidth: '1600px' }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ minWidth: '50px' }}>NO.</th>
                      <th style={{ minWidth: '120px' }}>CODE</th>
                      <th style={{ minWidth: '200px' }}>NAME</th>
                      <th style={{ minWidth: '200px' }}>COURSE ID</th>
                      <th style={{ minWidth: '150px' }}>METHOD</th>
                      <th style={{ minWidth: '100px' }}>DURATION</th>
                      <th style={{ minWidth: '120px' }}>TYPE</th>
                      <th style={{ minWidth: '100px' }}>PASS SCORE</th>
                      <th style={{ minWidth: '150px' }}>DESCRIPTION</th>
                      <th style={{ minWidth: '150px' }}>ROOM NAME</th>
                      <th style={{ minWidth: '150px' }}>TIME SLOT</th>
                      <th style={{ minWidth: '150px' }}>START DATE</th>
                      <th style={{ minWidth: '150px' }}>END DATE</th>
                      <th style={{ minWidth: '80px' }}>STATUS</th>
                      <th style={{ minWidth: '200px' }}>ERROR ENCOUNTERED</th>
                      <th style={{ minWidth: '80px' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((subject, index) => (
                      <tr key={subject.id} className={subject.hasError ? 'table-danger' : ''}>
                        <td>{subject.rowNumber || index + 1}</td>
                        <td>{subject.code || '-'}</td>
                        <td>{subject.name || '-'}</td>
                        <td>{subject.course_id || '-'}</td>
                        <td>{subject.method || '-'}</td>
                        <td>{subject.duration || '-'}</td>
                        <td>{subject.type || '-'}</td>
                        <td>{subject.pass_score || '-'}</td>
                        <td>{subject.description || '-'}</td>
                        <td>{subject.room_name || '-'}</td>
                        <td>{subject.time_slot || '-'}</td>
                        <td>{subject.start_date || '-'}</td>
                        <td>{subject.end_date || '-'}</td>
                        <td className="text-center">
                          {getStatusIcon(subject.hasError ? 'invalid' : 'valid')}
                        </td>
                        <td>
                          {subject.errors.length > 0 && (
                            <small className="text-danger">
                              {subject.errors.length > 1 ? `${subject.errors[0]} (+${subject.errors.length - 1} more)` : subject.errors[0]}
                            </small>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setPreviewData(prev => prev.filter(s => s.id !== subject.id));
                            }}
                          >
                            <Trash size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 p-4">
        <Button variant="outline-secondary" onClick={handleClose} disabled={loading}>
          <X className="me-2" size={16} />
          Cancel
        </Button>
        
        {previewData.length > 0 && (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="import-tooltip">
                Only {previewData.filter(s => !s.hasError).length}/{previewData.length} subjects will be imported into DSFMS
              </Tooltip>
            }
          >
            <Button
              variant="primary"
              onClick={handleImportAll}
              disabled={loading || previewData.filter(s => !s.hasError).length === 0}
            >
              {loading ? (
                <>
                  <span 
                    className="spinner-border me-2" 
                    role="status" 
                    aria-hidden="true"
                    style={{ 
                      width: '1rem', 
                      height: '1rem',
                      borderWidth: '0.15em'
                    }}
                  ></span>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="me-2" size={16} />
                  Import All ({previewData.filter(s => !s.hasError).length} subjects)
                </>
              )}
            </Button>
          </OverlayTrigger>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BulkImportSubjectsModal;
