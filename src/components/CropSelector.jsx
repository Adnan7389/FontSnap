import React, { useEffect, useRef, useState } from 'react'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

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

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Select Text Area
      </h2>
      
      <div className="bg-gray-100 rounded-xl p-4 mb-6">
        <div className="max-h-96 overflow-hidden">
          <img 
            ref={imageRef}
            src={imageUrl} 
            alt="Crop area selection"
            className="max-w-full block"
          />
        </div>
      </div>

      {/* Cropper Controls */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <button
          onClick={() => handleRotate(-90)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          disabled={!isReady}
        >
          ↺ Rotate Left
        </button>
        <button
          onClick={() => handleRotate(90)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          disabled={!isReady}
        >
          ↻ Rotate Right
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          disabled={!isReady}
        >
          Reset Crop
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900 mb-2">How to crop:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Drag to create a selection around the text you want to identify</li>
          <li>• Resize the selection by dragging the corners</li>
          <li>• Move the selection by dragging the center</li>
          <li>• For best results, select only the text area without background</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={handleCropConfirm}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
          disabled={!isReady}
        >
          Extract Text from Selection
        </button>
      </div>
    </div>
  )
}

export default CropSelector