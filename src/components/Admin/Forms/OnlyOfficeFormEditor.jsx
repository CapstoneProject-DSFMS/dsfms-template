import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import MergeFieldsPanel from './MergeFieldsPanel';

const OnlyOfficeFormEditor = ({
  initialContent = '',
  fileName = 'Untitled Document',
  readOnly = false,
  mergeFields = [],
  showMergeFields = true,
  showImportInfo = false,
  importType = '',
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [editor, setEditor] = useState(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const isInitialized = useRef(false);
  const editorRef = useRef(null);

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
        const documentKey = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
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
              forcesave: false,
              comments: false,
              help: false,
              hideRightMenu: false
            },
            mode: 'edit'
          },
          // JWT Token for OnlyOffice Cloud - Official format
          token: jwtToken,
          // Events configuration - CORRECT WAY according to documentation
          events: {
            onAppReady: () => {
              console.log('✅ OnlyOffice Document Editor is ready');
              setIsEditorReady(true);
              toast.success('Document editor loaded successfully!');
            },
            onDocumentReady: () => {
              console.log('✅ Document is loaded');
              toast.success('Document loaded successfully!');
            },
            onError: (event) => {
              console.error('❌ OnlyOffice Error:', event);
              toast.error('Error loading document: ' + event.data?.errorDescription || 'Unknown error');
            },
            onDocumentStateChange: (event) => {
              console.log('📄 Document state changed:', event);
            },
            onInfo: (event) => {
              console.log('ℹ️ OnlyOffice opened in mode:', event.data?.mode);
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

  const handleInsertField = (fieldName) => {
    if (editor && isEditorReady) {
      try {
        console.log('🔧 Attempting to insert field at cursor position:', fieldName);
        
        // Debug: Check editor state and available methods
        console.log('🔍 Editor debug info:', {
          editor: !!editor,
          isEditorReady,
          editorMethods: Object.getOwnPropertyNames(editor),
          hasInsertTextAtCursor: typeof editor.insertTextAtCursor,
          hasInsertText: typeof editor.insertText,
          hasExecuteCommand: typeof editor.executeCommand,
          hasServiceCommand: typeof editor.serviceCommand
        });
        
        // Method 0: Focus editor first (important for OnlyOffice Dev)
        try {
          const iframe = document.getElementById('onlyoffice-editor');
          if (iframe && iframe.contentWindow) {
            iframe.focus();
            console.log('✅ Focused editor iframe');
            
             // Try to click inside the editor to ensure cursor is active
             const clickEvent = new MouseEvent('click', {
               bubbles: true,
               cancelable: true,
               view: iframe.contentWindow,
               passive: true
             });
             iframe.contentWindow.dispatchEvent(clickEvent);
            console.log('✅ Clicked inside editor');
          }
        } catch (e) {
          console.log('❌ Failed to focus editor:', e);
        }
        
            // Method 0: Try OnlyOffice Automation API - createConnector (Official Automation API)
            if (typeof editor.createConnector === 'function') {
              try {
                const connector = editor.createConnector();
                console.log('🔗 Created connector:', connector);
                console.log('🔍 Connector methods:', connector ? Object.getOwnPropertyNames(connector) : 'No connector');
                console.log('🔍 Connector prototype methods:', connector ? Object.getOwnPropertyNames(Object.getPrototypeOf(connector)) : 'No connector');
                console.log('🔍 Connector events:', connector.events);
                console.log('🔍 Connector isConnected:', connector.isConnected);
                console.log('🔍 Connector frame:', connector.frame);
                
                // Enable key events first (as per documentation)
                if (typeof editor.asc_enableKeyEvents === 'function') {
                  try {
                    editor.asc_enableKeyEvents(true);
                    console.log('✅ Enabled key events for focus');
                  } catch (e) {
                    console.log('❌ Failed to enable key events:', e);
                  }
                }
                
                // Wait a bit for connector to be ready
                setTimeout(() => {
                  console.log('⏰ Connector ready after delay');
                }, 100);
            
            // ONLY OnlyOffice Automation API - Official method
            if (connector && connector.isConnected) {
              try {
                console.log('🔧 Using OnlyOffice Automation API - callCommand (Official method)...');
                
                // Set the fieldName in Asc.scope for the command function
                // eslint-disable-next-line no-undef
                Asc.scope.fieldName = fieldName;
                
                connector.callCommand(function() {
                  // eslint-disable-next-line no-undef
                  const oDocument = Api.GetDocument();
                  // eslint-disable-next-line no-undef
                  const oParagraph = Api.CreateParagraph();
                  // eslint-disable-next-line no-undef
                  oParagraph.AddText(`{{${Asc.scope.fieldName}}}`);
                  oDocument.InsertContent([oParagraph]);
                 }, function() {
                   console.log('✅ Used OnlyOffice Automation API - callCommand successfully');
                   // Use requestAnimationFrame for better performance
                   requestAnimationFrame(() => {
                     toast.success(`Inserted {{${fieldName}}} field at cursor position`);
                   });
                 });
                
                return;
              } catch (e) {
                console.log('❌ OnlyOffice Automation API - callCommand failed:', e);
                toast.error('Failed to insert field using OnlyOffice Automation API');
              }
            }
          } catch (e) {
            console.log('❌ createConnector failed:', e);
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

  return (
    <div className={`onlyoffice-form-editor ${className}`}>
      <div className="p-0">
        {showImportInfo && (
          <Alert variant="info" className="mb-0 rounded-0">
            You are editing an imported form: <strong>{importType}</strong>
          </Alert>
        )}

        <Row className="g-0">
          {/* OnlyOffice Editor */}
          <Col md={showMergeFields ? 9 : 12}>
            <div className="p-3 h-100">
              
              {/* OnlyOffice Editor Container */}
              <div 
                id="onlyoffice-editor" 
                style={{ 
                  width: '100%', 
                  height: '90vh',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
          </Col>

          {/* Merge Fields Panel - Moved to right side */}
          {showMergeFields && (
            <Col md={3} className="border-start">
              <MergeFieldsPanel
                mergeFields={mergeFields}
                onInsertField={handleInsertField}
                readOnly={readOnly}
                className="h-100"
              />
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

export default OnlyOfficeFormEditor;
