/* eslint-disable no-console, no-undef */
// Test script to validate XSS sanitization functionality
const { JSDOM } = require('jsdom')
const window = new JSDOM('').window
global.window = window
global.document = window.document

// Import DOMPurify after setting up the DOM environment
const createDOMPurify = require('dompurify')
// eslint-disable-next-line no-unused-vars
const DOMPurify = createDOMPurify(window)

// Import the sanitize functions using require
const { sanitizeForXSS, sanitizeAndHighlight } = require('./utils/sanitize.js')

// Test cases to validate the sanitization
console.log('Testing XSS Sanitization Functions...\n')

// Test 1: Basic script tag removal
console.log('Test 1: Basic script tag removal')
const test1 = 'Hello <script>alert("XSS")</script> world'
const result1 = sanitizeForXSS(test1)
console.log('Input:  ', test1)
console.log('Output: ', result1)
console.log(
  'Pass:   ',
  result1 === 'Hello  world' && !result1.includes('script')
)
console.log('')

// Test 2: Event handler removal
console.log('Test 2: Event handler removal')
const test2 = 'Text <img src="x" onerror="alert(1)" /> more text'
const result2 = sanitizeForXSS(test2)
console.log('Input:  ', test2)
console.log('Output: ', result2)
console.log(
  'Pass:   ',
  !result2.includes('onerror') && !result2.includes('alert')
)
console.log('')

// Test 3: Highlighting functionality
console.log('Test 3: Highlighting functionality')
const test3 = 'This is a test string'
const result3 = sanitizeAndHighlight(test3, 'test')
console.log('Input:  ', test3)
console.log('Query:  ', 'test')
console.log('Output: ', result3)
console.log('Pass:   ', result3.includes('<mark') && result3.includes('test'))
console.log('')

// Test 4: XSS in highlighted content
console.log('Test 4: XSS in highlighted content')
const test4 = 'Safe text <script>alert("XSS")</script> more safe content'
const result4 = sanitizeAndHighlight(test4, 'safe')
console.log('Input:  ', test4)
console.log('Query:  ', 'safe')
console.log('Output: ', result4)
console.log(
  'Pass:   ',
  !result4.includes('script') && !result4.includes('alert')
)
console.log('')

// Test 5: Complex XSS attempt
console.log('Test 5: Complex XSS attempt')
const test5 =
  '<img src=x onerror=alert("XSS")><script>document.location="http://evil.com"</script>'
const result5 = sanitizeForXSS(test5)
console.log('Input:  ', test5)
console.log('Output: ', result5)
console.log(
  'Pass:   ',
  result5 === '' && !result5.includes('script') && !result5.includes('alert')
)
console.log('')

console.log('All tests completed successfully!')
