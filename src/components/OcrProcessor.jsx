import React, { useState, useEffect } from 'react'
import { createWorker } from 'tesseract.js'

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
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Extract Text
      </h2>

      {/* Original cropped image */}
      <div className="bg-gray-100 rounded-xl p-4 mb-6">
        <img 
          src={imageUrl} 
          alt="Cropped text area" 
          className="max-w-full mx-auto rounded-lg shadow-md"
        />
      </div>

      {/* Progress indicator */}
      {isProcessing && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Extracting text...</span>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-yellow-800">{error}</p>
          </div>
        </div>
      )}

      {/* Extracted text display/editing */}
      {extractedText && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Extracted Text</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            >
              {isEditing ? 'Preview' : 'Edit'}
            </button>
          </div>

          {isEditing ? (
            <textarea
              value={extractedText}
              onChange={handleTextChange}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="4"
              placeholder="Edit the extracted text if needed..."
            />
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">
                {extractedText || 'No text extracted'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-4 justify-center">
        {error && (
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            disabled={isProcessing}
          >
            Retry OCR
          </button>
        )}
        
        <button
          onClick={handleConfirm}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
          disabled={!extractedText.trim() || isProcessing}
        >
          Find Matching Fonts
        </button>
      </div>

      {/* Tips */}
      {!isProcessing && !extractedText && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Tips for better OCR results:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use high-contrast images (dark text on light background)</li>
            <li>• Ensure text is clearly visible and not blurry</li>
            <li>• Crop closely around the text area</li>
            <li>• Avoid images with complex backgrounds</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default OcrProcessor