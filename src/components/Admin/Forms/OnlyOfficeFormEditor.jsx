import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import EditorWithCustomFields from './EditorWithCustomFields';
import EditorWithMergeFields from './EditorWithMergeFields';
import { uploadAPI } from '../../../api';
// import apiClient from '../../../api/config.js'; // Temporarily disabled - polling is off
import { API_CONFIG } from '../../../config/api.js';

  
const OnlyOfficeFormEditor = ({
  initialContent = '',
  fileName = 'Untitled Document',
  readOnly = false,
  showMergeFields = true,
  importType = '',
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [editor, setEditor] = useState(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [showCustomFieldsPanel] = useState(true);
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
                    
                    console.log('🔍 DEBUG: Starting insert field with style preservation');
                    
                    // Method 1: Use Search() to find range containing current sentence, then get style
                    let oTextPr = null;
                    try {
                      // Get current sentence text
                      const currentSentenceText = oDocument.GetCurrentSentence();
                      console.log('🔍 DEBUG: Current sentence text:', JSON.stringify(currentSentenceText));
                      
                      // Only use Search() if sentence text is meaningful (not just spaces)
                      const trimmedText = currentSentenceText && typeof currentSentenceText === 'string' 
                        ? currentSentenceText.trim() 
                        : '';
                      
                      if (trimmedText && trimmedText.length > 0) {
                        // Use Search() to find the range containing this text
                        try {
                          // Search for the sentence text in document
                          const searchResults = oDocument.Search(trimmedText);
                          console.log('🔍 DEBUG: Search results count:', searchResults?.length);
                          
                          if (searchResults && searchResults.length > 0 && searchResults.length < 10) {
                            // Only use if not too many results (to avoid wrong match)
                            // Get the first result (should be the one at cursor)
                            const oRange = searchResults[0];
                            console.log('✅ DEBUG: Got range from search');
                            
                            // Try to get paragraph from range
                            try {
                              const oParagraph = oRange.GetParagraph(0);
                              console.log('✅ DEBUG: Got paragraph from range');
                              
                              // Try to get text properties from range
                              try {
                                // Get text properties from the range itself
                                oTextPr = oRange.GetTextPr();
                                console.log('✅ DEBUG: Got TextPr from range');
                                
                                // Check if TextPr has bold - if cursor is in non-bold text, don't apply bold
                                try {
                                  // eslint-disable-next-line no-undef
                                  const tempRun = Api.CreateRun();
                                  tempRun.SetTextPr(oTextPr);
                                  const isBold = tempRun.GetBold();
                                  console.log('🔍 DEBUG: TextPr has bold:', isBold);
                                  
                                  // If bold is true but we're inserting at a non-bold position,
                                  // we might want to remove bold. But let's keep it for now
                                  // and only apply if the sentence text itself is meaningful
                                } catch {
                                  // Ignore
                                }
                              } catch (e1) {
                                console.warn('⚠️ DEBUG: GetTextPr() from range failed:', e1);
                                
                                // Try to get from paragraph
                                try {
                                  // Try GetElement() to get runs from paragraph
                                  const paraElementCount = oParagraph.GetElementsCount();
                                  console.log('🔍 DEBUG: Paragraph has', paraElementCount, 'elements');
                                  
                                  if (paraElementCount > 0) {
                                    // Get the last element (run) - closest to cursor
                                    const lastRun = oParagraph.GetElement(paraElementCount - 1);
                                    console.log('✅ DEBUG: Got last run from paragraph');
                                    
                                    if (lastRun && lastRun.GetTextPr) {
                                      oTextPr = lastRun.GetTextPr();
                                      console.log('✅ DEBUG: Got TextPr from last run');
                                    }
                                  }
                                } catch (e2) {
                                  console.warn('⚠️ DEBUG: GetElement() from paragraph failed:', e2);
                                }
                              }
                            } catch (e3) {
                              console.warn('⚠️ DEBUG: GetParagraph() from range failed:', e3);
                            }
                          } else {
                            console.warn('⚠️ DEBUG: Too many search results or no results, skipping style copy');
                          }
                        } catch (searchError) {
                          console.warn('⚠️ DEBUG: Search() failed:', searchError);
                        }
                      } else {
                        console.log('⚠️ DEBUG: Sentence text is empty or only spaces, will not copy style');
                        console.log('⚠️ DEBUG: Will use default style (no bold)');
                      }
                      
                      if (!oTextPr) {
                        console.warn('⚠️ DEBUG: Could not find TextPr, will insert without style');
                      }
                    } catch (error) {
                      console.warn('⚠️ DEBUG: Error getting style:', error);
                    }
                    
                    // Create new paragraph with text
                    // eslint-disable-next-line no-undef
                    const oNewParagraph = Api.CreateParagraph();
                    
                    if (oTextPr) {
                      console.log('✅ DEBUG: Using copied TextPr for style');
                      // Create run with copied style
                      // eslint-disable-next-line no-undef
                      const oRun = Api.CreateRun();
                      // eslint-disable-next-line no-undef
                      oRun.AddText(Asc.scope.__templateText);
                      oRun.SetTextPr(oTextPr); // Apply the copied style
                      oNewParagraph.AddElement(oRun);
                    } else {
                      console.log('⚠️ DEBUG: No TextPr found, creating default TextPr (no bold)');
                      // Create a new TextPr with default style (no bold)
                      // eslint-disable-next-line no-undef
                      const oDefaultTextPr = Api.CreateTextPr();
                      // Explicitly set bold to false to ensure no bold
                      oDefaultTextPr.SetBold(false);
                      
                      // Create run with default style
                      // eslint-disable-next-line no-undef
                      const oRun = Api.CreateRun();
                      // eslint-disable-next-line no-undef
                      oRun.AddText(Asc.scope.__templateText);
                      oRun.SetTextPr(oDefaultTextPr); // Apply default style (no bold)
                      oNewParagraph.AddElement(oRun);
                      console.log('✅ DEBUG: Created run with default style (no bold)');
                    }
                    
                    // Insert with isInline = true
                    console.log('🔍 DEBUG: Inserting content with isInline=true');
                    oDocument.InsertContent([oNewParagraph], true);
                    console.log('✅ DEBUG: Insert completed');
                    
                  } catch (error) {
                    console.error('❌ DEBUG: Error inside callCommand:', error);
                    console.error('❌ DEBUG: Error details:', {
                      message: error.message,
                      stack: error.stack,
                      name: error.name
                    });
                    
                    // Final fallback: simple paragraph
                    try {
                      console.log('🔄 DEBUG: Trying fallback method...');
                      // eslint-disable-next-line no-undef
                      const oDocument = Api.GetDocument();
                      // eslint-disable-next-line no-undef
                      const oParagraph = Api.CreateParagraph();
                      // eslint-disable-next-line no-undef
                      oParagraph.AddText(Asc.scope.__templateText);
                      oDocument.InsertContent([oParagraph], true);
                      console.log('✅ DEBUG: Fallback method succeeded');
                    } catch (fallbackError) {
                      console.error('❌ DEBUG: All methods failed:', fallbackError);
                      throw fallbackError;
                    }
                  }
                 }, function() {
                   // Success callback - no toast notification needed
                 }, function(error) {
                   console.error('❌ DEBUG: callCommand error callback:', error);
                   toast.error('Failed to insert field: ' + (error?.message || 'Unknown error'));
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
      console.log('   Content-Type: application/json');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('📦 EXPECTED CALLBACK BODY (for reference only):');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('⚠️ QUAN TRỌNG: Đây là body MONG ĐỢI, KHÔNG PHẢI body thực tế!');
      console.log('⚠️ Frontend KHÔNG THỂ thấy body thực tế vì POST callback đi trực tiếp từ OnlyOffice → Backend');
      console.log('⚠️ Body thực tế chỉ có thể thấy trong Backend logs');
      console.log('═══════════════════════════════════════════════════════════');
      
      // Log expected body in multiple formats for easy comparison
      const expectedBody = {
        key: documentKey,
        status: 6, // 6 = Document saved, 2 = Document saved with errors, 3 = Document saving error
        url: 'https://documentserver/url-to-edited-document.docx' // OnlyOffice will replace with actual URL
      };
      
      console.log('📋 Expected Body Structure (Frontend tạo ra để tham khảo):');
      console.log(JSON.stringify(expectedBody, null, 2));
      console.log('');
      console.log('📋 Expected Body (One-line JSON - copy để so sánh với Backend logs):');
      console.log(JSON.stringify(expectedBody));
      console.log('');
      console.log('📋 Giải thích các fields:');
      console.log('   - key:', documentKey, '← DocumentKey của session này (Backend sẽ nhận key này)');
      console.log('   - status: 6 ← Status code (6 = Document saved, OnlyOffice sẽ gửi status thực tế)');
      console.log('   - url: "https://documentserver/..." ← PLACEHOLDER, OnlyOffice sẽ thay bằng URL thực tế');
      console.log('');
      console.log('📋 Status Codes có thể nhận được từ OnlyOffice:');
      console.log('   - 0: No errors, document is being edited');
      console.log('   - 1: Document is being saved');
      console.log('   - 2: Document is saved with errors');
      console.log('   - 3: Document saving error has occurred');
      console.log('   - 4: Document is closed with no changes');
      console.log('   - 6: Document is being saved, document state is saved ← Mong đợi status này');
      console.log('   - 7: Error has occurred while force saving the document');
      console.log('');
      console.log('💡 Cách verify callback hoạt động:');
      console.log('   1. Check Backend logs sau khi click Submit');
      console.log('   2. Tìm POST request đến /media/docs/onlyoffice/callback');
      console.log('   3. So sánh body trong Backend logs với expected body ở trên');
      console.log('   4. Nếu key khớp và status là 6 hoặc 2 → Callback đã hoạt động!');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔑 DocumentKey for this session:', documentKey);
      console.log('⚠️ LƯU Ý: POST callback được gửi TRỰC TIẾP từ OnlyOffice Server → Backend');
      console.log('⚠️ Frontend KHÔNG THỂ thấy POST request này (không có trong Network tab)');
      console.log('⚠️ Chỉ có thể verify bằng cách check Backend logs');
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
      console.log('⏳ Step 3: OnlyOffice will send POST callback to backend...');
      console.log('   → OnlyOffice will POST to:', `${API_CONFIG.BASE_URL}/media/docs/onlyoffice/callback`);
      console.log('   → Backend should receive callback with documentKey:', documentKey);
      console.log('   → After backend processes, it will store the edited file URL');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('⏸️ POLLING DISABLED - Check backend logs to verify callback');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('💡 To verify callback:');
      console.log('   1. Check backend logs for POST /media/docs/onlyoffice/callback');
      console.log('   2. Verify backend received callback with documentKey:', documentKey);
      console.log('   3. Check if backend processed and uploaded file to S3');
      console.log('═══════════════════════════════════════════════════════════');
      toast.info('Document save triggered. Check backend logs to verify callback.');
      
      // Polling is temporarily disabled
      // Return null to indicate polling was skipped
      return null;
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
