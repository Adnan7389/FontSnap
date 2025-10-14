import React from 'react'
import { FaCopy, FaDownload, FaExternalLinkAlt, FaMedal, FaLightbulb } from 'react-icons/fa'
import { MdOutlineFontDownload, MdOutlineCompare } from 'react-icons/md'

/**
 * ResultsDisplay Component
 * Shows the final font matching results with similarity scores
 * Displays original text, extracted text, and top font matches
 */
function ResultsDisplay({ extractedText, croppedImage, fontMatches }) {

  // Download font preview as image
  const downloadPreview = (canvas, fontName) => {
    const link = document.createElement('a')
    link.download = `fontsnap-${fontName.toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  // Copy font CSS to clipboard
  const copyFontCSS = async (font) => {
    const css = `font-family: ${font.family};\nfont-weight: ${font.weight};`
    try {
      await navigator.clipboard.writeText(css)
      // You could add a toast notification here instead of alert
      alert('Font CSS copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy CSS:', err)
    }
  }

  // Get similarity score color and badge style
  const getScoreStyle = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-600 text-white'
    if (score >= 60) return 'from-yellow-500 to-amber-600 text-white'
    return 'from-red-500 to-orange-600 text-white'
  }

  // Get medal icon based on rank
  const getMedalIcon = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🏅';
    }
  }

  // Get Google Fonts link
  const getGoogleFontsLink = (fontName) => {
    const baseName = fontName.split(' ')[0] // Get base font name
    return `https://fonts.google.com/specimen/${baseName.replace(' ', '+')}?preview.text=${encodeURIComponent(extractedText)}`
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl shadow-lg mb-6">
          <MdOutlineFontDownload className="text-white text-3xl" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Font Match Results
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-xl max-w-2xl mx-auto">
          We've analyzed your text and found the closest font matches from our database
        </p>
      </div>

      {/* Original comparison */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-12">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center">
            <MdOutlineCompare className="text-blue-600 dark:text-blue-300 text-xl" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Text Analysis</h3>
            <p className="text-gray-600 dark:text-gray-400">Original image vs extracted text comparison</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-inner border border-gray-300 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Original Image</span>
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
              <img
                src={croppedImage}
                alt="Original text"
                className="max-w-full max-h-64 mx-auto rounded-lg object-contain"
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-700">
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4 flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Extracted Text</span>
            </h4>
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-700">
              <p className="text-2xl font-semibold text-blue-900 dark:text-blue-200 text-center leading-relaxed">
                "{extractedText}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Font matches */}
      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-xl flex items-center justify-center">
            <FaMedal className="text-purple-600 dark:text-purple-300 text-xl" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Top Font Matches</h3>
            <p className="text-gray-600 dark:text-gray-400">Ranked by similarity score</p>
          </div>
        </div>

        <div className="space-y-8">
          {fontMatches.map((match, index) => (
            <div key={match.name} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl text-white font-bold">{getMedalIcon(index)}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{match.name}</h4>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium">
                        Weight: {match.weight}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Family: {match.family}</p>
                  </div>
                </div>

                <div className={`px-6 py-3 bg-gradient-to-r ${getScoreStyle(match.similarity)} rounded-xl font-bold text-lg shadow-md`}>
                  {match.similarity.toFixed(1)}% Match
                </div>
              </div>

              {/* Font preview */}
              <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 mb-6 border border-gray-300 dark:border-gray-600">
                <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Font Preview</h5>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-600 shadow-inner">
                  {match.previewCanvas && (
                    <img
                      src={match.previewCanvas.toDataURL()}
                      alt={`${match.name} preview`}
                      className="max-w-full mx-auto"
                    />
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={() => copyFontCSS(match)}
                  className="flex items-center space-x-3 px-6 py-3 bg-blue-50 dark:bg-blue-800 hover:bg-blue-100 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-200 rounded-xl transition-all duration-300 font-semibold border border-blue-200 dark:border-blue-600 hover:shadow-md"
                >
                  <FaCopy className="text-blue-600 dark:text-blue-300" />
                  <span>Copy CSS</span>
                </button>

                <a
                  href={getGoogleFontsLink(match.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 px-6 py-3 bg-green-50 dark:bg-green-800 hover:bg-green-100 dark:hover:bg-green-700 text-green-700 dark:text-green-200 rounded-xl transition-all duration-300 font-semibold border border-green-200 dark:border-green-600 hover:shadow-md"
                >
                  <FaExternalLinkAlt className="text-green-600 dark:text-green-300" />
                  <span>Google Fonts</span>
                </a>

                {match.previewCanvas && (
                  <button
                    onClick={() => downloadPreview(match.previewCanvas, match.name)}
                    className="flex items-center space-x-3 px-6 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-all duration-300 font-semibold border border-gray-300 dark:border-gray-600 hover:shadow-md"
                  >
                    <FaDownload className="text-gray-600 dark:text-gray-400" />
                    <span>Download</span>
                  </button>
                )}
              </div>

              {/* Font CSS code */}
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-400 text-sm ml-2">CSS Code</span>
                </div>
                <code className="text-green-400 text-lg font-mono block">
                  <span className="text-purple-400">font-family</span>: <span className="text-yellow-300">{match.family}</span>;<br />
                  <span className="text-purple-400">font-weight</span>: <span className="text-cyan-400">{match.weight}</span>;
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* No matches found */}
      {fontMatches.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <MdOutlineFontDownload className="text-gray-400 text-4xl" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">No Font Matches Found</h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto mb-6">
            We couldn't find close matches in our database. Try with a different image or adjust the cropped area.
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg">
            Try Another Image
          </button>
        </div>
      )}

      {/* Tips for better results */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border border-blue-200 dark:border-blue-700 rounded-2xl p-8">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center">
              <FaLightbulb className="text-blue-600 dark:text-blue-300 text-xl" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-semibold text-blue-900 dark:text-blue-200 mb-4">Tips for Better Font Identification</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-blue-800 dark:text-blue-300">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-200 font-semibold text-xs mt-0.5">1</div>
                <span>Use high-resolution images</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-200 font-semibold text-xs mt-0.5">2</div>
                <span>Ensure good text-background contrast</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-200 font-semibold text-xs mt-0.5">3</div>
                <span>Crop tightly around the text</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-200 font-semibold text-xs mt-0.5">4</div>
                <span>Include multiple characters</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-200 font-semibold text-xs mt-0.5">5</div>
                <span>Avoid blurry or pixelated text</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-200 font-semibold text-xs mt-0.5">6</div>
                <span>Try different font weights</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsDisplay