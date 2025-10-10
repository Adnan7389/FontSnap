/**
 * OCR Utilities
 * Helper functions for text extraction using Tesseract.js
 */

// Default OCR configuration
export const defaultOcrConfig = {
  lang: 'eng',
  oem: 1,
  psm: 3,
}

// Character whitelist for better OCR accuracy
export const characterWhitelist = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?-\'"'

/**
 * Clean extracted text by removing extra whitespace and newlines
 * @param {string} text - Raw OCR text
 * @returns {string} - Cleaned text
 */
export const cleanOcrText = (text) => {
  return text
    .trim()
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,!?-'"]/g, '')
}

/**
 * Validate OCR confidence score
 * @param {number} confidence - OCR confidence (0-100)
 * @returns {object} - Validation result with message
 */
export const validateOcrConfidence = (confidence) => {
  if (confidence >= 80) {
    return { level: 'high', message: 'High confidence text recognition' }
  } else if (confidence >= 60) {
    return { level: 'medium', message: 'Medium confidence - please verify text' }
  } else {
    return { level: 'low', message: 'Low confidence - text may need editing' }
  }
}

/**
 * Preprocess image for better OCR results
 * @param {HTMLCanvasElement} canvas - Image canvas
 * @returns {HTMLCanvasElement} - Processed canvas
 */
export const preprocessImageForOcr = (canvas) => {
  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Convert to grayscale and increase contrast
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    const enhanced = gray > 128 ? 255 : 0 // High contrast threshold
    
    data[i] = enhanced     // Red
    data[i + 1] = enhanced // Green
    data[i + 2] = enhanced // Blue
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}