

# Skin Cancer Scan Mobile App

This mobile app allows users to upload images or take pictures of skin lesions to perform a skin cancer scan. The app interacts with a backend API built with FastAPI to analyze the image and return results related to the likelihood of different types of skin cancer. The app displays the results and allows users to view detailed information, including urgency and an explanation of the scan.



![image](https://github.com/user-attachments/assets/f70bc06d-26db-4949-80d1-c0afc46e0980)  ![image](https://github.com/user-attachments/assets/75cc07e7-1b92-462c-9cc5-81346c17ac09)
![image](https://github.com/user-attachments/assets/1651a1b3-a917-4e3c-9d51-82e8064e03d5)



## Features

- **Home Screen**: 
  - Upload an image from the device's gallery.
  - Take a picture using the camera.
  - After uploading or taking a picture, the scan result is displayed in a modal with details about the skin lesion.
  - The scan result includes a list of labels (e.g., Melanocytic nevus) and their respective probabilities, as well as an explainability image showing a visual representation of the analysis.
  
- **History Screen**:
  - View a list of all scans previously performed on the device.
  - Users can update the result of a scan if a doctor provides an updated diagnosis.

## Requirements

- **React Native** with **Expo**
- **FastAPI** (Backend)
- **SQLModel** (for the backend database)
- **Python 3.9+**
- **Expo Image Picker** for handling image uploads and camera functionality.


### 1. Install Expo CLI

If you don't have Expo CLI installed, run the following command to install it globally:

```bash
npm install -g expo-cli
```

### 2. Install Dependencies

Navigate to the project folder for the mobile app and install the dependencies:

```bash
npm install
```

### 3. Run the App

To start the Expo project, run the following command:

```bash
expo start
```

This will open a QR code in the terminal that you can scan with the Expo Go app on your mobile device, or you can open the app in an emulator.

## App Overview

### Home Screen

On the home screen, you will find two buttons:

* **Upload Image**: Opens the device's media library for the user to select an image.
* **Take a Picture**: Opens the camera to take a new picture.

Once an image is selected or taken, the image is uploaded to the backend API for analysis. The app will then show a modal with the scan result, including the probability of different skin lesions and an explainability image for further interpretation.

### History Screen

The history screen shows a list of all previously scanned images. Each scan can be selected, and the result can be updated manually if a doctor provides a different diagnosis.

## Backend API

### Endpoints

* **POST /quick-scan/**: Uploads an image for analysis and returns the scan result.

  **Request**:

  * `file` (multipart/form-data): The image file to be uploaded.

  **Response**:

  ```json
  {
    "id": 1,
    "result": [
      {
        "label": "Melanocytic nevus",
        "score": 0.9998923540115356
      },
      {
        "label": "Benign keratosis",
        "score": 0.00008964481094153598
      }
    ],
    "explainability_image_path": "explainability/explain_559564.png"
  }
  ```

* **GET /scans/**: Returns a list of all the scans.

* **PUT /update-result/{scan\_id}/**: Allows updating the actual result of a scan.

  **Request**:

  * `actual_result` (form-data): The updated result from the doctor.

  **Response**:

  ```json
  {
    "message": "Actual result updated successfully",
    "scan_id": 1,
    "ActualResult": "Benign keratosis"
  }
  ```

### Example Usage

1. The user selects or takes a photo of a skin lesion.
2. The app uploads the image to the backend and receives a JSON response with the scan results.
3. The result includes a list of skin lesion types (e.g., Melanocytic nevus, Benign keratosis) and their likelihood scores.
4. The app displays this result and an explainability image that helps explain the analysis.

## Troubleshooting

### Permissions

Ensure that the app has permission to access the device's camera and media library. If permissions are denied, the app may not be able to pick or capture images.

### API Issues

If you're running the backend locally, ensure that the backend server is running on `http://127.0.0.1:8000`. You may need to adjust the API URL in the mobile app if the server is hosted elsewhere.

## Technologies Used

* **React Native**: A framework for building native mobile apps using React.
* **Expo**: A framework and platform for universal React applications.
* **FastAPI**: A modern web framework for building APIs with Python 3.6+ based on standard Python type hints.
* **SQLModel**: SQL database library for Python, built on top of SQLAlchemy and Pydantic.




