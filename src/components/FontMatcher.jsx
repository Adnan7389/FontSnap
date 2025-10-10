import React, { useEffect, useState } from 'react'
import { compareCanvasText, renderTextToCanvas } from '../utils/fontUtils'

/**
 * FontMatcher Component
 * Compares extracted text against Google Fonts using canvas rendering
 * Calculates similarity scores and returns top matches
 */
function FontMatcher({ extractedText, croppedImage, onMatchingComplete, setIsProcessing }) {
  const [progress, setProgress] = useState(0)
  const [currentFont, setCurrentFont] = useState('')
  
  // Google Fonts to test against
  const testFonts = [
    { name: 'Roboto', family: 'Roboto, sans-serif', weight: 400 },
    { name: 'Roboto Medium', family: 'Roboto, sans-serif', weight: 500 },
    { name: 'Roboto Bold', family: 'Roboto, sans-serif', weight: 700 },
    { name: 'Lato', family: 'Lato, sans-serif', weight: 400 },
    { name: 'Lato Bold', family: 'Lato, sans-serif', weight: 700 },
    { name: 'Montserrat', family: 'Montserrat, sans-serif', weight: 400 },
    { name: 'Montserrat SemiBold', family: 'Montserrat, sans-serif', weight: 600 },
    { name: 'Montserrat Bold', family: 'Montserrat, sans-serif', weight: 700 },
    { name: 'Playfair Display', family: 'Playfair Display, serif', weight: 400 },
    { name: 'Playfair Display Bold', family: 'Playfair Display, serif', weight: 700 },
  ]

  useEffect(() => {
    performFontMatching()
  }, [extractedText, croppedImage])

  // Main font matching algorithm
  const performFontMatching = async () => {
    if (!extractedText || !croppedImage) return

    setIsProcessing(true)
    const matches = []

    try {
      // Create reference canvas from original cropped image
      const referenceCanvas = await createReferenceCanvas(croppedImage)
      
      // Test each font
      for (let i = 0; i < testFonts.length; i++) {
        const font = testFonts[i]
        setCurrentFont(font.name)
        setProgress(((i + 1) / testFonts.length) * 100)

        // Render text in current font
        const testCanvas = renderTextToCanvas(extractedText, font)
        
        // Calculate similarity score
        const similarity = compareCanvasText(referenceCanvas, testCanvas)
        
        matches.push({
          ...font,
          similarity: similarity,
          previewCanvas: testCanvas
        })

        // Add small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Sort by similarity (higher is better) and take top 3
      const topMatches = matches
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3)

      onMatchingComplete(topMatches)

    } catch (error) {
      console.error('Font matching error:', error)
      onMatchingComplete([])
    }
  }

  // Create reference canvas from cropped image
  const createReferenceCanvas = (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        canvas.width = img.width
        canvas.height = img.height
        
        ctx.drawImage(img, 0, 0)
        resolve(canvas)
      }
      img.src = imageUrl
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Finding Font Matches
      </h2>

      {/* Original text preview */}
      <div className="bg-gray-100 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Original Text</h3>
        <img 
          src={croppedImage} 
          alt="Original text" 
          className="max-w-full mx-auto rounded-lg shadow-sm"
        />
      </div>

      {/* Extracted text display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Extracted Text</h3>
        <p className="text-blue-800 font-medium text-lg">"{extractedText}"</p>
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Testing font: {currentFont}
          </span>
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Algorithm explanation */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">How font matching works:</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Rendering extracted text in different Google Fonts</li>
          <li>• Comparing pixel-level differences with original image</li>
          <li>• Calculating similarity scores based on shape and spacing</li>
          <li>• Ranking fonts by closest visual match</li>
        </ul>
      </div>
    </div>
  )
}

export default FontMatcher