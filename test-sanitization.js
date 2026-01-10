// Test script to validate XSS sanitization functionality
const { JSDOM } = require('jsdom')

// Setup DOM environment for DOMPurify
const window = new JSDOM('').window
global.window = window
global.document = window.document

// Import the sanitize functions after setting up the DOM environment
const { sanitizeForXSS, sanitizeAndHighlight } = require('./utils/sanitize')

// Test cases to validate the sanitization

// Test 1: Basic script tag removal
const test1 = 'Hello <script>alert("XSS")</script> world'
sanitizeForXSS(test1)

// Test 2: Event handler removal
const test2 = 'Text <img src="x" onerror="alert(1)" /> more text'
sanitizeForXSS(test2)

// Test 3: Highlighting functionality
const test3 = 'This is a test string'
sanitizeAndHighlight(test3, 'test')

// Test 4: XSS in highlighted content
const test4 = 'Safe text <script>alert("XSS")</script> more safe content'
sanitizeAndHighlight(test4, 'safe')

// Test 5: Complex XSS attempt
const test5 =
  '<img src=x onerror=alert("XSS")><script>document.location="http://evil.com"</script>'
sanitizeForXSS(test5)
