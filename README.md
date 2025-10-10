# FontSnap 📸

FontSnap is a web application that allows you to identify fonts from any image. Simply upload an image, select the text you want to identify, and FontSnap will find the closest matching fonts from Google Fonts.

## ✨ Features

*   **Image Upload:** Upload images via drag-and-drop or file selection.
*   **Interactive Cropping:** Select the exact text area you want to identify using an intuitive cropping tool.
*   **Text Extraction (OCR):** Extracts the text from the cropped image using Tesseract.js.
*   **Font Matching:** Compares the extracted text with a library of Google Fonts to find the best matches.
*   **Results Display:** Shows the top 3 font matches with similarity scores and previews.
*   **Export Options:** Copy the font's CSS, view it on Google Fonts, or download a preview of the font.

## 🚀 How It Works

1.  **Upload Image:** Start by uploading an image containing the text you want to identify.
2.  **Crop Text:** Use the crop selector to draw a box around the text. You can resize and move the box for a precise selection.
3.  **Extract Text:** FontSnap uses OCR to extract the text from your selection. You can edit the extracted text if needed.
4.  **Find Fonts:** The application then renders the extracted text in various fonts and compares them to your original image to calculate a similarity score.
5.  **View Results:** The top 3 matching fonts are displayed with previews and links to Google Fonts.

## 🛠️ Technologies Used

*   **Frontend:** React, Vite, Tailwind CSS
*   **Image Cropping:** Cropper.js
*   **Text Extraction:** Tesseract.js
*   **Font Matching:** Custom canvas-based image comparison algorithm.

## 🏁 Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/FontSnap.git
    cd FontSnap
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173`.

## 🖼️ Screenshots

*(Placeholder for screenshots of the application in action)*

---

*This project was created as a demonstration of font identification from an image.*