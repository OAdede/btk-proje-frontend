// Camera and photo utilities
export const cameraUtils = {
  // Start camera stream
  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      return stream;
    } catch (error) {
      throw new Error('Kamera erişimi sağlanamadı: ' + error.message);
    }
  },

  // Stop camera stream
  stopCamera(stream) {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  },

  // Capture photo from video stream
  capturePhoto(videoElement) {
    if (!videoElement) {
      throw new Error('Video elementi bulunamadı');
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0);
    
    return canvas.toDataURL('image/jpeg');
  },

  // Handle file upload
  handlePhotoUpload(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Dosya seçilmedi'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onerror = () => {
        reject(new Error('Dosya okunamadı'));
      };
      reader.readAsDataURL(file);
    });
  },

  // Validate image file
  validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Sadece JPEG, PNG veya GIF formatında dosya yükleyebilirsiniz');
    }

    if (file.size > maxSize) {
      throw new Error('Dosya boyutu 5MB\'dan küçük olmalıdır');
    }

    return true;
  },

  // Resize image for better performance
  resizeImage(imageData, maxWidth = 300, maxHeight = 300) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imageData;
    });
  }
};
