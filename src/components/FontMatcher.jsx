import React, { useEffect, useState } from 'react'
import { compareCanvasText, renderTextToCanvas } from '../utils/fontUtils'
import { FaFont, FaSearch, FaChartLine, FaShapes, FaSpinner } from 'react-icons/fa'
import { MdOutlineTextFields, MdOutlineAutoAwesome } from 'react-icons/md'

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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
          <FaFont className="text-white text-2xl" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Finding Font Matches
        </h2>
        <p className="text-gray-600 text-lg">
          Analyzing text against our font database to find the closest matches
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Original Preview Section */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <MdOutlineTextFields className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Original Text Sample</h3>
              <p className="text-gray-600 text-sm">The text we're analyzing</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-inner border border-gray-300">
            <img
              src={croppedImage}
              alt="Original text"
              className="max-w-full max-h-48 mx-auto rounded-lg object-contain"
            />
          </div>
        </div>

        {/* Extracted Text Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FaSearch className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Extracted Text</h3>
              <p className="text-blue-700 text-sm">Text identified from your image</p>
            </div>
          </div>
          <div className="bg-white/80 rounded-xl p-6 border-2 border-blue-200">
            <p className="text-blue-900 text-xl font-semibold text-center leading-relaxed">
              "{extractedText}"
            </p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-shrink-0">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analyzing Fonts</h3>
                <p className="text-gray-600 text-sm">
                  Testing: <span className="font-mono font-semibold text-indigo-600">{currentFont}</span>
                </p>
              </div>
              <span className="text-xl font-bold text-indigo-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Progress Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600 mb-1">Fonts Tested</div>
            <div className="text-lg font-bold text-gray-900">
              {Math.floor((progress / 100) * testFonts.length)}/{testFonts.length}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600 mb-1">Current Stage</div>
            <div className="text-lg font-bold text-gray-900">
              {progress < 50 ? 'Initial' : progress < 80 ? 'Detailed' : 'Final'}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600 mb-1">Algorithm</div>
            <div className="text-lg font-bold text-gray-900">Pixel Match</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600 mb-1">Database</div>
            <div className="text-lg font-bold text-gray-900">Google Fonts</div>
          </div>
        </div>
      </div>

      {/* Algorithm Explanation */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <MdOutlineAutoAwesome className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-green-900 mb-4">How Our Font Matching Works</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <FaShapes className="text-green-700 text-sm" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">Shape Analysis</h4>
                  <p className="text-green-700 text-sm">Comparing character shapes and proportions against font database</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <FaChartLine className="text-green-700 text-sm" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">Pixel Comparison</h4>
                  <p className="text-green-700 text-sm">Advanced pixel-level analysis to measure visual similarity</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <FaFont className="text-green-700 text-sm" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">Font Rendering</h4>
                  <p className="text-green-700 text-sm">Rendering text in each font candidate for accurate comparison</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <FaSpinner className="text-green-700 text-sm" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">Smart Ranking</h4>
                  <p className="text-green-700 text-sm">Calculating similarity scores and ranking by closest match</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Note */}
      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm">
          This process typically takes 10-15 seconds. Please don't close this window.
        </p>
      </div>
    </div>
  )
}

export default FontMatcher