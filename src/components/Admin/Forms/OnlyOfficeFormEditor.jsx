import { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { Alert, Card, Col, Row, Spinner, Dropdown, Modal, Button as BootstrapButton } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { uploadAPI } from '../../../api'
import CustomFieldsPanel from './CustomFieldsPanel'
import EditorWithMergeFields from './EditorWithMergeFields'
import { API_CONFIG } from '../../../config/api.js'
const CALLBACK_URL = `${API_CONFIG.BASE_URL}/media/docs/onlyoffice/callback`

const OnlyOfficeFormEditor = forwardRef(({
  initialContent = '',
  fileName = 'Untitled Document',
  readOnly = false,
  showMergeFields = true,
  importType = '',
    className = '',
  initialSections = null, // ← NEW prop to restore sections from draft
  onHasUnsavedChangesChange,
  onDraftSaved,
}, ref) => {
    const [isLoading, setIsLoading] = useState(true)
    const [editor, setEditor] = useState(null)
    const [isEditorReady, setIsEditorReady] = useState(false)
    const [customFields, setCustomFields] = useState([])
    const [showCustomFieldsPanel] = useState(true)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const hasUnsavedChangesRef = useRef(false) // Persist state across re-renders
    const isInitialized = useRef(false)
    const editorRef = useRef(null)
    const exportResolverRef = useRef(null)
    const documentKeyRef = useRef(null) // Store documentKey for callback flow
    
    // Expose downloadAs and save methods via ref
    useImperativeHandle(ref, () => ({
        downloadAs: (format = 'docx') => {
            if (editorRef.current && typeof editorRef.current.downloadAs === 'function') {
                editorRef.current.downloadAs(format)
            } else {
                throw new Error('Editor is not ready or downloadAs method is not available')
            }
        },
        save: () => {
            if (editorRef.current && typeof editorRef.current.save === 'function') {
                editorRef.current.save()
            } else {
                throw new Error('Editor is not ready or save method is not available')
            }
        },
        // Convenience method: save and download (ensures changes are saved before download)
        saveAndDownload: async (format = 'docx') => {
            if (!editorRef.current) {
                throw new Error('Editor is not ready')
            }

            // Step 1: Save first to ensure all changes are saved
            if (typeof editorRef.current.save === 'function') {
                console.log('💾 Step 1: Calling save() to save all changes...')
                editorRef.current.save()
                
                // Wait for save to complete
                await new Promise(resolve => setTimeout(resolve, 1000))
                console.log('✅ save() completed')
            }

            // Step 2: Download
            if (typeof editorRef.current.downloadAs === 'function') {
                console.log('💾 Step 2: Calling downloadAs() to get document URL...')
                editorRef.current.downloadAs(format)
            } else {
                throw new Error('downloadAs method is not available')
            }
        },
        // Expose function to build and submit draft template from CustomFieldsPanel
        buildAndSubmitDraftTemplate: async (draftUrl) => {
            if (addSystemFieldToSectionRef.current && typeof addSystemFieldToSectionRef.current.buildAndSubmitDraftTemplate === 'function') {
                return await addSystemFieldToSectionRef.current.buildAndSubmitDraftTemplate(draftUrl)
            } else {
                throw new Error('buildAndSubmitDraftTemplate function is not available')
            }
        }
    }), [])
    
    // Expose hasUnsavedChanges to parent via callback
    // Use useRef to store callback to avoid dependency issues
    const onHasUnsavedChangesChangeRef = useRef(onHasUnsavedChangesChange)
    const onDraftSavedRef = useRef(onDraftSaved)
    
    // Update refs when callbacks change
    useEffect(() => {
        onHasUnsavedChangesChangeRef.current = onHasUnsavedChangesChange
    }, [onHasUnsavedChangesChange])
    
    useEffect(() => {
        onDraftSavedRef.current = onDraftSaved
    }, [onDraftSaved])
    
    // Update ref when state changes
    useEffect(() => {
        hasUnsavedChangesRef.current = hasUnsavedChanges
    }, [hasUnsavedChanges])
    
    // Track if we're in Submit flow (to avoid calling onDraftSaved during Submit)
    const isSubmittingRef = useRef(false)
    
    // Ref to store Promise resolver for Submit flow to get URL from onDownloadAs
    const submitUrlResolverRef = useRef(null)
    
    // Track processed URLs to prevent duplicate handling (debounce mechanism)
    const processedUrlsRef = useRef(new Map()) // Map<url, timestamp>
    
    // Call callback after render to avoid "Cannot update component while rendering" warning
    useEffect(() => {
        // Use setTimeout to ensure this runs after render phase
        const timeoutId = setTimeout(() => {
            if (onHasUnsavedChangesChangeRef.current) {
                onHasUnsavedChangesChangeRef.current(hasUnsavedChanges)
            }
        }, 0)
        
        return () => clearTimeout(timeoutId)
    }, [hasUnsavedChanges])
    
    // Modal state for selecting section to add system mapped field
    const [showSectionModal, setShowSectionModal] = useState(false)
    const [selectedSystemField, setSelectedSystemField] = useState(null)
    const [availableSections, setAvailableSections] = useState([])
    const addSystemFieldToSectionRef = useRef(null) // Ref to function from CustomFieldsPanel

    // System Mapped Fields - Predefined fields that can be inserted into document
    const systemMappedFields = [
        { label: "Trainee's Full Name", variable: "{trainee_name}" },
        { label: "Trainee's Eid", variable: "{trainee_eid}" },
        { label: "Trainee's Nation", variable: "{trainee_nationality}" },
        { label: "Trainee's Batch Name", variable: "{training_batch}" },
        { label: "Course's Name", variable: "{course_name}" },
        { label: "Course's Code", variable: "{course_code}" },
        { label: "Subject's Name", variable: "{subject_name}" },
        { label: "Subject's Code", variable: "{subject_code}" },
        { label: "Assessing date", variable: "{assessment_date}" },
        { label: "Assessment Location", variable: "{assessment_venue}" },
        { label: "Instructor's Full Name", variable: "{trainer_name}" },
        { label: "Trainer's Eid", variable: "{trainer_eid}" },
        { label: "Template Name", variable: "{template_name}" }
    ]

  // Memoize cleanup function to avoid dependency issues
  const cleanupEditor = useCallback(() => {
        isInitialized.current = false
    if (editorRef.current) {
      try {
        // Destroy editor instance if it exists
        if (typeof editorRef.current.destroy === 'function') {
                    editorRef.current.destroy()
        }
      } catch (error) {
                console.warn('Error destroying editor:', error)
      }
    }
    }, []) // Empty dependency array to prevent infinite loop

  // Track when initialContent changes - but don't reset loading state
  useEffect(() => {
        console.log('🔄 initialContent changed:', initialContent)
    // Don't reset loading state here to avoid infinite loops
    }, [initialContent])

  // OnlyOffice Cloud Configuration - Updated URL and JWT Secret
  // Cloud URL: https://c1e7e7aa.docs.onlyoffice.com
    const ONLYOFFICE_SECRET = 'bd9aaaaddaf94061b51e976a8fd335ce'

  // Generate JWT token for OnlyOffice Cloud - Hardcoded approach
  const generateJWTToken = async (payload) => {
    try {
      // Simple JWT creation for testing
      const header = {
        alg: 'HS256',
                typ: 'JWT',
            }
      
      // Encode header and payload
      const encodedHeader = btoa(JSON.stringify(header))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
                .replace(/=/g, '')
        
      const encodedPayload = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
                .replace(/=/g, '')
      // Create signature using crypto API
            const message = `${encodedHeader}.${encodedPayload}`
            const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(ONLYOFFICE_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
            )

            const signature = await crypto.subtle.sign(
                'HMAC',
                key,
                encoder.encode(message)
            )
            const encodedSignature = btoa(
                String.fromCharCode(...new Uint8Array(signature))
            )
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
                .replace(/=/g, '')
      
            const jwt = `${encodedHeader}.${encodedPayload}.${encodedSignature}`
      
            console.log('🔑 Generated JWT Token (Hardcoded):', jwt)
            return jwt
    } catch (error) {
            console.error('Error generating JWT token:', error)
            return null
    }
    }

  useEffect(() => {
    // Only initialize once when we have content
    if (!initialContent || initialContent.trim() === '') {
            console.log('⚠️ No content provided, setting loading to false')
            setIsLoading(false)
            return
    }
    
    // Prevent multiple initializations
    if (isInitialized.current) {
            console.log('⚠️ Editor already initialized, skipping...')
            return
    }
    
        isInitialized.current = true
    
    const loadOnlyOfficeEditor = async () => {
      try {
        // Wait for OnlyOffice API to load with retry mechanism
                let retryCount = 0
                const maxRetries = 10
        
        const waitForDocsAPI = () => {
          return new Promise((resolve, reject) => {
            const checkAPI = () => {
              if (typeof window.DocsAPI !== 'undefined') {
                                resolve()
              } else if (retryCount < maxRetries) {
                                retryCount++
                                console.log(
                                    `⏳ Waiting for OnlyOffice API... (${retryCount}/${maxRetries})`
                                )
                                setTimeout(checkAPI, 500)
              } else {
                                reject(
                                    new Error(
                                        'OnlyOffice API failed to load after 5 seconds'
                                    )
                                )
                            }
                        }
                        checkAPI()
                    })
                }

                await waitForDocsAPI()
console.log('✅ OnlyOffice API loaded successfully')
        
        // Debug: Check DocsAPI structure
        console.log('🔍 DocsAPI structure:', {
          DocsAPI: typeof window.DocsAPI,
          DocEditor: typeof window.DocsAPI?.DocEditor,
                    hasEvents:
                        typeof window.DocsAPI?.DocEditor?.prototype?.events,
                })

        // OnlyOffice configuration with hardcoded JWT
                // Generate random documentKey for callback flow
                const documentKey = `doc-${Date.now()}-${Math.random()
                    .toString(36)
                    .substr(2, 9)}`
                documentKeyRef.current = documentKey // Store for later use

                console.log(
                    '🔑 Generated documentKey for callback:',
                    documentKey
                )
        
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
                            review: false,
            },
                        url: initialContent,
          },
          editorConfig: {
            mode: 'edit',
            user: {
              id: 'test-user',
                            name: 'Test User',
                        },
                        callbackUrl: CALLBACK_URL,
                    },
                }

                const jwtToken = await generateJWTToken(jwtPayload)

                // Add callbackUrl conditionally (OnlyOffice Cloud Dev may not support it)
                // Set to false to disable callbackUrl if OnlyOffice Cloud Dev doesn't support it
                const ENABLE_CALLBACK_URL = true // Set to false if editor fails to load

                if (ENABLE_CALLBACK_URL) {
                    console.log('📡 Adding callbackUrl:', CALLBACK_URL)
                } else {
                    console.log(
                        '⚠️ callbackUrl is DISABLED (OnlyOffice Cloud Dev may not support it)'
                    )
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
                            review: false,
                        },
          },
          documentType: 'word',
          editorConfig: {
            // OnlyOffice Cloud configuration
            user: {
              id: 'test-user',
                            name: 'Test User',
            },
            customization: {
              autosave: false, // Disable autosave for testing
                            forcesave: true, // Enable forcesave to trigger callbacks
              comments: false,
              help: false,
                            hideRightMenu: false,
            },
                        callbackUrl: ENABLE_CALLBACK_URL
                            ? CALLBACK_URL
                            : undefined,
                        mode: 'edit',
          },
                    // Callback URL for OnlyOffice to send document save events
                    // Note: callbackUrl should be at top-level, not in editorConfig
                    // OnlyOffice Cloud Dev may not support this - set ENABLE_CALLBACK_URL = false if editor fails
                    // ...(ENABLE_CALLBACK_URL && { callbackUrl: CALLBACK_URL }),
          // JWT Token for OnlyOffice Cloud - Official format
          token: jwtToken,
          // Events configuration - CORRECT WAY according to documentation
          events: {
            onAppReady: () => {
                            console.log(
                                '✅ OnlyOffice Document Editor is ready'
                            )
                            setIsEditorReady(true)
            },
            onDocumentReady: () => {
                            console.log('✅ Document is loaded')
                            // When document is ready, mark as potentially having unsaved changes
                            // This ensures warning shows if user tries to leave without saving
                            // We'll reset this flag when document is actually saved
                            setHasUnsavedChanges(true)
                            console.log('✅ Set hasUnsavedChanges = true (document ready, user can edit)')
            },
            onError: (event) => {
                            console.error('❌ OnlyOffice Error:', event)
                            console.error('❌ Error details:', {
                                errorCode: event.data?.errorCode,
                                errorDescription: event.data?.errorDescription,
                                error: event.data?.error,
fullEvent: event,
                            })
                            toast.error(
                                'Error loading document: ' +
                                    (event.data?.errorDescription ||
                                        event.data?.error ||
                                        'Unknown error')
                            )
            },
            onDocumentStateChange: (event) => {
                            console.log('📄 Document state changed:', event)
                            console.log('📄 Event data:', event.data)
                            // Track document changes - mark as unsaved when document is modified
                            // OnlyOffice onDocumentStateChange: 0 = ready, 1 = editing, 2 = saving, 3 = saved
                            if (event.data !== undefined && event.data !== null) {
                                const state = event.data
                                console.log('📄 Document state value:', state)
                                // If state is 1 (editing) or any non-zero value (document has changes), mark as unsaved
                                // State 0 = ready (no changes), 1 = editing (has changes), 2 = saving, 3 = saved
                                if (state === 1) {
                                    // Document is being edited - has unsaved changes
                                    console.log('✅ Marking document as having unsaved changes')
                                    setHasUnsavedChanges(true)
                                } else if (state === 0 || state === 3) {
                                    // Document is ready or saved - no unsaved changes
                                    // Note: We don't reset here because user might continue editing
                                    console.log('📄 Document state: ready/saved (state:', state, ')')
                                }
                            }
            },
            onInfo: (event) => {
                            console.log(
                                'ℹ️ OnlyOffice opened in mode:',
                                event.data?.mode
                            )
                        },
                        onDownloadAs: async (event) => {
                            try {
                                const data = event?.data || {}
                                console.log(
                                    '═══════════════════════════════════════════════════════════'
                                )
                                console.log(
                                    '💾 OnlyOffice Event: onDownloadAs'
                                )
                                console.log(
                                    '═══════════════════════════════════════════════════════════'
                                )
                                console.log(
                                    '📦 Event data received:',
                                    JSON.stringify(data, null, 2)
                                )
                                
                                // Extract URL from event data
                                // According to OnlyOffice docs, onDownloadAs provides URL in data.url
                                const downloadUrl =
                                    data.url ||
                                    data.downloadUrl ||
                                    data.fileUrl ||
                                    (Array.isArray(data.files)
                                        ? data.files[0]?.url
                                        : undefined) ||
                                    (data.file && data.file.url)

                                if (downloadUrl) {
                                    // CRITICAL: Check if we have a Submit resolver FIRST (only current instance has this)
                                    // This is the most reliable way to detect if we're in Submit flow from current instance
                                    // NOTE: We check resolver BEFORE documentKey to avoid issues with hot reload
                                    if (submitUrlResolverRef.current) {
                                        // We have a resolver - this is definitely Submit flow from current instance
                                        console.log('📤 This is a Submit flow - resolving Promise with URL')
                                        
                                        // Optional: Log documentKey for debugging (but don't block on mismatch)
                                        const currentDocKey = documentKeyRef.current
                                        const urlDocKeyMatch = downloadUrl.match(/doc-([^_/]+)/)
                                        const urlDocKey = urlDocKeyMatch ? urlDocKeyMatch[1] : null
                                        
                                        if (currentDocKey && urlDocKey) {
                                            const currentKeyStr = currentDocKey
                                            const urlKeyStr = `doc-${urlDocKey}`
                                            
                                            if (currentKeyStr !== urlKeyStr) {
                                                console.log('⚠️ Warning: URL documentKey does not match current, but resolving anyway (resolver exists)')
                                                console.log(`   Current: ${currentKeyStr}, URL: ${urlKeyStr}`)
                                                console.log('   This can happen during hot reload - resolving anyway because resolver exists')
                                            }
                                        }
                                        
                                        const resolver = submitUrlResolverRef.current
                                        submitUrlResolverRef.current = null // Clear immediately to prevent duplicate resolves
                                        resolver.resolve(downloadUrl)
                                        
                                        // Reset unsaved changes flag
                                        setHasUnsavedChanges(false)
                                        return // Exit early - don't process as Draft
                                    }
                                    
                                    // CRITICAL: Check Submit flag as fallback
                                    // If isSubmittingRef is true but no resolver, this might be from old instance
                                    if (isSubmittingRef.current) {
                                        // Submit flow but no resolver - likely from old instance or duplicate event
                                        console.log('⚠️ onDownloadAs event during Submit but no resolver - ignoring (likely from old instance)')
                                        return // Exit early - don't process as Draft
                                    }
                                    
                                    // We're NOT in Submit flow - this is a Draft save
                                    // BUT: Check sessionStorage FIRST to see if Submit is in progress
                                    // This prevents old instances from calling onDraftSaved during Submit
                                    try {
                                        const isSubmitting = sessionStorage.getItem('onlyoffice_submitting') === 'true'
                                        const submitDocKey = sessionStorage.getItem('onlyoffice_submit_docKey')
                                        
                                        if (isSubmitting && submitDocKey) {
                                            // Extract documentKey from URL
                                            let urlDocKey = null
                                            const shardkeyMatch = downloadUrl.match(/[?&]shardkey=([^&]+)/)
                                            if (shardkeyMatch) {
                                                urlDocKey = shardkeyMatch[1]
                                            } else {
                                                const pathMatch = downloadUrl.match(/doc-([^_/]+)/)
                                                if (pathMatch) {
                                                    urlDocKey = `doc-${pathMatch[1]}`
                                                }
                                            }
                                            
                                            // If documentKey matches, this is from Submit flow - don't call onDraftSaved
                                            if (urlDocKey && submitDocKey === urlDocKey) {
                                                console.log('⚠️ onDownloadAs: Ignoring Draft save - Submit in progress (sessionStorage check)')
                                                console.log(`   Submit docKey: ${submitDocKey}, URL docKey: ${urlDocKey}`)
                                                return // Exit early - don't call onDraftSaved
                                            }
                                        }
                                    } catch (e) {
                                        console.warn('⚠️ Error checking sessionStorage in onDownloadAs:', e)
                                        // Continue anyway
                                    }
                                    
                                    // We're NOT in Submit flow - this is a Draft save
                                    // Check documentKey match for Draft flow (to avoid processing events from old instances)
                                    const currentDocKey = documentKeyRef.current
                                    const urlDocKeyMatch = downloadUrl.match(/doc-([^_/]+)/)
                                    const urlDocKey = urlDocKeyMatch ? urlDocKeyMatch[1] : null
                                    
                                    // Only process events that match current documentKey for Draft flow
                                    if (currentDocKey && urlDocKey) {
                                        const currentKeyStr = currentDocKey
                                        const urlKeyStr = `doc-${urlDocKey}`
                                        
                                        // If keys don't match exactly, this is from an old instance - ignore
                                        if (currentKeyStr !== urlKeyStr) {
                                            console.log('⚠️ onDownloadAs event ignored - URL from old documentKey instance (Draft flow)')
                                            console.log(`   Current: ${currentKeyStr}, URL: ${urlKeyStr}`)
                                            return
                                        }
                                    }
                                    
                                    // We're NOT in Submit flow - this is a Draft save
                                    // Debounce: Check if we've already processed this URL recently (within 2 seconds)
                                    const now = Date.now()
                                    const lastProcessed = processedUrlsRef.current.get(downloadUrl)
                                    if (lastProcessed && (now - lastProcessed) < 2000) {
                                        console.log('⚠️ Duplicate onDownloadAs event ignored (debounced):', downloadUrl.substring(0, 50) + '...')
                                        return // Ignore duplicate event
                                    }
                                    
                                    // Mark this URL as processed
                                    processedUrlsRef.current.set(downloadUrl, now)
                                    
                                    // Clean up old entries (older than 5 seconds) to prevent memory leak
                                    for (const [url, timestamp] of processedUrlsRef.current.entries()) {
                                        if (now - timestamp > 5000) {
                                            processedUrlsRef.current.delete(url)
                                        }
                                    }
                                    
                                    console.log('✅ Download URL received:', downloadUrl)
                                    console.log('💾 This is a Draft save - calling onDraftSaved callback')
                                    
                                    // Draft flow: call onDraftSaved callback
                                    if (onDraftSavedRef.current && typeof onDraftSavedRef.current === 'function') {
                                        onDraftSavedRef.current(downloadUrl)
                                    }
                                    
                                    // Reset unsaved changes flag
                                    setHasUnsavedChanges(false)
                                } else {
                                    console.warn('⚠️ onDownloadAs received but no URL found in payload')
                                    if (isSubmittingRef.current && submitUrlResolverRef.current) {
                                        // Submit flow: reject the Promise
                                        const resolver = submitUrlResolverRef.current
                                        submitUrlResolverRef.current = null
                                        resolver.reject(new Error('No URL found in onDownloadAs event'))
                                    } else if (!isSubmittingRef.current) {
                                        // Draft flow: show warning
                                        toast.warning('Draft saved but URL not found')
                                    }
                                }
                            } catch (err) {
                                console.error('❌ Error in onDownloadAs handler:', err)
                                toast.error('Error processing draft save')
                            }
                        },
                        onRequestSaveAs: async (event) => {
                            try {
                                const data = event?.data || {}
                                console.log(
                                    '═══════════════════════════════════════════════════════════'
                                )
                                console.log(
                                    '🧾 OnlyOffice Event: onRequestSaveAs'
                                )
                                console.log(
                                    '═══════════════════════════════════════════════════════════'
                                )
                                console.log(
                                    '📦 Event data received:',
                                    JSON.stringify(data, null, 2)
                                )
                                console.log(
                                    'ℹ️ This event is triggered when user saves document'
                                )
                                console.log(
                                    '⚠️ NOTE: This is a FRONTEND event, NOT the POST callback to backend'
                                )
                                console.log(
                                    '⚠️ POST callback to backend happens separately from OnlyOffice Server'
                                )
                                
                                // Reset unsaved changes flag when document is saved
                                setHasUnsavedChanges(false)

                                // Try multiple possible URL fields
                                const tempUrl =
                                    data.url ||
                                    data.downloadUrl ||
                                    data.fileUrl ||
                                    (Array.isArray(data.files)
                                        ? data.files[0]?.url
                                        : undefined) ||
                                    (data.file && data.file.url)

                                console.log(
                                    '🧾 Extracted temporary DOCX URL:',
tempUrl
                                )

                                if (!tempUrl) {
                                    console.warn(
                                        '⚠️ onRequestSaveAs received but no URL found in payload'
                                    )
                                    console.warn(
                                        '📋 Full event data:',
                                        JSON.stringify(data, null, 2)
                                    )
                                }

                                if (exportResolverRef.current) {
                                    if (tempUrl) {
                                        exportResolverRef.current.resolve(
                                            tempUrl
                                        )
                                    } else {
                                        exportResolverRef.current.reject(
                                            new Error(
                                                'onRequestSaveAs event received but no URL found'
                                            )
                                        )
                                    }
                                    exportResolverRef.current = null
                                }
                                console.log(
                                    '═══════════════════════════════════════════════════════════'
                                )
                            } catch (err) {
                                console.error(
                                    '❌ Error in onRequestSaveAs handler:',
                                    err
                                )
                                if (exportResolverRef.current) {
                                    exportResolverRef.current.reject(err)
                                    exportResolverRef.current = null
                                }
                            }
                        },
                        onRequestSave: (event) => {
                            // Also listen to onRequestSave (different event)
                            try {
                                const data = event?.data || {}
                                console.log(
                                    '═══════════════════════════════════════════════════════════'
                                )
                                console.log(
                                    '💾 OnlyOffice Event: onRequestSave'
                                )
                                console.log(
                                    '═══════════════════════════════════════════════════════════'
                                )
                                console.log(
                                    '📦 Event data received:',
JSON.stringify(data, null, 2)
                                )
                                console.log(
                                    'ℹ️ This event is triggered when user saves document'
                                )
                                console.log(
                                    '⚠️ NOTE: This is a FRONTEND event, NOT the POST callback to backend'
                                )
                                console.log(
                                    '⚠️ POST callback to backend happens separately from OnlyOffice Server'
                                )
                                const tempUrl =
                                    data.url || data.downloadUrl || data.fileUrl
                                if (tempUrl && exportResolverRef.current) {
                                    console.log(
                                        '✅ Using URL from onRequestSave:',
                                        tempUrl
                                    )
                                    exportResolverRef.current.resolve(tempUrl)
                                    exportResolverRef.current = null
                                }
                                console.log(
                                    '═══════════════════════════════════════════════════════════'
                                )
                            } catch (err) {
                                console.error(
                                    '❌ Error in onRequestSave handler:',
                                    err
                                )
                            }
                        },
                    },
                }

        // Config and token logging removed to reduce console noise

        // Initialize OnlyOffice editor
                const docEditor = new window.DocsAPI.DocEditor(
                    'onlyoffice-editor',
                    config
                )
        
                setEditor(docEditor)
                editorRef.current = docEditor
        
        // Set loading to false immediately, events will handle ready state
                setIsLoading(false)

        // Events are now properly configured in the config object above
        // No need for separate event setup

         // Add global message listener for iframe communication
         const handleMessage = (event) => {
           if (event.data && event.data.type === 'insertText') {
                        console.log(
                            '📝 Received insert text message:',
                            event.data
                        )
           }
                }
         
                window.addEventListener('message', handleMessage, {
                    passive: true,
                })
        // Cleanup listener on component unmount
        return () => {
                    window.removeEventListener('message', handleMessage)
                }
      } catch (error) {
                console.error('Error initializing OnlyOffice editor:', error)
                toast.error('Failed to initialize editor')
                setIsLoading(false)
            }
        }

    // Load editor with the content
        loadOnlyOfficeEditor()
    
    // Cleanup function to prevent memory leaks
        return cleanupEditor
    }, [initialContent, fileName, cleanupEditor]) // Include cleanupEditor dependency

  const handleInsertField = (fieldOrTemplate) => {
    if (editor && isEditorReady) {
      try {
            // Method 0: Try OnlyOffice Automation API - createConnector (Official Automation API)
            if (typeof editor.createConnector === 'function') {
              try {
                        const connector = editor.createConnector()
                
                // Enable key events first (as per documentation)
                if (typeof editor.asc_enableKeyEvents === 'function') {
                  try {
                                editor.asc_enableKeyEvents(true)
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
                    typeof fieldOrTemplate === 'string' &&
                    fieldOrTemplate.includes('{')
                    ? fieldOrTemplate
                        : `{${fieldOrTemplate}}`

                connector.callCommand(
                    function () {
                  try {
                  // eslint-disable-next-line no-undef
                            const oDocument = Api.GetDocument()

                            // Method 1: Use Search() to find range containing current sentence, then get style
                            let oTextPr = null
                            try {
                                const currentSentenceText = oDocument.GetCurrentSentence()
                                const trimmedText =
                                    currentSentenceText &&
                                    typeof currentSentenceText === 'string'
                                        ? currentSentenceText.trim()
                                        : ''

                                if (trimmedText && trimmedText.length > 0) {
                                    try {
                                        const searchResults = oDocument.Search(trimmedText)

                                        if (
                                            searchResults &&
                                            searchResults.length > 0 &&
                                            searchResults.length < 10
                                        ) {
                                            const oRange = searchResults[0]

                                            try {
                                                const oParagraph = oRange.GetParagraph(0)

                                                try {
                                                    oTextPr = oRange.GetTextPr()
                                                } catch {
                                                    try {
                                                        const paraElementCount = oParagraph.GetElementsCount()

                                                        if (paraElementCount > 0) {
                                                            const lastRun = oParagraph.GetElement(paraElementCount - 1)

                                                            if (lastRun && lastRun.GetTextPr) {
                                                                oTextPr = lastRun.GetTextPr()
                                                            }
                                                        }
                                                    } catch {
                                                        // Ignore
                                                    }
                                                }
                                            } catch {
                                                // Ignore
                                            }
                                        }
                                    } catch {
                                        // Ignore
                                    }
                                }
                            } catch {
                                // Ignore
                            }

                            // Create new paragraph with text
                  // eslint-disable-next-line no-undef
                            const oNewParagraph = Api.CreateParagraph()

                            if (oTextPr) {
                                // Create run with copied style
                  // eslint-disable-next-line no-undef
                                const oRun = Api.CreateRun()
                                // eslint-disable-next-line no-undef
                                oRun.AddText(Asc.scope.__templateText)
                                oRun.SetTextPr(oTextPr)
                                oNewParagraph.AddElement(oRun)
                            } else {
                                // Create a new TextPr with default style (no bold)
                                // eslint-disable-next-line no-undef
                                const oDefaultTextPr = Api.CreateTextPr()
                                oDefaultTextPr.SetBold(false)

                                // Create run with default style
                                // eslint-disable-next-line no-undef
                                const oRun = Api.CreateRun()
                                // eslint-disable-next-line no-undef
                                oRun.AddText(Asc.scope.__templateText)
                                oRun.SetTextPr(oDefaultTextPr)
                                oNewParagraph.AddElement(oRun)
                            }

                            oDocument.InsertContent([oNewParagraph], true)
              } catch {
                            // Final fallback: simple paragraph
                            // eslint-disable-next-line no-undef
                            const oDocument = Api.GetDocument()
                    // eslint-disable-next-line no-undef
                            const oParagraph = Api.CreateParagraph()
                    // eslint-disable-next-line no-undef
                            oParagraph.AddText(Asc.scope.__templateText)
                            oDocument.InsertContent([oParagraph], true)
                        }
                    },
                    function () {
                        // Success callback
                    },
                    function (error) {
                        console.error('❌ Insert field error:', error)
                        toast.error(
                            'Failed to insert field: ' +
                                (error?.message || 'Unknown error')
                        )
                    }
                                )

                                return
              } catch {
                                toast.error(
                                    'Failed to insert field using OnlyOffice Automation API'
                                )
              }
            }
          } catch {
            // Silent fail
          }
        }
      } catch (error) {
                console.error('Error inserting field:', error)
                toast.error('Failed to insert field: ' + error.message)
      }
    } else if (!editor) {
            toast.warning('Editor not initialized yet')
    } else if (!isEditorReady) {
            toast.warning('Editor is still loading, please wait...')
        }
    }

    // Get documentKey for callback flow
    const getDocumentKey = useCallback(() => {
        return documentKeyRef.current
    }, [])

    // Handle system mapped field selection from dropdown
    const handleSystemFieldSelect = (field) => {
        if (!field || !field.variable) return
        
        // Store selected field temporarily
        setSelectedSystemField(field)
        
        // Get sections from CustomFieldsPanel via ref
        if (addSystemFieldToSectionRef.current && typeof addSystemFieldToSectionRef.current.getSections === 'function') {
            const sections = addSystemFieldToSectionRef.current.getSections()
            if (sections && sections.length > 0) {
                setAvailableSections(sections)
                setShowSectionModal(true)
            } else {
                toast.warning('Please create a section first before adding system fields')
            }
        } else {
            toast.warning('Custom Fields Panel is not ready. Please wait...')
        }
    }
    
    // Handle section selection from modal
    const handleSelectSection = (sectionIndex) => {
        if (!selectedSystemField || sectionIndex === null || sectionIndex < 0) return
        
        // Call function from CustomFieldsPanel to add field to section
        if (addSystemFieldToSectionRef.current && typeof addSystemFieldToSectionRef.current.addSystemField === 'function') {
            const fieldData = {
                label: selectedSystemField.label,
                fieldName: selectedSystemField.variable.replace(/[{}]/g, ''), // Remove { } from variable name
                fieldType: 'TEXT', // System mapped fields are always TEXT type
                roleRequired: 'TRAINER', // Default, can be adjusted based on section
                displayOrder: 1
            }
            
            // Call addSystemField and check return value
            const success = addSystemFieldToSectionRef.current.addSystemField(sectionIndex, fieldData)
            
            if (success) {
                // Only show success toast and close modal if field was successfully added
                setShowSectionModal(false)
                setSelectedSystemField(null)
                toast.success(`Added ${selectedSystemField.label} to section`)
            }
            // If success is false, addSystemField already showed warning toast, so we don't need to do anything else
        } else {
            toast.error('Failed to add field to section')
        }
    }

    // Note: pollForResult removed - we now get URL directly from onDownloadAs event in Submit flow

    // Force save and poll for edited URL from backend
    const forceSaveAndPoll = useCallback(async () => {
        try {
            if (!editorRef.current || !isEditorReady) {
                throw new Error('Editor not ready')
            }

            const documentKey = documentKeyRef.current
            if (!documentKey) {
                throw new Error('Document key not found')
            }

            // IMPORTANT: Set Submit flag FIRST, before any async operations
            // This ensures onDownloadAs events know we're in Submit flow immediately
            isSubmittingRef.current = true
            
            // CRITICAL: Set sessionStorage to track Submit state globally
            // This allows all component instances (including old ones from hot reload) to know we're submitting
            // Key format: 'onlyoffice_submitting' = 'true' | undefined
            // Key format: 'onlyoffice_submit_docKey' = documentKey
            try {
                sessionStorage.setItem('onlyoffice_submitting', 'true')
                sessionStorage.setItem('onlyoffice_submit_docKey', documentKey)
                console.log('🔒 Submit state saved to sessionStorage')
              } catch (e) {
                console.warn('⚠️ Failed to set sessionStorage:', e)
                // Continue anyway - refs will still work
            }
            
            console.log('🚀 Starting callback flow (Submit)...')
            console.log(`🔑 DocumentKey: ${documentKey}`)
            console.log(`📡 Callback URL: ${API_CONFIG.BASE_URL}/media/docs/onlyoffice/callback`)

            // IMPORTANT: Use the same approach as Save Draft - save() then downloadAs()
            // This ensures all changes are saved and callback is triggered properly
            console.log('💾 Step 1: Saving all changes first (auto Ctrl+S)...')
            if (typeof editorRef.current.save === 'function') {
                try {
                    editorRef.current.save()
                    // Wait longer for save to complete (2 seconds to ensure it's done)
                    await new Promise(resolve => setTimeout(resolve, 2000))
                    console.log('✅ All changes saved successfully')
              } catch (e) {
                    console.warn('⚠️ save() failed:', e)
                    // Continue anyway - might still work
                }
            }

            // Step 2: Create a Promise to wait for URL from onDownloadAs event
            // Instead of polling, we'll get the URL directly from the event
            console.log('💾 Step 2: Triggering downloadAs() and waiting for URL from event...')
            
            // Clear any old resolver first
            submitUrlResolverRef.current = null
            
            const urlPromise = new Promise((resolve, reject) => {
                // Store resolver in ref so onDownloadAs can call it
                submitUrlResolverRef.current = { resolve, reject }
                
                // Timeout after 15 seconds
                setTimeout(() => {
                    if (submitUrlResolverRef.current) {
                        submitUrlResolverRef.current.reject(new Error('Timeout waiting for download URL'))
                        submitUrlResolverRef.current = null
                    }
                }, 15000)
            })
            
            // Trigger downloadAs() - this will trigger onDownloadAs event
            if (typeof editorRef.current.downloadAs === 'function') {
                try {
                    editorRef.current.downloadAs('docx')
                    console.log('✅ downloadAs() triggered - waiting for URL from onDownloadAs event...')
          } catch (e) {
                    console.warn('⚠️ downloadAs() failed:', e)
                    if (submitUrlResolverRef.current) {
                        submitUrlResolverRef.current.reject(new Error('Failed to trigger downloadAs()'))
                        submitUrlResolverRef.current = null
                    }
                    isSubmittingRef.current = false // Reset flag on error
                    
                    // Cleanup sessionStorage on error
                    try {
                        sessionStorage.removeItem('onlyoffice_submitting')
                        sessionStorage.removeItem('onlyoffice_submit_docKey')
                    } catch (e) {
                        console.warn('⚠️ Failed to clear sessionStorage:', e)
                    }
                    
                    throw new Error('Failed to trigger downloadAs()')
                }
            } else {
                if (submitUrlResolverRef.current) {
                    submitUrlResolverRef.current.reject(new Error('downloadAs method is not available'))
                    submitUrlResolverRef.current = null
                }
                isSubmittingRef.current = false // Reset flag on error
                
                // Cleanup sessionStorage on error
                try {
                    sessionStorage.removeItem('onlyoffice_submitting')
                    sessionStorage.removeItem('onlyoffice_submit_docKey')
                } catch (e) {
                    console.warn('⚠️ Failed to clear sessionStorage:', e)
                }
                
                throw new Error('downloadAs method is not available')
            }
            
            // Step 3: Wait for URL from onDownloadAs event
            console.log('⏳ Waiting for URL from onDownloadAs event...')
            toast.info('Waiting for document URL...')
            
            try {
                const resultUrl = await urlPromise
                
                if (resultUrl) {
                    console.log('✅ URL received from onDownloadAs event:', resultUrl)
                    toast.success('Document processed successfully!')
                    setHasUnsavedChanges(false) // Reset unsaved changes flag after successful save
                    isSubmittingRef.current = false // Reset flag after success
                    submitUrlResolverRef.current = null // Clear resolver
                    
                    // CRITICAL: Cleanup sessionStorage after successful Submit
                    try {
                        sessionStorage.removeItem('onlyoffice_submitting')
                        sessionStorage.removeItem('onlyoffice_submit_docKey')
                        console.log('🔓 Submit state cleared from sessionStorage')
                    } catch (e) {
                        console.warn('⚠️ Failed to clear sessionStorage:', e)
                    }
                    
                    return resultUrl
                } else {
                    console.warn('⚠️ No URL received from onDownloadAs event')
                    toast.warning('Could not get document URL')
                    isSubmittingRef.current = false // Reset flag even on failure
                    submitUrlResolverRef.current = null // Clear resolver
                    
                    // Cleanup sessionStorage on failure
                    try {
                        sessionStorage.removeItem('onlyoffice_submitting')
                        sessionStorage.removeItem('onlyoffice_submit_docKey')
                    } catch (e) {
                        console.warn('⚠️ Failed to clear sessionStorage:', e)
                    }
                    
                    return null
                }
      } catch (error) {
                console.error('❌ Error waiting for URL from onDownloadAs:', error)
                toast.error(`Failed to get document URL: ${error.message}`)
                isSubmittingRef.current = false // Reset flag on error
                submitUrlResolverRef.current = null // Clear resolver on error
                
                // CRITICAL: Cleanup sessionStorage on error
                try {
                    sessionStorage.removeItem('onlyoffice_submitting')
                    sessionStorage.removeItem('onlyoffice_submit_docKey')
                    console.log('🔓 Submit state cleared from sessionStorage (error)')
                } catch (e) {
                    console.warn('⚠️ Failed to clear sessionStorage:', e)
                }
                
                throw error
            }
      } catch (error) {
            console.error('❌ Force save and poll failed:', error)
            toast.error(`Failed: ${error.message}`)
            isSubmittingRef.current = false // Reset flag on error
            submitUrlResolverRef.current = null // Clear resolver on error
            
            // CRITICAL: Cleanup sessionStorage on outer catch error
            try {
                sessionStorage.removeItem('onlyoffice_submitting')
                sessionStorage.removeItem('onlyoffice_submit_docKey')
                console.log('🔓 Submit state cleared from sessionStorage (outer catch)')
            } catch (e) {
                console.warn('⚠️ Failed to clear sessionStorage:', e)
            }
            
            throw error
        }
    }, [isEditorReady])

    // Expose export method to child panels - returns temp URL
    // Try both downloadAs() and forceSave() methods
    const exportEditedDoc = useCallback(() => {
        return new Promise((resolve, reject) => {
            try {
                if (!editorRef.current) {
                    reject(new Error('Editor not initialized'))
                    return
                }

                exportResolverRef.current = { resolve, reject }

                // Method 1: Try forceSave() first (more reliable with forcesave enabled)
                if (typeof editorRef.current.downloadDocument === 'function') {
                    console.log(
                        '🔄 Attempting export via downloadDocument()...'
                    )
                    try {
                        editorRef.current.downloadDocument()
                    } catch (e) {
                        console.warn(
                            'downloadDocument() failed, trying downloadAs()...',
                            e
                        )
                    }
                }

                // Method 2: Try downloadAs()
                if (typeof editorRef.current.downloadAs === 'function') {
                    console.log(
                        '🔄 Attempting export via downloadAs("docx")...'
                    )
                    try {
                        editorRef.current.downloadAs('docx')
                    } catch (e) {
                        console.warn('downloadAs() failed:', e)
                    }
                }

                // Method 3: Try direct forceSave via API
                if (typeof editorRef.current.save === 'function') {
                    console.log('🔄 Attempting export via save()...')
                    try {
                        editorRef.current.save()
                    } catch (e) {
                        console.warn('save() failed:', e)
                    }
                }

                // Timeout after 20 seconds (increased from 15)
                setTimeout(() => {
                    if (exportResolverRef.current) {
                        const error = new Error(
                            'Export timeout: onRequestSaveAs not received after 20s. OnlyOffice Cloud may not support this method without callbackUrl.'
                        )
                        exportResolverRef.current.reject(error)
                        exportResolverRef.current = null
                    }
                }, 20000)
            } catch (err) {
                if (exportResolverRef.current) {
                    exportResolverRef.current.reject(err)
                    exportResolverRef.current = null
                } else {
                    reject(err)
                }
            }
        })
    }, [])
// Complete flow: Export → Fetch → Upload → Return S3 URL
    const exportAndUploadEditedDoc = useCallback(async () => {
        try {
            if (!editorRef.current || !isEditorReady) {
                throw new Error('Editor not ready')
            }

            toast.info('Exporting document...')

            // Step 1: Export and get temp URL
            const tempUrl = await exportEditedDoc()
            if (!tempUrl) {
                throw new Error('No temporary URL received from OnlyOffice')
            }

            console.log('📥 Got temp URL:', tempUrl)
            toast.info('Downloading file...')

            // Step 2: Fetch file from temp URL
            const response = await fetch(tempUrl)
            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.statusText}`)
            }

            const blob = await response.blob()
            console.log('📦 Downloaded blob:', blob.size, 'bytes')

            // Step 3: Create File from Blob
            const fileNameWithExt = fileName.endsWith('.docx')
                ? fileName
                : `${fileName}.docx`
            const file = new File([blob], fileNameWithExt, {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            })

            toast.info('Uploading to S3...')

            // Step 4: Upload to S3 using existing API
            const docsType = uploadAPI.getDocsType(fileNameWithExt) || 'tem'
            const uploadResult = await uploadAPI.uploadDocument(file, docsType)

            // Step 5: Extract S3 URL from response
            console.log('📦 Upload API response:', uploadResult)

            let s3Url = null
            if (uploadResult?.data?.[0]?.url) {
                s3Url = uploadResult.data[0].url
                console.log(
                    '✅ Found S3 URL in uploadResult.data[0].url:',
                    s3Url
                )
            } else if (uploadResult?.data?.url) {
                s3Url = uploadResult.data.url
                console.log('✅ Found S3 URL in uploadResult.data.url:', s3Url)
            } else if (uploadResult?.url) {
                s3Url = uploadResult.url
                console.log('✅ Found S3 URL in uploadResult.url:', s3Url)
            } else if (uploadResult?.fileUrl) {
                s3Url = uploadResult.fileUrl
                console.log('✅ Found S3 URL in uploadResult.fileUrl:', s3Url)
            } else if (uploadResult?.path) {
                s3Url = uploadResult.path
                console.log('✅ Found S3 URL in uploadResult.path:', s3Url)
            }

            if (!s3Url) {
                console.error(
                    '❌ Upload response structure:',
                    JSON.stringify(uploadResult, null, 2)
                )
                throw new Error('No S3 URL returned from upload API')
            }

            console.log('🎯 Final S3 URL to be used in templateContent:', s3Url)
console.log('🌐 Full S3 URL:', s3Url)
            toast.success(`Document uploaded successfully!\nURL: ${s3Url}`)

            return s3Url
        } catch (error) {
            console.error('❌ Export and upload failed:', error)
            toast.error(`Failed: ${error.message}`)
            throw error
        }
    }, [exportEditedDoc, fileName, isEditorReady])

  // Debug logging removed to prevent console spam

  if (isLoading) {
    return (
      <Card className={`border-neutral-200 shadow-sm ${className}`}>
                <Card.Body
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: '600px' }}
                >
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">
                            Loading OnlyOffice Editor...
                        </p>
                        <small className="text-muted">
                            Loading document from S3...
                        </small>
            <br />
                        <small className="text-muted">
                            Content:{' '}
                            {initialContent ? 'Available' : 'Not available'}
                        </small>
          </div>
        </Card.Body>
      </Card>
        )
  }

  if (!initialContent) {
    return (
      <Card className={`border-neutral-200 shadow-sm ${className}`}>
                <Card.Body
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: '600px' }}
                >
          <div className="text-center">
            <Alert variant="warning">
                            <strong>No Document URL</strong>
                            <br />
              Please upload a document first to use the editor.
            </Alert>
          </div>
        </Card.Body>
      </Card>
        )
  }

    const handleAddCustomField = (field, options) => {
    // Check if field is an array (for update) or single field (for add)
    if (Array.isArray(field)) {
            setCustomFields(field)
            if (!options?.silent) toast.success('Fields updated successfully')
    } else {
            setCustomFields((prev) => [...prev, field])
            if (!options?.silent) toast.success(`Added field: ${field.label}`)
    }
    }

  const handleRemoveCustomField = (index) => {
        setCustomFields((prev) => prev.filter((_, i) => i !== index))
        toast.success('Field removed')
  }

  return (
    <div className={`onlyoffice-form-editor ${className}`}>
      <div className="p-0">
        <Row className="g-0" style={{ minHeight: '90vh' }}>
          {/* OnlyOffice Editor - LEFT side */}
          <Col
            xs={12}
            md={
              showMergeFields &&
              ((importType === 'File without fields' && showCustomFieldsPanel) ||
               importType !== 'File without fields')
                ? 9
                : 12
            }
            className="editor-col"
            style={{ order: 1 }}
          >
            <div className="p-3 editor-wrapper" style={{ height: '90vh' }}>
              {/* Header Bar with System Mapped Field Dropdown */}
              <div className="d-flex justify-content-end align-items-center mb-2">
                <Dropdown>
                  <Dropdown.Toggle 
                    variant="outline-primary" 
                    size="sm"
                    id="system-mapped-field-dropdown"
                  >
                    System Mapped Field
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {systemMappedFields.map((field, index) => (
                      <Dropdown.Item
                        key={index}
                        onClick={() => handleSystemFieldSelect(field)}
                      >
                        {field.label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              
              {/* OnlyOffice Editor Container */}
              <div 
                id="onlyoffice-editor" 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
            </div>
          </Col>

          {/* Merge Fields Flow (File with fields) - RIGHT sidebar */}
          {showMergeFields &&
            importType !== 'File without fields' && (
              <Col
                xs={12}
                md={3}
                className="border-start border-md-start"
                style={{ order: 2, overflow: 'hidden' }}
              >
                <div
                  className="custom-fields-wrapper"
                  style={{
                    height: '90vh',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                  }}
                >
                  <EditorWithMergeFields
                    ref={addSystemFieldToSectionRef}
                onInsertField={handleInsertField}
                    exportEditedDoc={exportEditedDoc}
                    initialUrl={initialContent}
                    forceSaveAndPoll={forceSaveAndPoll}
                    getDocumentKey={getDocumentKey}
                readOnly={readOnly}
                className="h-100"
              />
                </div>
              </Col>
            )}

                    {/* Custom Fields Flow (File without fields) - Collapsible */}
                    {showMergeFields &&
                        importType === 'File without fields' &&
                        showCustomFieldsPanel && (
          <Col xs={12} md={3} className="border-start border-md-start custom-fields-col" style={{ order: 2 }}>
                                <div
                                    className="custom-fields-wrapper"
                                    style={{
                                        height: '90vh',
                                        overflowY: 'auto',
                                        overflowX: 'hidden',
                                    }}
                                >
                                    <CustomFieldsPanel
                customFields={customFields}
                onAddField={handleAddCustomField}
                onRemoveField={handleRemoveCustomField}
                onInsertField={handleInsertField}
                initialSections={initialSections}
                                        exportEditedDoc={exportEditedDoc}
                                        exportAndUploadEditedDoc={
                                            exportAndUploadEditedDoc
                                        }
                                        forceSaveAndPoll={forceSaveAndPoll}
                                        getDocumentKey={getDocumentKey}
                                        addSystemFieldToSectionRef={addSystemFieldToSectionRef}
                readOnly={readOnly}
                className="h-100"
              />
            </div>
            </Col>
          )}
        </Row>
      </div>
      
      {/* Modal for selecting section to add system mapped field */}
      <Modal 
        show={showSectionModal} 
        onShow={() => {
          // Get latest sections when modal opens
          if (addSystemFieldToSectionRef.current && typeof addSystemFieldToSectionRef.current.getSections === 'function') {
            const sections = addSystemFieldToSectionRef.current.getSections()
            setAvailableSections(sections || [])
          }
        }}
        onHide={() => {
          setShowSectionModal(false)
          setSelectedSystemField(null)
        }} 
        centered
        className="system-field-modal"
      >
        <Modal.Header 
          closeButton 
          className="bg-primary-custom text-white border-0"
          style={{ 
            borderTopLeftRadius: '0.75rem',
            borderTopRightRadius: '0.75rem',
            padding: '1.25rem 1.5rem'
          }}
        >
          <Modal.Title className="text-white mb-0" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            Select Section
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '1.5rem' }}>
          {selectedSystemField && (
            <div 
              className="mb-4 p-3 rounded"
              style={{ 
                backgroundColor: 'var(--bs-light)',
                border: '1px solid var(--bs-neutral-200)'
              }}
            >
              <p className="mb-1 text-primary-custom" style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Field to add:
              </p>
              <p className="mb-0" style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--bs-dark)' }}>
                {selectedSystemField.label}
              </p>
              <code 
                className="d-inline-block mt-1 px-2 py-1 rounded"
                style={{ 
                  fontSize: '0.875rem',
                  backgroundColor: 'var(--bs-neutral-100)',
                  color: 'var(--bs-primary)',
                  border: '1px solid var(--bs-neutral-300)'
                }}
              >
                {selectedSystemField.variable}
              </code>
    </div>
          )}
          <p className="mb-3" style={{ fontSize: '0.95rem', color: 'var(--bs-dark)', fontWeight: 500 }}>
            Choose a section to add this field:
          </p>
          {availableSections.length > 0 ? (
            <div className="d-grid gap-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {availableSections.map((section, index) => (
                <button
                  key={index}
                  type="button"
                  className="section-select-btn"
                  onClick={() => handleSelectSection(index)}
                  style={{
                    padding: '1rem 1.25rem',
                    border: '2px solid var(--bs-neutral-200)',
                    borderRadius: '0.5rem',
                    backgroundColor: 'var(--bs-light)',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--bs-primary)'
                    e.currentTarget.style.backgroundColor = 'rgba(27, 60, 83, 0.05)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(27, 60, 83, 0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--bs-neutral-200)'
                    e.currentTarget.style.backgroundColor = 'var(--bs-light)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div style={{ flex: 1 }}>
                      <div 
                        className="mb-1"
                        style={{ 
                          fontSize: '1rem', 
                          fontWeight: 600,
                          color: 'var(--bs-primary)'
                        }}
                      >
                        {section.label || section.name}
                      </div>
                      <div 
                        className="d-flex align-items-center gap-2 mt-2"
                        style={{ fontSize: '0.875rem' }}
                      >
                        <span 
                          className="badge rounded-pill px-2 py-1"
                          style={{ 
                            backgroundColor: 'var(--bs-secondary)',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}
                        >
                          {section.editBy || 'TRAINER'}
                        </span>
                      </div>
                    </div>
                    <div 
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        minWidth: '60px',
                        height: '60px',
                        borderRadius: '0.375rem',
                        backgroundColor: 'var(--bs-primary)',
                        color: 'white',
                        fontSize: '1.25rem',
                        fontWeight: 700
                      }}
                    >
                      {section.fields?.length || 0}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <Alert 
              variant="warning" 
              className="mb-0"
              style={{
                backgroundColor: '#fff3cd',
                borderColor: '#ffc107',
                color: '#856404',
                borderRadius: '0.5rem',
                padding: '1rem'
              }}
            >
              <strong>No sections available.</strong> Please create a section first.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer 
          className="border-0"
          style={{ 
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--bs-neutral-200)'
          }}
        >
          <BootstrapButton 
            variant="secondary" 
            onClick={() => {
              setShowSectionModal(false)
              setSelectedSystemField(null)
            }}
            style={{
              backgroundColor: 'var(--bs-secondary)',
              borderColor: 'var(--bs-secondary)',
              color: 'white',
              fontWeight: 500,
              padding: '0.5rem 1.5rem',
              borderRadius: '0.375rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3a5a6f'
              e.currentTarget.style.borderColor = '#3a5a6f'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(69, 104, 130, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bs-secondary)'
              e.currentTarget.style.borderColor = 'var(--bs-secondary)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Cancel
          </BootstrapButton>
        </Modal.Footer>
      </Modal>
    </div>
    )
})

export default OnlyOfficeFormEditor