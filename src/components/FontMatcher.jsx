import React, { useEffect, useState, useRef } from 'react'
import { compareCanvasText, renderTextToCanvas } from '../utils/fontUtils'
import { FaFont, FaSearch, FaChartLine, FaShapes, FaSpinner } from 'react-icons/fa'
import { MdOutlineTextFields, MdOutlineAutoAwesome } from 'react-icons/md'
import WebFont from 'webfontloader'

// Google Fonts API Key from environment variables
const GOOGLE_FONTS_API_KEY = import.meta.env.VITE_GOOGLE_FONTS_API_KEY

/**
 * FontMatcher Component
 * Compares extracted text against Google Fonts using canvas rendering
 * Calculates similarity scores and returns top matches
 */
function FontMatcher({ extractedText, croppedImage, onMatchingComplete, setIsProcessing }) {
  const [progress, setProgress] = useState(0)
  const [currentFont, setCurrentFont] = useState('')
  const [availableFonts, setAvailableFonts] = useState([])
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [fontsTestedCount, setFontsTestedCount] = useState(0)
  const [performanceMetrics, setPerformanceMetrics] = useState(null)
  const matchingStarted = useRef(false)

  useEffect(() => {
    // Fetch Google Fonts list
    const fetchGoogleFonts = async () => {
      if (!GOOGLE_FONTS_API_KEY) {
        console.error('Google Fonts API Key is not set. Please set VITE_GOOGLE_FONTS_API_KEY in your .env file.')
        // Fallback to a small default list if API key is missing
        setAvailableFonts([
          { name: 'Roboto', family: 'Roboto, sans-serif', weights: ['400', '700'] },
          { name: 'Lato', family: 'Lato, sans-serif', weights: ['400', '700'] },
          { name: 'Montserrat', family: 'Montserrat, sans-serif', weights: ['400', '700'] },
        ])
        return
      }

      try {
        const response = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity&subset=latin`
        )
        const data = await response.json()
        const fonts = data.items.slice(0, 20).map(font => ({
          name: font.family,
          family: `'${font.family}', sans-serif`,
          weights: font.variants
            .filter(v => /^[0-9]+$/.test(v) || v.endsWith('italic') || v === 'regular') // keep only numeric weights or italic variants
            .map(v => v === 'regular' ? '400' : v) // Normalize 'regular' to '400'
        }))
        setAvailableFonts(fonts)
      } catch (error) {
        console.error('Error fetching Google Fonts:', error)
        // Fallback to a small default list if API fails
        setAvailableFonts([
          { name: 'Roboto', family: 'Roboto, sans-serif', weights: ['400', '700'] },
          { name: 'Lato', family: 'Lato, sans-serif', weights: ['400', '700'] },
          { name: 'Montserrat', family: 'Montserrat, sans-serif', weights: ['400', '700'] },
        ])
      }
    }

    fetchGoogleFonts()
  }, [])

  useEffect(() => {
    if (availableFonts.length > 0 && extractedText && croppedImage) {
      const loadAllFonts = async () => {
        const batchSize = 10;
        for (let i = 0; i < availableFonts.length; i += batchSize) {
          const batch = availableFonts.slice(i, i + batchSize);
          const fontFamiliesToLoad = batch.map(font => {
            const weights = font.weights.join(',');
            return `${font.name}:${weights}`
          })

          await new Promise((resolve) => {
            WebFont.load({
              google: {
                families: fontFamiliesToLoad,
                api: 'https://fonts.googleapis.com/css?family='
              },
              timeout: 5000, // 5 seconds timeout
              active: () => {
                resolve();
              },
              inactive: () => {
                console.warn('Some fonts could not be loaded.');
                resolve();
              },
              fontinactive: (familyName, fvd) => {
                console.warn(`Font '${familyName}' with variation '${fvd}' failed to load.`);
              }
            });
          });
        }
        setFontsLoaded(true);
      }

      loadAllFonts();
    }
  }, [availableFonts, extractedText, croppedImage]);

  useEffect(() => {
    if (fontsLoaded && extractedText && croppedImage && !matchingStarted.current) {
      if (availableFonts.length > 0) {
        matchingStarted.current = true;
        try {
          performFontMatching();
        } catch (error) {
          console.error('Error during font matching:', error);
          onMatchingComplete([]);
          setIsProcessing(false);
        }
      } else {
        console.warn('No fonts available to match.');
      }
    }
  }, [fontsLoaded, extractedText, croppedImage, availableFonts]);

  useEffect(() => {
    if (performanceMetrics) {
      console.log('Performance Metrics:', performanceMetrics)
    }
  }, [performanceMetrics])

  // Main font matching algorithm
  const performFontMatching = async () => {
    if (!extractedText || !croppedImage || availableFonts.length === 0) return

    const startTime = performance.now()

    setIsProcessing(true)
    const matches = []
    let testedCount = 0

    try {
      // Create reference canvas from original cropped image
      const refCanvasStartTime = performance.now()
      const referenceCanvas = await createReferenceCanvas(croppedImage)
      const refCanvasEndTime = performance.now()

      const fontLoopStartTime = performance.now()
      // Iterate through each available font and its weights
      for (const font of availableFonts) {
        for (const weight of font.weights) {
          const parsedWeight = parseInt(weight, 10);
          if (isNaN(parsedWeight)) continue;

          const fontToTest = {
            name: `${font.name} ${weight}`,
            family: font.family,
            weight: parsedWeight
          }

          setCurrentFont(fontToTest.name)
          testedCount++;
          setFontsTestedCount(testedCount)
          setProgress((testedCount / (availableFonts.reduce((acc, f) => acc + f.weights.length, 0))) * 100)

          // Render text in current font
          const testCanvas = renderTextToCanvas(extractedText, fontToTest)

          // Calculate similarity score
          const similarity = compareCanvasText(referenceCanvas, testCanvas)

          matches.push({
            ...fontToTest,
            similarity: similarity,
            previewCanvas: testCanvas
          })

          // Add small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 10)) // Reduced delay for faster testing
        }
      }
      const fontLoopEndTime = performance.now()

      // Sort by similarity (higher is better) and take top 3
      const topMatches = matches
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3)

      const endTime = performance.now()
      const metrics = {
        totalMatchingTime: `${(endTime - startTime).toFixed(2)}ms`,
        referenceCanvasCreation: `${(refCanvasEndTime - refCanvasStartTime).toFixed(2)}ms`,
        fontLoop: `${(fontLoopEndTime - fontLoopStartTime).toFixed(2)}ms`,
        fontsTested: testedCount,
        fontsAvailable: availableFonts.length
      }
      setPerformanceMetrics(metrics)

      onMatchingComplete(topMatches)

    } catch (error) {
      console.error('Font matching error:', error)
      onMatchingComplete([])
    } finally {
      setIsProcessing(false)
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Finding Font Matches
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Analyzing text against our font database to find the closest matches
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Original Preview Section */}
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center">
              <MdOutlineTextFields className="text-blue-600 dark:text-blue-300 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Original Text Sample</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">The text we're analyzing</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-inner border border-gray-300 dark:border-gray-700">
            <img
              src={croppedImage}
              alt="Original text"
              className="max-w-full max-h-48 mx-auto rounded-lg object-contain"
            />
          </div>
        </div>

        {/* Extracted Text Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center">
              <FaSearch className="text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">Extracted Text</h3>
              <p className="text-blue-700 dark:text-blue-400 text-sm">Text identified from your image</p>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-700">
            <p className="text-blue-900 dark:text-blue-200 text-xl font-semibold text-center leading-relaxed">
              "{extractedText}"
            </p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-shrink-0">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analyzing Fonts</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Testing: <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{currentFont}</span>
                </p>
              </div>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Progress Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fonts Tested</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {fontsTestedCount}/{availableFonts.reduce((acc, font) => acc + font.weights.length, 0)}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Stage</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {progress < 50 ? 'Fetching' : progress < 80 ? 'Loading' : 'Comparing'}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Algorithm</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">Pixel Match</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Database</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">Google Fonts</div>
          </div>
        </div>
      </div>

      {/* Algorithm Explanation */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border border-green-200 dark:border-green-700 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-xl flex items-center justify-center">
              <MdOutlineAutoAwesome className="text-green-600 dark:text-green-300 text-xl" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-green-900 dark:text-green-200 mb-4">How Our Font Matching Works</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-200 dark:bg-green-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <FaShapes className="text-green-700 dark:text-green-300 text-sm" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">Shape Analysis</h4>
                  <p className="text-green-700 dark:text-green-300 text-sm">Comparing character shapes and proportions against font database</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-200 dark:bg-green-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <FaChartLine className="text-green-700 dark:text-green-300 text-sm" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">Pixel Comparison</h4>
                  <p className="text-green-700 dark:text-green-300 text-sm">Advanced pixel-level analysis to measure visual similarity</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-200 dark:bg-green-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <FaFont className="text-green-700 dark:text-green-300 text-sm" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">Font Rendering</h4>
                  <p className="text-green-700 dark:text-green-300 text-sm">Rendering text in each font candidate for accurate comparison</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-200 dark:bg-green-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <FaSpinner className="text-green-700 dark:text-green-300 text-sm" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">Smart Ranking</h4>
                  <p className="text-green-700 dark:text-green-300 text-sm">Calculating similarity scores and ranking by closest match</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Note */}
      <div className="mt-6 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          This process typically takes 10-15 seconds. Please don't close this window.
        </p>
      </div>
    </div>
  )
}

export default FontMatcher