import React from 'react'

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
      alert('Font CSS copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy CSS:', err)
    }
  }

  // Get similarity score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  // Get Google Fonts link
  const getGoogleFontsLink = (fontName) => {
    const baseName = fontName.split(' ')[0] // Get base font name
    return `https://fonts.google.com/specimen/${baseName.replace(' ', '+')}?preview.text=${encodeURIComponent(extractedText)}`
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
        Font Match Results
      </h2>

      {/* Original comparison */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Original vs Extracted Text</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Original Image</h4>
            <div className="bg-white p-4 rounded-lg border">
              <img 
                src={croppedImage} 
                alt="Original text" 
                className="max-w-full mx-auto"
              />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Extracted Text</h4>
            <div className="bg-white p-4 rounded-lg border flex items-center justify-center min-h-24">
              <p className="text-lg text-gray-900 font-medium text-center">
                "{extractedText}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Font matches */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Top 3 Font Matches</h3>
        
        {fontMatches.map((match, index) => (
          <div key={match.name} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{match.name}</h4>
                  <p className="text-gray-600">Weight: {match.weight}</p>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(match.similarity)}`}>
                {match.similarity.toFixed(1)}% match
              </div>
            </div>

            {/* Font preview */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Preview</h5>
              <div className="bg-white p-4 rounded border">
                {match.previewCanvas && (
                  <img 
                    src={match.previewCanvas.toDataURL()} 
                    alt={`${match.name} preview`}
                    className="max-w-full"
                  />
                )}
              </div>
            </div>

            {/* Font details and actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => copyFontCSS(match)}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium"
              >
                Copy CSS
              </button>
              
              <a
                href={getGoogleFontsLink(match.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors text-sm font-medium"
              >
                View on Google Fonts
              </a>
              
              {match.previewCanvas && (
                <button
                  onClick={() => downloadPreview(match.previewCanvas, match.name)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                >
                  Download Preview
                </button>
              )}
            </div>

            {/* Font CSS code */}
            <div className="mt-4 bg-gray-900 rounded-lg p-3">
              <code className="text-green-400 text-sm">
                font-family: {match.family};<br/>
                font-weight: {match.weight};
              </code>
            </div>
          </div>
        ))}
      </div>

      {/* No matches found */}
      {fontMatches.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No font matches found</h3>
          <p className="text-gray-600">Try with a different image or adjust the cropped area.</p>
        </div>
      )}

      {/* Tips for better results */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-900 mb-3">Tips for better font identification:</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <ul className="space-y-2">
            <li>• Use high-resolution images</li>
            <li>• Ensure good contrast between text and background</li>
            <li>• Crop tightly around the text</li>
          </ul>
          <ul className="space-y-2">
            <li>• Include multiple characters when possible</li>
            <li>• Avoid blurry or pixelated text</li>
            <li>• Try different font weights if available</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ResultsDisplay