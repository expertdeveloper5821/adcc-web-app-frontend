import React, { useState } from 'react';
import { ArrowLeft, Upload, Calendar, MapPin, Clock, Users, Image as ImageIcon, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { createEvent, EventApiResponse } from '../../services/eventsApi';

interface EventCreateProps {
  navigate: (page: string, params?: any) => void;
}

export function EventCreate({ navigate }: EventCreateProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mainImage: '',
    eventImage: '',
    eventDate: '',
    eventTime: '',
    address: '',
    maxParticipants: 500,
    minAge: 16,
    maxAge: 70,
    youtubeLink: '',
  });

  // Helper function to compress and resize image before converting to base64
  // More aggressive compression to prevent payload too large errors
  const compressImage = (file: File, maxWidth: number = 1200, maxHeight: number = 800, maxBase64Size: number = 500 * 1024): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file'));
        return;
      }

      // Validate file size (max 10MB before compression)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        reject(new Error('Image size should be less than 10MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions (more aggressive resizing)
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          // Create canvas and compress
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Failed to create canvas context'));
            return;
          }

          // Use better image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Always convert to JPEG for better compression, regardless of input format
          // Try different quality levels until we get under the size limit
          const qualities = [0.7, 0.5, 0.4, 0.3, 0.2, 0.15];
          let bestBase64 = '';
          let bestSize = Infinity;

          for (const quality of qualities) {
            // Always use JPEG format for maximum compression
            const base64String = canvas.toDataURL('image/jpeg', quality);
            // Base64 string size is approximately 4/3 of the original size
            const base64Size = (base64String.length * 3) / 4;
            
            if (base64Size <= maxBase64Size) {
              resolve(base64String);
              return;
            }
            
            // Keep track of the smallest we've seen
            if (base64Size < bestSize) {
              bestSize = base64Size;
              bestBase64 = base64String;
            }
          }

          // If we still couldn't get under the limit, use the best we have
          // but warn the user
          if (bestBase64) {
            console.warn(`Image compressed to ${Math.round(bestSize / 1024)}KB, which may still be large`);
            resolve(bestBase64);
          } else {
            reject(new Error('Image is too large even after compression. Please use a smaller image.'));
          }
        };
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (field: 'mainImage' | 'eventImage', file: File) => {
    try {
      // Compress and convert to base64
      const base64String = await compressImage(file);
      
      // Update form data with base64 string
      setFormData((prev) => ({ ...prev, [field]: base64String }));
      toast.success('Image converted to base64 successfully');
    } catch (error: any) {
      console.error('Error processing image:', error);
      toast.error(error.message || 'Failed to process image. Please try a smaller image.');
    }
  };

  const handleSubmit = async (status: 'Draft' | 'Published') => {
    if (!formData.title || !formData.eventDate || !formData.address) {
      toast.error('Please fill in all required fields (Title, Date, Address)');
      return;
    }

    // Validate image sizes before submitting (max 500KB per image in base64)
    const maxImageSize = 500 * 1024; // 500KB
    if (formData.mainImage) {
      const mainImageSize = (formData.mainImage.length * 3) / 4; // Approximate actual size
      if (mainImageSize > maxImageSize) {
        toast.error(`Main image is too large (${Math.round(mainImageSize / 1024)}KB). Please use a smaller image.`);
        return;
      }
    }
    if (formData.eventImage) {
      const eventImageSize = (formData.eventImage.length * 3) / 4; // Approximate actual size
      if (eventImageSize > maxImageSize) {
        toast.error(`Event image is too large (${Math.round(eventImageSize / 1024)}KB). Please use a smaller image.`);
        return;
      }
    }

    // Check total payload size (max 1MB for both images combined)
    const totalImageSize = 
      (formData.mainImage ? (formData.mainImage.length * 3) / 4 : 0) +
      (formData.eventImage ? (formData.eventImage.length * 3) / 4 : 0);
    
    if (totalImageSize > 1024 * 1024) { // 1MB total
      toast.error('Combined image size is too large. Please reduce image sizes or remove one image.');
      return;
    }

    setIsLoading(true);
    try {
      // Map status to API format
      const apiStatus = status === 'Published' ? 'upcoming' : 'upcoming'; // API uses: upcoming, ongoing, completed, cancelled
      
      // Prepare event data with base64 images
      const eventData: Partial<EventApiResponse> = {
        title: formData.title,
        description: formData.description,
        mainImage: formData.mainImage ? formData.mainImage : undefined,
        eventImage: formData.eventImage ? formData.eventImage : undefined,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        address: formData.address,
        maxParticipants: formData.maxParticipants,
        minAge: formData.minAge,
        maxAge: formData.maxAge,
        youtubeLink: formData.youtubeLink || undefined,
        status: apiStatus,
      };

      // Log image sizes and base64 URLs for debugging
      if (eventData.mainImage) {
        const mainImageSize = Math.round(((eventData.mainImage.length * 3) / 4) / 1024);
        console.log(`Main image base64 size: ~${mainImageSize}KB`);
        console.log('Main Image Base64 URL:', eventData.mainImage);
        console.log('Main Image Base64 URL (first 100 chars):', eventData.mainImage.substring(0, 100) + '...');
      }
      if (eventData.eventImage) {
        const eventImageSize = Math.round(((eventData.eventImage.length * 3) / 4) / 1024);
        console.log(`Event image base64 size: ~${eventImageSize}KB`);
        console.log('Event Image Base64 URL:', eventData.eventImage);
        console.log('Event Image Base64 URL (first 100 chars):', eventData.eventImage.substring(0, 100) + '...');
      }

      // Log the complete event data being sent to backend
      console.log('📤 Sending event data to backend:', {
        ...eventData,
        mainImage: eventData.mainImage ? `${eventData.mainImage.substring(0, 50)}... (${Math.round(eventData.mainImage.length / 1024)}KB)` : undefined,
        eventImage: eventData.eventImage ? `${eventData.eventImage.substring(0, 50)}... (${Math.round(eventData.eventImage.length / 1024)}KB)` : undefined,
      });

      const createdEvent = await createEvent(eventData);
      toast.success(`Event ${status === 'Published' ? 'published' : 'saved as draft'} successfully`);
      navigate('event-detail', { selectedEventId: createdEvent._id || createdEvent.id });
    } catch (error: any) {
      console.error('Error creating event:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create event. Please try again.';
      
      // Check for payload too large error
      if (errorMessage.includes('too large') || errorMessage.includes('PayloadTooLarge')) {
        toast.error('Image size is too large. Please use smaller images. Maximum recommended size is 500KB per image.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('events')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: '#333' }} />
        </button>
        <div>
          <h1 className="text-3xl mb-2" style={{ color: '#333' }}>Create Event</h1>
          <p style={{ color: '#666' }}>Set up a new cycling event</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Info */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>Event Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Event Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Abu Dhabi Cycling Challenge 2025"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed event description"
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>YouTube Link</label>
                <input
                  type="url"
                  value={formData.youtubeLink}
                  onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=example"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>Schedule</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Date *</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Time *</label>
                <input
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <MapPin className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>Location</h2>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: '#666' }}>Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g., Yas Marina Circuit, Abu Dhabi"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                style={{ focusRing: '#C12D32' }}
              />
            </div>
          </div>

          {/* Media */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <ImageIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>Media</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Main Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload('mainImage', file);
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
                {formData.mainImage && (() => {
                  const imageSize = Math.round(((formData.mainImage.length * 3) / 4) / 1024);
                  const isTooLarge = imageSize > 500;
                  return (
                    <div className="mt-3">
                      <p className={`text-xs mb-2 ${isTooLarge ? 'text-red-600 font-semibold' : ''}`} style={isTooLarge ? {} : { color: '#999' }}>
                        Image converted to base64 (size: ~{imageSize}KB)
                        {isTooLarge && ' - WARNING: Image is too large! Please use a smaller image.'}
                      </p>
                      <img 
                        src={formData.mainImage} 
                        alt="Main image preview" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Event Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload('eventImage', file);
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
                {formData.eventImage && (() => {
                  const imageSize = Math.round(((formData.eventImage.length * 3) / 4) / 1024);
                  const isTooLarge = imageSize > 500;
                  return (
                    <div className="mt-3">
                      <p className={`text-xs mb-2 ${isTooLarge ? 'text-red-600 font-semibold' : ''}`} style={isTooLarge ? {} : { color: '#999' }}>
                        Image converted to base64 (size: ~{imageSize}KB)
                        {isTooLarge && ' - WARNING: Image is too large! Please use a smaller image.'}
                      </p>
                      <img 
                        src={formData.eventImage} 
                        alt="Event image preview" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration */}
          <div className="p-6 rounded-2xl shadow-sm bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#ECC180' }}>
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl" style={{ color: '#333' }}>Registration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Max Participants</label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 500 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Min Age</label>
                <input
                  type="number"
                  value={formData.minAge}
                  onChange={(e) => setFormData({ ...formData, minAge: parseInt(e.target.value) || 16 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ color: '#666' }}>Max Age</label>
                <input
                  type="number"
                  value={formData.maxAge}
                  onChange={(e) => setFormData({ ...formData, maxAge: parseInt(e.target.value) || 70 })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2"
                  style={{ focusRing: '#C12D32' }}
                />
              </div>
            </div>
          </div>


          {/* Actions */}
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-3">
            <button
              onClick={() => handleSubmit('Published')}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#C12D32' }}
            >
              {isLoading ? 'Creating...' : 'Publish Event'}
            </button>
            <button
              onClick={() => handleSubmit('Draft')}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#ECC180', color: '#333' }}
            >
              {isLoading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={() => navigate('events')}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 transition-all hover:bg-gray-50 disabled:opacity-50"
              style={{ color: '#666' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
