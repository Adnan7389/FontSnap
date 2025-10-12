import React, { useState } from 'react'
import { FaCamera, FaRedo, FaInfoCircle } from 'react-icons/fa'
import { MdOutlineFontDownload } from 'react-icons/md'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-xl shadow-md">
                <MdOutlineFontDownload className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FontSnap</h1>
                <p className="text-gray-500 text-sm">Identify fonts from images instantly</p>
              </div>
            </div>
            {currentStep > 1 && (
              <button
                onClick={resetApp}
                className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-300 border border-gray-300 shadow-sm hover:shadow-md"
              >
                <FaRedo className="text-gray-500" />
                <span>Start Over</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {[
              { step: 1, label: 'Upload', icon: <FaCamera className="text-sm" /> },
              { step: 2, label: 'Crop', icon: <div className="w-3 h-3 border-2 border-current rounded-sm" /> },
              { step: 3, label: 'Extract', icon: <div className="w-2 h-2 bg-current rounded-full" /> },
              { step: 4, label: 'Match', icon: <MdOutlineFontDownload className="text-sm" /> },
              { step: 5, label: 'Results', icon: <FaInfoCircle className="text-sm" /> }
            ].map(({ step, label, icon }, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex flex-col items-center transition-all duration-300 ${index + 1 <= currentStep ? 'scale-110' : 'scale-100'
                  }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${index + 1 <= currentStep
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-400'
                    }`}>
                    {icon}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${index + 1 <= currentStep ? 'text-indigo-600' : 'text-gray-400'
                    }`}>
                    {label}
                  </span>
                </div>
                {index < 4 && (
                  <div className={`w-16 h-1 mx-2 transition-all duration-500 ${index + 1 < currentStep ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-300'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 transition-all duration-300">
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 scale-100">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Your Image</h3>
              <p className="text-gray-600 text-center text-sm">
                Analyzing text and finding font matches...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <MdOutlineFontDownload className="text-indigo-600 text-xl" />
              <span className="text-lg font-semibold text-gray-900">FontSnap</span>
            </div>
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">
              A modern browser-based font identification tool.
              Built with React, Tesseract.js, and cutting-edge web technologies.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App