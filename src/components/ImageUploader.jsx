import React, { useState, useRef } from 'react'
import { FaCloudUploadAlt, FaFileImage, FaRedo, FaArrowRight } from 'react-icons/fa'
import { MdOutlineDriveFolderUpload } from 'react-icons/md'

/**
 * ImageUploader Component
 * Handles image upload via drag-and-drop or file selection
 * Validates file types and provides preview functionality
 */
function ImageUploader({ onImageUpload }) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  // Handle file selection and validation
  const handleFileSelect = (file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  // Handle drag and drop events
  const handleDragEnter = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    handleFileSelect(file)
  }

  // Confirm and proceed with selected image
  const handleConfirmImage = () => {
    if (previewUrl) {
      onImageUpload(previewUrl)
    }
  }

  // Reset selection
  const handleReset = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Upload Your Image
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
          Drag and drop your image or browse to get started with font identification
        </p>
      </div>

      {!previewUrl ? (
        <div
          className={`border-3 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 ${isDragging
              ? 'border-indigo-500 bg-indigo-50 dark:bg-gray-700 shadow-lg scale-[1.02]'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800 hover:shadow-md'
            }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="mb-8">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 transition-all duration-300 ${isDragging
                ? 'bg-indigo-100 text-indigo-600 scale-110'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
              }`}>
              <FaCloudUploadAlt className="text-4xl" />
            </div>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
              {isDragging ? 'Drop your image here' : 'Drag and drop your image'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">or</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg mx-auto"
          >
            <MdOutlineDriveFolderUpload className="text-xl" />
            <span>Browse Files</span>
          </button>

          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center space-x-2">
                <FaFileImage className="text-indigo-500 dark:text-indigo-400" />
                <span>JPG, PNG, GIF</span>
              </div>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>Max 10MB</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Image Preview</h3>
              <p className="text-gray-600 dark:text-gray-300">Ready for font identification</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-inner border dark:border-gray-700">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-80 mx-auto rounded-lg object-contain shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleReset}
              className="flex items-center justify-center space-x-3 px-8 py-4 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-all duration-300 font-medium border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md w-full sm:w-auto"
            >
              <FaRedo className="text-gray-500 dark:text-gray-400" />
              <span>Choose Different Image</span>
            </button>
            <button
              onClick={handleConfirmImage}
              className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg w-full sm:w-auto"
            >
              <span>Proceed to Crop</span>
              <FaArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploader