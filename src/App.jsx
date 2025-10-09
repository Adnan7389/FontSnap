import React, { useState } from 'react'
import ImageUploader from './components/ImageUploader'
import CropSelector from './components/CropSelector'
import OcrProcessor from './components/OcrProcessor'
import FontMatcher from './components/FontMatcher'
import ResultsDisplay from './components/ResultsDisplay'

/**
 * Main FontSnap Application
 * Manages the complete workflow: Upload → Crop → OCR → Font Matching → Results
 */
function App() {
  // Application state management
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [croppedImage, setCroppedImage] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [fontMatches, setFontMatches] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Reset application to initial state
  const resetApp = () => {
    setCurrentStep(1)
    setUploadedImage(null)
    setCroppedImage(null)
    setExtractedText('')
    setFontMatches([])
    setIsProcessing(false)
  }

  // Handle image upload completion
  const handleImageUpload = (imageUrl) => {
    setUploadedImage(imageUrl)
    setCurrentStep(2)
  }

  // Handle crop selection completion
  const handleCropComplete = (croppedImageUrl) => {
    setCroppedImage(croppedImageUrl)
    setCurrentStep(3)
  }

  // Handle OCR completion
  const handleOcrComplete = (text) => {
    setExtractedText(text)
    setCurrentStep(4)
  }

  // Handle font matching completion
  const handleFontMatchingComplete = (matches) => {
    setFontMatches(matches)
    setCurrentStep(5)
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FontSnap</h1>
              <p className="text-gray-600 mt-1">Identify fonts from images</p>
            </div>
            {currentStep > 1 && (
              <button
                onClick={resetApp}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center mb-8">
          {['Upload', 'Crop', 'Extract', 'Match', 'Results'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index + 1 <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm ${
                index + 1 <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}>
                {step}
              </span>
              {index < 4 && (
                <div className={`w-8 h-0.5 mx-4 ${
                  index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {currentStep === 1 && (
            <ImageUploader onImageUpload={handleImageUpload} />
          )}
          
          {currentStep === 2 && uploadedImage && (
            <CropSelector 
              imageUrl={uploadedImage} 
              onCropComplete={handleCropComplete}
            />
          )}
          
          {currentStep === 3 && croppedImage && (
            <OcrProcessor 
              imageUrl={croppedImage} 
              onTextExtracted={handleOcrComplete}
              setIsProcessing={setIsProcessing}
            />
          )}
          
          {currentStep === 4 && extractedText && (
            <FontMatcher 
              extractedText={extractedText}
              croppedImage={croppedImage}
              onMatchingComplete={handleFontMatchingComplete}
              setIsProcessing={setIsProcessing}
            />
          )}
          
          {currentStep === 5 && fontMatches.length > 0 && (
            <ResultsDisplay 
              extractedText={extractedText}
              croppedImage={croppedImage}
              fontMatches={fontMatches}
            />
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-center text-gray-700">Processing your image...</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              FontSnap - A browser-based font identification tool. 
              Built with React, Tesseract.js, and modern web technologies.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App