import React, { useEffect, useRef, useState } from 'react'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import './Cropper.css'
import { FaCropAlt, FaRedo, FaExpand, FaMousePointer, FaArrowRight } from 'react-icons/fa'
import { MdRotateLeft, MdRotateRight, MdOutlineZoomOutMap } from 'react-icons/md'

/**
 * CropSelector Component
 * Uses Cropper.js to allow users to select text areas from uploaded images
 * Provides cropping functionality with real-time preview
 */
function CropSelector({ imageUrl, onCropComplete }) {
  const imageRef = useRef(null)
  const cropperRef = useRef(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (imageRef.current && imageUrl) {
      // Initialize Cropper.js
      cropperRef.current = new Cropper(imageRef.current, {
        aspectRatio: NaN, // Free aspect ratio
        viewMode: 1,
        guides: true,
        center: true,
        highlight: true,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        ready() {
          setIsReady(true)
        }
      })
    }

    // Cleanup on unmount
    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy()
      }
    }
  }, [imageUrl])

  // Get cropped image and proceed
  const handleCropConfirm = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCroppedCanvas({
        width: 800,
        height: 400,
        imageSmoothingEnabled: false,
        imageSmoothingQuality: 'high',
      })

      const croppedImageUrl = canvas.toDataURL('image/png')
      onCropComplete(croppedImageUrl)
    }
  }

  // Reset crop area
  const handleReset = () => {
    if (cropperRef.current) {
      cropperRef.current.reset()
    }
  }

  // Rotate image
  const handleRotate = (degree) => {
    if (cropperRef.current) {
      cropperRef.current.rotate(degree)
    }
  }

  // Zoom to fit
  const handleZoomToFit = () => {
    if (cropperRef.current) {
      cropperRef.current.clear()
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
          <FaCropAlt className="text-white text-2xl" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Select Text Area
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Crop the image to focus on the text you want to identify
        </p>
      </div>

      {/* Cropper Container */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Image Cropping Tool</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Select the text area by dragging and resizing the crop box</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-inner border border-gray-300 dark:border-gray-700">
          <div className="max-h-96 overflow-hidden rounded-lg">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop area selection"
              className="max-w-full block"
            />
          </div>
        </div>
      </div>

      {/* Cropper Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Crop Controls</h3>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => handleRotate(-90)}
            disabled={!isReady}
            className="flex items-center space-x-3 px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-all duration-300 font-medium border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdRotateLeft className="text-gray-600 dark:text-gray-400 text-xl" />
            <span>Rotate Left</span>
          </button>
          <button
            onClick={() => handleRotate(90)}
            disabled={!isReady}
            className="flex items-center space-x-3 px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-all duration-300 font-medium border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdRotateRight className="text-gray-600 dark:text-gray-400 text-xl" />
            <span>Rotate Right</span>
          </button>
          <button
            onClick={handleReset}
            disabled={!isReady}
            className="flex items-center space-x-3 px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-all duration-300 font-medium border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaRedo className="text-gray-600 dark:text-gray-400" />
            <span>Reset Crop</span>
          </button>
          <button
            onClick={handleZoomToFit}
            disabled={!isReady}
            className="flex items-center space-x-3 px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-all duration-300 font-medium border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdOutlineZoomOutMap className="text-gray-600 dark:text-gray-400 text-xl" />
            <span>Zoom to Fit</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border border-blue-200 dark:border-blue-700 rounded-2xl p-6 mb-8">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <FaMousePointer className="text-blue-600 dark:text-blue-300" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">How to Crop Your Image</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800 dark:text-blue-300">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-200 font-semibold text-xs">1</div>
                <span>Drag to create a selection around the text</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-200 font-semibold text-xs">2</div>
                <span>Resize the selection by dragging the corners</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-200 font-semibold text-xs">3</div>
                <span>Move the selection by dragging the center</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-200 font-semibold text-xs">4</div>
                <span>Select only the text area without background</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <button
          onClick={handleCropConfirm}
          disabled={!isReady}
          className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          <FaExpand className="text-white" />
          <span>Extract Text from Selection</span>
          <FaArrowRight className="text-white" />
        </button>
      </div>

      {/* Best Practices */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border border-green-200 dark:border-green-700 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-green-900 dark:text-green-200 mb-2">For Best Results</h4>
            <div className="text-sm text-green-800 dark:text-green-300 space-y-2">
              <p>• <strong>Crop tightly around the text</strong> - Remove unnecessary background elements</p>
              <p>• <strong>Ensure text is horizontal</strong> - Use rotate tools if text is tilted</p>
              <p>• <strong>Include complete characters</strong> - Make sure no letters are cut off</p>
              <p>• <strong>Maintain good contrast</strong> - Dark text on light background works best</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CropSelector