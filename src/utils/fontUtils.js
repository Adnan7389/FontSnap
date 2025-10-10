/**
 * Font Utilities
 * Functions for rendering text to canvas and comparing font similarities
 */

/**
 * Render text to canvas with specified font
 * @param {string} text - Text to render
 * @param {object} font - Font configuration
 * @returns {HTMLCanvasElement} - Canvas with rendered text
 */
export const renderTextToCanvas = (text, font) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  // Set canvas dimensions
  canvas.width = 800
  canvas.height = 200
  
  // Clear canvas with white background
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Set font properties
  ctx.fillStyle = 'black'
  ctx.font = `${font.weight} 48px ${font.family}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Enable text rendering optimizations
  ctx.textRendering = 'optimizeLegibility'
  
  // Render text
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)
  
  return canvas
}

/**
 * Compare two canvas images using pixel difference
 * @param {HTMLCanvasElement} canvas1 - Reference canvas
 * @param {HTMLCanvasElement} canvas2 - Comparison canvas
 * @returns {number} - Similarity score (0-100)
 */
export const compareCanvasText = (canvas1, canvas2) => {
  // Resize canvases to same size for comparison
  const size = 400
  const resized1 = resizeCanvas(canvas1, size, size)
  const resized2 = resizeCanvas(canvas2, size, size)
  
  const ctx1 = resized1.getContext('2d')
  const ctx2 = resized2.getContext('2d')
  
  const imageData1 = ctx1.getImageData(0, 0, size, size)
  const imageData2 = ctx2.getImageData(0, 0, size, size)
  
  const data1 = imageData1.data
  const data2 = imageData2.data
  
  let totalDifference = 0
  let pixelCount = 0
  
  // Compare pixels (only consider alpha channel for text detection)
  for (let i = 0; i < data1.length; i += 4) {
    const alpha1 = data1[i + 3]
    const alpha2 = data2[i + 3]
    
    // Convert to grayscale for comparison
    const gray1 = (data1[i] + data1[i + 1] + data1[i + 2]) / 3
    const gray2 = (data2[i] + data2[i + 1] + data2[i + 2]) / 3
    
    const difference = Math.abs(gray1 - gray2) / 255
    totalDifference += difference
    pixelCount++
  }
  
  // Calculate similarity percentage
  const averageDifference = totalDifference / pixelCount
  const similarity = Math.max(0, (1 - averageDifference) * 100)
  
  return Math.round(similarity * 100) / 100
}

/**
 * Resize canvas to specified dimensions
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {number} width - Target width
 * @param {number} height - Target height
 * @returns {HTMLCanvasElement} - Resized canvas
 */
export const resizeCanvas = (canvas, width, height) => {
  const resized = document.createElement('canvas')
  const ctx = resized.getContext('2d')
  
  resized.width = width
  resized.height = height
  
  // Use high-quality scaling
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  
  ctx.drawImage(canvas, 0, 0, width, height)
  
  return resized
}

/**
 * Extract text region from canvas using edge detection
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @returns {object} - Bounding box of text region
 */
export const detectTextBounds = (canvas) => {
  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  let minX = canvas.width
  let minY = canvas.height
  let maxX = 0
  let maxY = 0
  
  // Find text boundaries by detecting non-white pixels
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4
      const r = data[index]
      const g = data[index + 1]
      const b = data[index + 2]
      
      // Check if pixel is not white/background
      if (r < 240 || g < 240 || b < 240) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
}

/**
 * Calculate font metrics for better comparison
 * @param {string} text - Text to analyze
 * @param {object} font - Font configuration
 * @returns {object} - Font metrics
 */
export const calculateFontMetrics = (text, font) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  ctx.font = `${font.weight} 48px ${font.family}`
  const metrics = ctx.measureText(text)
  
  return {
    width: metrics.width,
    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
    ascent: metrics.actualBoundingBoxAscent,
    descent: metrics.actualBoundingBoxDescent
  }
}