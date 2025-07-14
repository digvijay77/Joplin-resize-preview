function injectCss() {
    if (document.getElementById('custom-resizer-styles')) return;

    const styles = `
        .custom-resizer-handle {
            background-color: #c4c4c4;
            cursor: col-resize;
            width: 6px;
            flex-shrink: 0;
            position: relative;
            transition: background-color 0.2s ease;
        }

        .custom-resizer-handle:hover {
            background-color: #2684FF; /* A highlight color */
        }

        .custom-resizer-handle::before {
            content: '';
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 2px;
            height: 30px;
            background-color: #888;
            border-radius: 2px;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'custom-resizer-styles';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

function initializeResizer() {
    // console.log('Initializing resizer script');
    injectCss();

    const interval = setInterval(() => {
        const editorPane = document.querySelector('.rli-editor .note-editor-viewer-row .editor');
        const previewPane = document.querySelector('.rli-editor .note-editor-viewer-row .viewer');
        // console.log('Checking for editor and preview panes:', editorPane, previewPane);

        if (editorPane && previewPane) {
            clearInterval(interval); // Stop checking
            setupResizer(editorPane, previewPane);
        }
    }, 100); 
}

function setupResizer(leftPane, rightPane) {
    injectCss();
    // console.log('Setting up resizer between:', leftPane, rightPane);
    // Prevent adding multiple resizers if the script runs again
    if (document.getElementById('custom-resizer')) return;

    // Create the resizer handle element
    const resizer = document.createElement('div');
    resizer.id = 'custom-resizer';
    resizer.className = 'custom-resizer-handle';

    // Insert the resizer between the editor and preview panes
    leftPane.parentNode.insertBefore(resizer, rightPane);

    let startX = 0;
    let startLeftWidth = 0;
    let startRightWidth = 0;
    let containerWidth = 0;

    const mouseMoveHandler = (e) => {
        const deltaX = e.clientX - startX;
        const newLeftWidth = startLeftWidth + deltaX;
        const newRightWidth = startRightWidth - deltaX;

        const minWidth = 0;
        const maxLeftWidth = containerWidth - minWidth - 6; // Account for resizer width
        const maxRightWidth = containerWidth - minWidth - 6;

        if (newLeftWidth >= minWidth && newRightWidth >= minWidth && 
            newLeftWidth <= maxLeftWidth && newRightWidth <= maxRightWidth) {
            
            // Set both panes explicitly to prevent jumping
            leftPane.style.width = `${newLeftWidth}px`;
            leftPane.style.flexBasis = `${newLeftWidth}px`;
            leftPane.style.flexGrow = '1';
            leftPane.style.flexShrink = '1';
            
            rightPane.style.width = `${newRightWidth}px`;
            rightPane.style.flexBasis = `${newRightWidth}px`;
            rightPane.style.flexGrow = '1';
            rightPane.style.flexShrink = '1';
        }
    };

    const mouseUpHandler = () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
        
        // Clean up global styles
        document.body.style.pointerEvents = 'auto';
    };

    resizer.addEventListener('mousedown', (e) => {
        const containerRect = leftPane.parentNode.getBoundingClientRect();
        const leftRect = leftPane.getBoundingClientRect();
        const rightRect = rightPane.getBoundingClientRect();
        
        startX = e.clientX;
        startLeftWidth = leftRect.width;
        startRightWidth = rightRect.width;
        containerWidth = containerRect.width;
        
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.body.style.pointerEvents = 'none'; // Prevent text selection during drag
        
        e.preventDefault();
    });
}


/**
 * This function checks if the editor exists and if the resizer is missing.
 * If so, it calls setupResizer to add it.
 */
function ensureResizerExists() {
    const editorPane = document.querySelector('.rli-editor .note-editor-viewer-row .editor');
    const previewPane = document.querySelector('.rli-editor .note-editor-viewer-row .viewer');
    const resizerExists = document.getElementById('custom-resizer');

    // If the panes exist but the resizer doesn't, add it.
    if (editorPane && previewPane && !resizerExists) {
        // console.log('Editor found, adding resizer...');
        setupResizer(editorPane, previewPane);
    }
}

/**
 * The main logic. We use a MutationObserver to watch for changes in the app's body.
 * This is far more efficient than a setInterval.
 */
function initializeObserver() {
    // The observer will call ensureResizerExists whenever nodes are added/removed from the body.
    const observer = new MutationObserver(ensureResizerExists);

    // Start observing the entire document body for changes to the child list.
    observer.observe(document.body, {
        childList: true,
        subtree: true // Also watch descendants
    });

    // Run an initial check in case the editor is already there when the script loads.
    ensureResizerExists();
}


initializeObserver();