import React, { useState, useEffect } from 'react'
import { createWorker } from 'tesseract.js'
import { FaEdit, FaEye, FaRedo, FaSearch, FaLightbulb, FaExclamationTriangle } from 'react-icons/fa'
import { MdOutlineTextFields, MdOutlineCheckCircle } from 'react-icons/md'

/**
 * OcrProcessor Component
 * Uses Tesseract.js to extract text from cropped images
 * Provides progress feedback and text editing capabilities
 */
function OcrProcessor({ imageUrl, onTextExtracted, setIsProcessing }) {
  const [extractedText, setExtractedText] = useState('')
  const [progress, setProgress] = useState(0)
  const [isProcessing, setLocalProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    performOCR()
  }, [imageUrl])

  // Perform OCR using Tesseract.js
  const performOCR = async () => {
    if (!imageUrl) {
      console.error('No image URL provided for OCR');
      setError('No image provided for text recognition');
      return;
    }

    console.log('Starting OCR processing for image');
    setLocalProcessing(true);
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    let worker;

    try {
      // Create worker with logger configuration for Tesseract.js v6
      worker = await createWorker('eng', 1, {
        logger: m => {
          console.log('OCR Progress:', m);

          // Handle progress based on status
          if (m.status === 'recognizing text') {
            setProgress(80);
          } else if (m.status === 'succeeded') {
            setProgress(100);
          } else if (m.status === 'loading tesseract core' && m.progress === 1) {
            setProgress(20);
          } else if (m.status === 'initializing tesseract' && m.progress === 1) {
            setProgress(40);
          } else if (m.status === 'loading language traineddata' && m.progress === 1) {
            setProgress(60);
          } else if (m.status === 'initializing api' && m.progress === 1) {
            setProgress(70);
          }
        }
      });

      // Perform OCR with the worker - no need to initialize separately in v6
      const result = await worker.recognize(imageUrl);

      const { text, confidence } = result.data;

      if (!text) {
        throw new Error('No text was recognized in the image');
      }

      // Clean up extracted text
      const cleanedText = text.trim().replace(/\n+/g, ' ').replace(/\s+/g, ' ');
      setExtractedText(cleanedText);

      // Show confidence warning if low
      if (confidence < 70) {
        setError(`Text recognition confidence is low (${confidence.toFixed(1)}%). You may need to edit the text.`);
      }

      return { text, confidence };
    } catch (err) {
      console.error('OCR Processing Error:', err);
      const errorMessage = err.message || 'Failed to extract text';
      console.error('OCR Processing Error:', {
        error: err,
        message: errorMessage,
        stack: err.stack,
        imageUrl: imageUrl ? 'URL available' : 'No URL'
      });

      // Provide more specific error messages based on error type
      let userMessage = 'Failed to extract text. ';
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        userMessage += 'Network error. Please check your connection.';
      } else if (errorMessage.includes('language')) {
        userMessage += 'Language pack not available. Please try a different language.';
      } else if (errorMessage.includes('image')) {
        userMessage += 'Invalid or corrupted image. Please try with a different image.';
      } else {
        userMessage += 'Please try again with a clearer image.';
      }

      setError(userMessage);
      throw err;
    } finally {
      // Always terminate the worker when done
      if (worker) {
        await worker.terminate();
        console.log('Tesseract worker terminated');
      }
      setLocalProcessing(false);
      setIsProcessing(false);
    }
  }

  // Handle text editing
  const handleTextChange = (e) => {
    setExtractedText(e.target.value)
  }

  // Confirm extracted text and proceed
  const handleConfirm = () => {
    if (extractedText.trim()) {
      onTextExtracted(extractedText.trim())
    }
  }

  // Retry OCR
  const handleRetry = () => {
    performOCR()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
          <MdOutlineTextFields className="text-white text-2xl" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Extract Text
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          We're analyzing your image to identify the text content
        </p>
      </div>

      {/* Original cropped image */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Text Area Preview</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">The selected region for text extraction</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-inner border dark:border-gray-700">
          <img
            src={imageUrl}
            alt="Cropped text area"
            className="max-w-full max-h-64 mx-auto rounded-lg object-contain"
          />
        </div>
      </div>

      {/* Progress indicator */}
      {isProcessing && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-shrink-0">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Extracting Text...</span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
            {progress < 30 && 'Initializing OCR engine...'}
            {progress >= 30 && progress < 60 && 'Loading language data...'}
            {progress >= 60 && progress < 80 && 'Processing image...'}
            {progress >= 80 && 'Recognizing text...'}
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-300 text-lg" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Attention Required</h3>
              <p className="text-yellow-700 dark:text-yellow-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Extracted text display/editing */}
      {extractedText && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Extracted Text</h3>
              <p className="text-gray-600 dark:text-gray-400">Review and edit if necessary</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-all duration-300 font-medium"
            >
              {isEditing ? (
                <>
                  <FaEye className="text-gray-600 dark:text-gray-400" />
                  <span>Preview</span>
                </>
              ) : (
                <>
                  <FaEdit className="text-gray-600 dark:text-gray-400" />
                  <span>Edit Text</span>
                </>
              )}
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={extractedText}
                onChange={handleTextChange}
                className="w-full p-6 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-300 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows="5"
                placeholder="Edit the extracted text if needed..."
              />
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <FaLightbulb className="text-indigo-500 dark:text-indigo-400" />
                <span>Make sure the text is accurate for better font matching</span>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl">
              <p className="text-gray-900 dark:text-white text-lg leading-relaxed whitespace-pre-wrap font-medium">
                {extractedText || 'No text extracted'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {error && (
          <button
            onClick={handleRetry}
            disabled={isProcessing}
            className="flex items-center justify-center space-x-3 px-8 py-4 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-all duration-300 font-semibold border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md disabled:opacity-50 w-full sm:w-auto"
          >
            <FaRedo className={isProcessing ? 'animate-spin' : ''} />
            <span>Retry OCR</span>
          </button>
        )}

        <button
          onClick={handleConfirm}
          disabled={!extractedText.trim() || isProcessing}
          className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          <FaSearch />
          <span>Find Matching Fonts</span>
        </button>
      </div>

      {/* Tips */}
      {!isProcessing && !extractedText && !error && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border border-blue-200 dark:border-blue-700 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <FaLightbulb className="text-blue-600 dark:text-blue-300 text-lg" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">Tips for Better OCR Results</h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800 dark:text-blue-300">
                <div className="flex items-center space-x-2">
                  <MdOutlineCheckCircle className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  <span>Use high-contrast images (dark text on light background)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MdOutlineCheckCircle className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  <span>Ensure text is clearly visible and not blurry</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MdOutlineCheckCircle className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  <span>Crop closely around the text area</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MdOutlineCheckCircle className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  <span>Avoid images with complex backgrounds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OcrProcessor