import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import EditorWithCustomFields from './EditorWithCustomFields';
import EditorWithMergeFields from './EditorWithMergeFields';
import { uploadAPI } from '../../../api';
import apiClient from '../../../api/config.js';
import { API_CONFIG } from '../../../config/api.js';

  
const OnlyOfficeFormEditor = ({
  initialContent = '',
  fileName = 'Untitled Document',
  readOnly = false,
  showMergeFields = true,
  showImportInfo = false,
  importType = '',
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [editor, setEditor] = useState(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [showCustomFieldsPanel, setShowCustomFieldsPanel] = useState(true);
  const isInitialized = useRef(false);
  const editorRef = useRef(null);
  const exportResolverRef = useRef(null);
  const documentKeyRef = useRef(null); // Store documentKey for callback flow

  // Memoize cleanup function to avoid dependency issues
  const cleanupEditor = useCallback(() => {
    isInitialized.current = false;
    if (editorRef.current) {
      try {
        // Destroy editor instance if it exists
        if (typeof editorRef.current.destroy === 'function') {
          editorRef.current.destroy();
        }
      } catch (error) {
        console.warn('Error destroying editor:', error);
      }
    }
  }, []); // Empty dependency array to prevent infinite loop

  // Track when initialContent changes - but don't reset loading state
  useEffect(() => {
    console.log('🔄 initialContent changed:', initialContent);
    // Don't reset loading state here to avoid infinite loops
  }, [initialContent]);

  // OnlyOffice Cloud Configuration - Updated URL and JWT Secret
  // Cloud URL: https://c1e7e7aa.docs.onlyoffice.com
  const ONLYOFFICE_SECRET = 'bd9aaaaddaf94061b51e976a8fd335ce';
  

  // Generate JWT token for OnlyOffice Cloud - Hardcoded approach
  const generateJWTToken = async (payload) => {
    try {
      // Simple JWT creation for testing
      const header = {
        alg: 'HS256',
        typ: 'JWT'
      };
      
      // Encode header and payload
      const encodedHeader = btoa(JSON.stringify(header))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
        
      const encodedPayload = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      // Create signature using crypto API
      const message = `${encodedHeader}.${encodedPayload}`;
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(ONLYOFFICE_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
      const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      const jwt = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
      
      console.log('🔑 Generated JWT Token (Hardcoded):', jwt);
      return jwt;
    } catch (error) {
      console.error('Error generating JWT token:', error);
      return null;
    }
  };


  useEffect(() => {
    // Only initialize once when we have content
    if (!initialContent || initialContent.trim() === '') {
      console.log('⚠️ No content provided, setting loading to false');
      setIsLoading(false);
      return;
    }
    
    // Prevent multiple initializations
    if (isInitialized.current) {
      console.log('⚠️ Editor already initialized, skipping...');
      return;
    }
    
    isInitialized.current = true;
    
    const loadOnlyOfficeEditor = async () => {
      try {
        // Wait for OnlyOffice API to load with retry mechanism
        let retryCount = 0;
        const maxRetries = 10;
        
        const waitForDocsAPI = () => {
          return new Promise((resolve, reject) => {
            const checkAPI = () => {
              if (typeof window.DocsAPI !== 'undefined') {
                resolve();
              } else if (retryCount < maxRetries) {
                retryCount++;
                console.log(`⏳ Waiting for OnlyOffice API... (${retryCount}/${maxRetries})`);
                setTimeout(checkAPI, 500);
              } else {
                reject(new Error('OnlyOffice API failed to load after 5 seconds'));
              }
            };
            checkAPI();
          });
          
        };
        
        await waitForDocsAPI();
        console.log('✅ OnlyOffice API loaded successfully');
        
        // Debug: Check DocsAPI structure
        console.log('🔍 DocsAPI structure:', {
          DocsAPI: typeof window.DocsAPI,
          DocEditor: typeof window.DocsAPI?.DocEditor,
          hasEvents: typeof window.DocsAPI?.DocEditor?.prototype?.events
        }); 

        // OnlyOffice configuration with hardcoded JWT
        // Generate random documentKey for callback flow
        const documentKey = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        documentKeyRef.current = documentKey; // Store for later use
        
        console.log('🔑 Generated documentKey for callback:', documentKey);
        
        // Generate JWT token using official OnlyOffice documentation format
        const jwtPayload = {
          document: {
            key: documentKey,
            permissions: {
              comment: false,
              copy: true,
              download: true,
              edit: true,
              fillForms: true,
              modifyContentControl: true,
              modifyFilter: true,
              print: true,
              review: false
            },
            url: initialContent
          },
          editorConfig: {
            mode: 'edit',
            user: {
              id: 'test-user',
              name: 'Test User'
            }
          }
        };
        
        const jwtToken = await generateJWTToken(jwtPayload);
        
        // Add callbackUrl conditionally (OnlyOffice Cloud Dev may not support it)
        // Set to false to disable callbackUrl if OnlyOffice Cloud Dev doesn't support it
        const ENABLE_CALLBACK_URL = true; // Set to false if editor fails to load
        const CALLBACK_URL = `${API_CONFIG.BASE_URL}/media/docs/onlyoffice/callback`;
        
        if (ENABLE_CALLBACK_URL) {
          console.log('📡 Adding callbackUrl:', CALLBACK_URL);
        } else {
          console.log('⚠️ callbackUrl is DISABLED (OnlyOffice Cloud Dev may not support it)');
        }
        
        // Build config with callbackUrl at top-level (not in editorConfig)
        const config = {
          document: {
            fileType: 'docx',
            key: documentKey,
            title: fileName,
            url: initialContent, // S3 URL from backend
            permissions: {
              comment: false,
              copy: true,
              download: true,
              edit: true,
              fillForms: true,
              modifyContentControl: true,
              modifyFilter: true,
              print: true,
              review: false
            }
          },
          documentType: 'word',
          editorConfig: {
            // OnlyOffice Cloud configuration
            user: {
              id: 'test-user',
              name: 'Test User'
            },
            customization: {
              autosave: false, // Disable autosave for testing
              forcesave: true, // Enable forcesave to trigger callbacks
              comments: false,
              help: false,
              hideRightMenu: false
            },
            mode: 'edit'
          },
          // Callback URL for OnlyOffice to send document save events
          // Note: callbackUrl should be at top-level, not in editorConfig
          // OnlyOffice Cloud Dev may not support this - set ENABLE_CALLBACK_URL = false if editor fails
          ...(ENABLE_CALLBACK_URL && { callbackUrl: CALLBACK_URL }),
          // JWT Token for OnlyOffice Cloud - Official format
          token: jwtToken,
          // Events configuration - CORRECT WAY according to documentation
          events: {
            onAppReady: () => {
              console.log('✅ OnlyOffice Document Editor is ready');
              setIsEditorReady(true);
            },
            onDocumentReady: () => {
              console.log('✅ Document is loaded');
              // Remove duplicate toast - already shown in onAppReady
            },
            onError: (event) => {
              console.error('❌ OnlyOffice Error:', event);
              console.error('❌ Error details:', {
                errorCode: event.data?.errorCode,
                errorDescription: event.data?.errorDescription,
                error: event.data?.error,
                fullEvent: event
              });
              toast.error('Error loading document: ' + (event.data?.errorDescription || event.data?.error || 'Unknown error'));
            },
            onDocumentStateChange: (event) => {
              console.log('📄 Document state changed:', event);
            },
            onInfo: (event) => {
              console.log('ℹ️ OnlyOffice opened in mode:', event.data?.mode);
            },
            onRequestSaveAs: async (event) => {
              try {
                const data = event?.data || {};
                console.log('═══════════════════════════════════════════════════════════');
                console.log('🧾 OnlyOffice Event: onRequestSaveAs');
                console.log('═══════════════════════════════════════════════════════════');
                console.log('📦 Event data received:', JSON.stringify(data, null, 2));
                console.log('ℹ️ This event is triggered when user saves document');
                console.log('⚠️ NOTE: This is a FRONTEND event, NOT the POST callback to backend');
                console.log('⚠️ POST callback to backend happens separately from OnlyOffice Server');
                
                // Try multiple possible URL fields
                const tempUrl = data.url 
                  || data.downloadUrl 
                  || data.fileUrl
                  || (Array.isArray(data.files) ? data.files[0]?.url : undefined)
                  || (data.file && data.file.url);
                
                console.log('🧾 Extracted temporary DOCX URL:', tempUrl);
                
                if (!tempUrl) {
                  console.warn('⚠️ onRequestSaveAs received but no URL found in payload');
                  console.warn('📋 Full event data:', JSON.stringify(data, null, 2));
                }
                
                if (exportResolverRef.current) {
                  if (tempUrl) {
                    exportResolverRef.current.resolve(tempUrl);
                  } else {
                    exportResolverRef.current.reject(new Error('onRequestSaveAs event received but no URL found'));
                  }
                  exportResolverRef.current = null;
                }
                console.log('═══════════════════════════════════════════════════════════');
              } catch (err) {
                console.error('❌ Error in onRequestSaveAs handler:', err);
                if (exportResolverRef.current) {
                  exportResolverRef.current.reject(err);
                  exportResolverRef.current = null;
                }
              }
            },
            onRequestSave: (event) => {
              // Also listen to onRequestSave (different event)
              try {
                const data = event?.data || {};
                console.log('═══════════════════════════════════════════════════════════');
                console.log('💾 OnlyOffice Event: onRequestSave');
                console.log('═══════════════════════════════════════════════════════════');
                console.log('📦 Event data received:', JSON.stringify(data, null, 2));
                console.log('ℹ️ This event is triggered when user saves document');
                console.log('⚠️ NOTE: This is a FRONTEND event, NOT the POST callback to backend');
                console.log('⚠️ POST callback to backend happens separately from OnlyOffice Server');
                const tempUrl = data.url || data.downloadUrl || data.fileUrl;
                if (tempUrl && exportResolverRef.current) {
                  console.log('✅ Using URL from onRequestSave:', tempUrl);
                  exportResolverRef.current.resolve(tempUrl);
                  exportResolverRef.current = null;
                }
                console.log('═══════════════════════════════════════════════════════════');
              } catch (err) {
                console.error('❌ Error in onRequestSave handler:', err);
              }
            }
          }
        };

        // Config and token logging removed to reduce console noise

        // Initialize OnlyOffice editor
        const docEditor = new window.DocsAPI.DocEditor('onlyoffice-editor', config);
        
        setEditor(docEditor);
        editorRef.current = docEditor;
        
        // Set loading to false immediately, events will handle ready state
        setIsLoading(false);

        // Events are now properly configured in the config object above
        // No need for separate event setup

         // Add global message listener for iframe communication
         const handleMessage = (event) => {
           if (event.data && event.data.type === 'insertText') {
             console.log('📝 Received insert text message:', event.data);
           }
         };
         
         window.addEventListener('message', handleMessage, { passive: true });
        
        // Cleanup listener on component unmount
        return () => {
          window.removeEventListener('message', handleMessage);
        };

      } catch (error) {
        console.error('Error initializing OnlyOffice editor:', error);
        toast.error('Failed to initialize editor');
        setIsLoading(false);
      }
    };

    // Load editor with the content
      loadOnlyOfficeEditor();
    
    // Cleanup function to prevent memory leaks
    return cleanupEditor;
  }, [initialContent, fileName, cleanupEditor]); // Include cleanupEditor dependency

  const handleInsertField = (fieldOrTemplate) => {
    if (editor && isEditorReady) {
      try {
        // Method 0: Try OnlyOffice Automation API - createConnector (Official Automation API)
        if (typeof editor.createConnector === 'function') {
          try {
            const connector = editor.createConnector();

            // Enable key events first (as per documentation)
            if (typeof editor.asc_enableKeyEvents === 'function') {
              try {
                editor.asc_enableKeyEvents(true);
              } catch {
                // Silent fail
              }
            }

            // ONLY OnlyOffice Automation API - Official method
            if (connector && connector.isConnected) {
              try {
                // Set the fieldName in Asc.scope for the command function
                // Support raw template text or plain field name
                // eslint-disable-next-line no-undef
                Asc.scope.__templateText =
                  typeof fieldOrTemplate === 'string' && fieldOrTemplate.includes('{')
                    ? fieldOrTemplate
                    : `{${fieldOrTemplate}}`;

                connector.callCommand(function() {
                  try {
                    // eslint-disable-next-line no-undef
                    const oDocument = Api.GetDocument();
                    // eslint-disable-next-line no-undef
                    const oParagraph = Api.CreateParagraph();
                    // eslint-disable-next-line no-undef
                    oParagraph.AddText(Asc.scope.__templateText);
                    oDocument.InsertContent([oParagraph]);
                  } catch (error) {
                    console.error('Error inside callCommand:', error);
                  }
                 }, function() {
                   requestAnimationFrame(() => {
                     toast.success('Inserted template at cursor position');
                   });
                 }, function(error) {
                   toast.error('Failed to insert field: ' + error.message);
                 });

                return;
              } catch {
                toast.error('Failed to insert field using OnlyOffice Automation API');
              }
            }
          } catch {
            // Silent fail
          }
        }

      } catch (error) {
        console.error('Error inserting field:', error);
        toast.error('Failed to insert field: ' + error.message);
      }
    } else if (!editor) {
      toast.warning('Editor not initialized yet');
    } else if (!isEditorReady) {
      toast.warning('Editor is still loading, please wait...');
    }
  };

  // Get documentKey for callback flow
  const getDocumentKey = useCallback(() => {
    return documentKeyRef.current;
  }, []);

  // Force save and poll for edited URL from backend
  const forceSaveAndPoll = useCallback(async () => {
    try {
      if (!editorRef.current || !isEditorReady) {
        throw new Error('Editor not ready');
      }

      const documentKey = documentKeyRef.current;
      if (!documentKey) {
        throw new Error('Document key not found');
      }

      console.log('═══════════════════════════════════════════════════════════');
      console.log('🚀 CALLBACK FLOW STARTED');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔄 Step 1: Triggering document save to send callback...');
      console.log('📡 Step 2: OnlyOffice will send POST callback to backend:');
      console.log('   URL:', `${API_CONFIG.BASE_URL}/media/docs/onlyoffice/callback`);
      console.log('   Method: POST');
      console.log('   Expected Body:', {
        key: documentKey,
        status: '2 or 6 (document saved)',
        url: 'https://documentserver/url-to-edited-document.docx'
      });
      console.log('🔑 DocumentKey:', documentKey);
      console.log('⚠️ NOTE: POST callback is sent DIRECTLY from OnlyOffice to Backend');
      console.log('⚠️ Frontend cannot intercept this POST request');
      console.log('⚠️ Check Backend logs to see if callback was received');
      console.log('═══════════════════════════════════════════════════════════');
      
      // Trigger save using available methods - this will cause OnlyOffice to send callback to backend
      let saveTriggered = false;
      
      // Method 1: Try downloadAs() - triggers onRequestSaveAs event
      if (typeof editorRef.current.downloadAs === 'function') {
        try {
          console.log('🔄 Attempting to trigger save via downloadAs("docx")...');
          console.log('   → This will trigger OnlyOffice to save document');
          console.log('   → OnlyOffice will then send POST callback to backend');
          editorRef.current.downloadAs('docx');
          saveTriggered = true;
          console.log('✅ downloadAs("docx") called successfully');
          console.log('   → Waiting for OnlyOffice to process and send POST callback...');
          console.log('   → POST callback will be sent to:', `${API_CONFIG.BASE_URL}/media/docs/onlyoffice/callback`);
          console.log('   → Frontend cannot see this POST request (it goes directly to backend)');
        } catch (e) {
          console.warn('⚠️ downloadAs() failed:', e);
        }
      }
      
      // Method 2: Try save() - triggers onRequestSave event
      if (!saveTriggered && typeof editorRef.current.save === 'function') {
        try {
          console.log('🔄 Attempting to trigger save via save()...');
          editorRef.current.save();
          saveTriggered = true;
          console.log('✅ save() called successfully');
        } catch (e) {
          console.warn('⚠️ save() failed:', e);
        }
      }
      
      // Method 3: Try downloadDocument() - alternative method
      if (!saveTriggered && typeof editorRef.current.downloadDocument === 'function') {
        try {
          console.log('🔄 Attempting to trigger save via downloadDocument()...');
          editorRef.current.downloadDocument();
          saveTriggered = true;
          console.log('✅ downloadDocument() called successfully');
        } catch (e) {
          console.warn('⚠️ downloadDocument() failed:', e);
        }
      }
      
      if (!saveTriggered) {
        throw new Error('No save method available. Tried: downloadAs(), save(), downloadDocument()');
      }
      
      console.log('✅ Save method triggered successfully!');
      console.log('⏳ Step 3: Waiting for OnlyOffice to send POST callback to backend...');
      console.log('   → OnlyOffice will POST to:', `${API_CONFIG.BASE_URL}/media/docs/onlyoffice/callback`);
      console.log('   → Backend should receive callback with documentKey:', documentKey);
      console.log('   → After backend processes, it will store the edited file URL');
      console.log('⏳ Step 4: Starting to poll backend for edited URL...');
      toast.info('Saving document... Please wait');

      const maxAttempts = 5; // 5 attempts = 5 seconds max
      const pollInterval = 1000; // 1 second between polls
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
        try {
          console.log(`🔄 Polling attempt ${attempt}/${maxAttempts} for documentKey: ${documentKey}`);
          
          const response = await apiClient.get(`/media/docs/onlyoffice/get-edited-url`);
          
          if (response.data?.url) {
            const s3Url = response.data.url;
            console.log('═══════════════════════════════════════════════════════════');
            console.log('✅ CALLBACK FLOW SUCCESS!');
            console.log('═══════════════════════════════════════════════════════════');
            console.log('✅ Step 5: Received edited URL from backend:', s3Url);
            console.log('📊 Callback flow status: ✅ HOẠT ĐỘNG');
            console.log('✅ This means:');
            console.log('   1. OnlyOffice sent POST callback to backend ✅');
            console.log('   2. Backend received and processed callback ✅');
            console.log('   3. Backend uploaded file to S3 ✅');
            console.log('   4. Backend returned S3 URL ✅');
            console.log('═══════════════════════════════════════════════════════════');
            toast.success('Document saved successfully!');
            return s3Url;
          } else if (response.data?.status === 'pending') {
            console.log(`⏳ Backend status: pending (attempt ${attempt}/${maxAttempts})`);
            // Continue polling
          } else if (response.data?.status === 'error') {
            throw new Error(response.data?.message || 'Backend returned error status');
          }
        } catch (pollError) {
          // If 404, continue polling (backend hasn't received callback yet)
          if (pollError.response?.status === 404) {
            console.log(`⏳ Backend hasn't received callback yet (attempt ${attempt}/${maxAttempts})`);
            console.log(`   → This means OnlyOffice hasn't sent POST callback yet, or backend endpoint doesn't exist`);
            if (attempt === 1) {
              console.log('   💡 TIP: Check backend logs to see if POST callback was received');
              console.log('   💡 TIP: Check if backend endpoint exists: POST /media/docs/onlyoffice/callback');
            }
            continue;
          }
          // For other errors, log but continue polling
          console.warn(`⚠️ Polling error (attempt ${attempt}):`, pollError.message);
        }
      }

      // Timeout - backend didn't return URL
      console.error('═══════════════════════════════════════════════════════════');
      console.error('❌ CALLBACK FLOW TIMEOUT');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('❌ Polling timeout: Backend did not return edited URL after 5 seconds');
      console.error('📊 Callback flow status: ❌ TIMEOUT');
      console.error('🔍 Possible reasons:');
      console.error('   1. OnlyOffice did NOT send POST callback to backend');
      console.error('      → Check OnlyOffice Cloud Dev supports callbackUrl');
      console.error('      → Check callbackUrl is correct:', `${API_CONFIG.BASE_URL}/media/docs/onlyoffice/callback`);
      console.error('   2. Backend did NOT receive POST callback');
      console.error('      → Check backend logs for POST /media/docs/onlyoffice/callback');
      console.error('      → Check backend endpoint exists and is accessible');
      console.error('   3. Backend received callback but did NOT process it');
      console.error('      → Check backend callback handler code');
      console.error('   4. Backend processed but endpoint GET /media/docs/onlyoffice/get-edited-url does NOT exist');
      console.error('      → Check backend has this endpoint');
      console.error('═══════════════════════════════════════════════════════════');
      throw new Error('Timeout: Backend did not return edited URL. Please check backend callback handler.');
    } catch (error) {
      console.error('❌ Force save and poll failed:', error);
      toast.error(`Failed: ${error.message}`);
      throw error;
    }
  }, [isEditorReady]);

  // Expose export method to child panels - returns temp URL
  // Try both downloadAs() and forceSave() methods
  const exportEditedDoc = useCallback(() => {
    return new Promise((resolve, reject) => {
      try {
        if (!editorRef.current) {
          reject(new Error('Editor not initialized'));
          return;
        }

        exportResolverRef.current = { resolve, reject };
        
        // Method 1: Try forceSave() first (more reliable with forcesave enabled)
        if (typeof editorRef.current.downloadDocument === 'function') {
          console.log('🔄 Attempting export via downloadDocument()...');
          try {
            editorRef.current.downloadDocument();
          } catch (e) {
            console.warn('downloadDocument() failed, trying downloadAs()...', e);
          }
        }
        
        // Method 2: Try downloadAs() 
        if (typeof editorRef.current.downloadAs === 'function') {
          console.log('🔄 Attempting export via downloadAs("docx")...');
          try {
            editorRef.current.downloadAs('docx');
          } catch (e) {
            console.warn('downloadAs() failed:', e);
          }
        }

        // Method 3: Try direct forceSave via API
        if (typeof editorRef.current.save === 'function') {
          console.log('🔄 Attempting export via save()...');
          try {
            editorRef.current.save();
          } catch (e) {
            console.warn('save() failed:', e);
          }
        }

        // Timeout after 20 seconds (increased from 15)
        setTimeout(() => {
          if (exportResolverRef.current) {
            const error = new Error('Export timeout: onRequestSaveAs not received after 20s. OnlyOffice Cloud may not support this method without callbackUrl.');
            exportResolverRef.current.reject(error);
            exportResolverRef.current = null;
          }
        }, 20000);
      } catch (err) {
        if (exportResolverRef.current) {
          exportResolverRef.current.reject(err);
          exportResolverRef.current = null;
        } else {
          reject(err);
        }
      }
    });
  }, []);

  // Complete flow: Export → Fetch → Upload → Return S3 URL
  const exportAndUploadEditedDoc = useCallback(async () => {
    try {
      if (!editorRef.current || !isEditorReady) {
        throw new Error('Editor not ready');
      }

      toast.info('Exporting document...');
      
      // Step 1: Export and get temp URL
      const tempUrl = await exportEditedDoc();
      if (!tempUrl) {
        throw new Error('No temporary URL received from OnlyOffice');
      }

      console.log('📥 Got temp URL:', tempUrl);
      toast.info('Downloading file...');

      // Step 2: Fetch file from temp URL
      const response = await fetch(tempUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log('📦 Downloaded blob:', blob.size, 'bytes');

      // Step 3: Create File from Blob
      const fileNameWithExt = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
      const file = new File([blob], fileNameWithExt, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      toast.info('Uploading to S3...');

      // Step 4: Upload to S3 using existing API
      const docsType = uploadAPI.getDocsType(fileNameWithExt) || 'tem';
      const uploadResult = await uploadAPI.uploadDocument(file, docsType);

      // Step 5: Extract S3 URL from response
      console.log('📦 Upload API response:', uploadResult);
      
      let s3Url = null;
      if (uploadResult?.data?.[0]?.url) {
        s3Url = uploadResult.data[0].url;
        console.log('✅ Found S3 URL in uploadResult.data[0].url:', s3Url);
      } else if (uploadResult?.data?.url) {
        s3Url = uploadResult.data.url;
        console.log('✅ Found S3 URL in uploadResult.data.url:', s3Url);
      } else if (uploadResult?.url) {
        s3Url = uploadResult.url;
        console.log('✅ Found S3 URL in uploadResult.url:', s3Url);
      } else if (uploadResult?.fileUrl) {
        s3Url = uploadResult.fileUrl;
        console.log('✅ Found S3 URL in uploadResult.fileUrl:', s3Url);
      } else if (uploadResult?.path) {
        s3Url = uploadResult.path;
        console.log('✅ Found S3 URL in uploadResult.path:', s3Url);
      }

      if (!s3Url) {
        console.error('❌ Upload response structure:', JSON.stringify(uploadResult, null, 2));
        throw new Error('No S3 URL returned from upload API');
      }

      console.log('🎯 Final S3 URL to be used in templateContent:', s3Url);
      console.log('🌐 Full S3 URL:', s3Url);
      toast.success(`Document uploaded successfully!\nURL: ${s3Url}`);

      return s3Url;
    } catch (error) {
      console.error('❌ Export and upload failed:', error);
      toast.error(`Failed: ${error.message}`);
      throw error;
    }
  }, [exportEditedDoc, fileName, isEditorReady]);

  // Debug logging removed to prevent console spam

  if (isLoading) {
    return (
      <Card className={`border-neutral-200 shadow-sm ${className}`}>
        <Card.Body className="d-flex justify-content-center align-items-center" style={{ height: '600px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading OnlyOffice Editor...</p>
            <small className="text-muted">Loading document from S3...</small>
            <br />
            <small className="text-muted">Content: {initialContent ? 'Available' : 'Not available'}</small>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (!initialContent) {
    return (
      <Card className={`border-neutral-200 shadow-sm ${className}`}>
        <Card.Body className="d-flex justify-content-center align-items-center" style={{ height: '600px' }}>
          <div className="text-center">
            <Alert variant="warning">
              <strong>No Document URL</strong><br />
              Please upload a document first to use the editor.
            </Alert>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const handleAddCustomField = (field, options) => {
    // Check if field is an array (for update) or single field (for add)
    if (Array.isArray(field)) {
      setCustomFields(field);
      if (!options?.silent) toast.success('Fields updated successfully');
    } else {
      setCustomFields(prev => [...prev, field]);
      if (!options?.silent) toast.success(`Added field: ${field.label}`);
    }
  };

  const handleRemoveCustomField = (index) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
    toast.success('Field removed');
  };

  return (
    <div className={`onlyoffice-form-editor ${className}`}>
      <div className="p-0">
        {showImportInfo && (
          <Alert variant="info" className="mb-0 rounded-0">
            You are editing an imported form: <strong>{importType}</strong>
            {importType === 'File without fields' && (
              <div className="mt-2">
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setShowCustomFieldsPanel(!showCustomFieldsPanel)}
                >
                  {showCustomFieldsPanel ? 'Hide Custom Fields' : 'Show Custom Fields'}
                </button>
              </div>
            )}
          </Alert>
        )}

        <Row className="g-0" style={{ minHeight: '90vh' }}>
          {/* OnlyOffice Editor */}
          <Col md={showMergeFields && ((importType === 'File without fields' && showCustomFieldsPanel) || (importType !== 'File without fields')) ? 9 : 12}>
            <div className="p-3" style={{ height: '90vh' }}>
          <div className="d-flex justify-content-end mb-2" />
              
              {/* OnlyOffice Editor Container */}
              <div 
                id="onlyoffice-editor" 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
          </Col>

        {/* Merge Fields Flow (File with fields) - RIGHT sidebar */}
        {showMergeFields && importType !== 'File without fields' && (
          <Col md={3} className="border-start" style={{ overflow: 'hidden' }}>
            <div style={{ height: '90vh', overflowY: 'auto' }}>
              <EditorWithMergeFields
                onInsertField={handleInsertField}
                exportEditedDoc={exportEditedDoc}
                initialUrl={initialContent}
                readOnly={readOnly}
                className="h-100"
              />
            </div>
          </Col>
        )}

        {/* Custom Fields Flow (File without fields) - Collapsible */}
        {showMergeFields && importType === 'File without fields' && showCustomFieldsPanel && (
          <Col md={3} className="border-start">
            <div style={{ height: '90vh', overflowY: 'auto' }}>
              <EditorWithCustomFields
                customFields={customFields}
                onAddField={handleAddCustomField}
                onRemoveField={handleRemoveCustomField}
                onInsertField={handleInsertField}
                exportEditedDoc={exportEditedDoc}
                exportAndUploadEditedDoc={exportAndUploadEditedDoc}
                forceSaveAndPoll={forceSaveAndPoll}
                getDocumentKey={getDocumentKey}
                readOnly={readOnly}
                className="h-100"
              />
            </div>
          </Col>
        )}
        </Row>
      </div>
    </div>
  );
};

export default OnlyOfficeFormEditor;
