export const compressImage = (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_BASE64_SIZE = 500 * 1024; // 500KB

    if (file.size > MAX_FILE_SIZE) {
      reject(new Error('Image file is too large. Maximum size is 10MB.'));
      return;
    }

    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
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
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        let currentQuality = quality;
        let base64String = canvas.toDataURL('image/jpeg', currentQuality);
        
        // Reduce quality until size is acceptable
        let attempts = 0;
        const MAX_ATTEMPTS = 5;
        
        while (base64String.length > MAX_BASE64_SIZE && attempts < MAX_ATTEMPTS) {
          currentQuality -= 0.1;
          if (currentQuality < 0.3) {
            currentQuality = 0.3;
            break;
          }
          base64String = canvas.toDataURL('image/jpeg', currentQuality);
          attempts++;
        }
        
        resolve(base64String);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const validateImageSize = (base64: string): boolean => {
  const size = base64.length * 0.75; // Approximate byte size
  return size <= 500 * 1024; // 500KB
};