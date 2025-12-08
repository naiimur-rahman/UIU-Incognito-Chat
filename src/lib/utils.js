import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export async function getIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Failed to fetch IP:", error);
    return null;
  }
}

export function getDeviceId() {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = 'dev-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

export function formatTime(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'dxjtj6wan';
const CLOUDINARY_UPLOAD_PRESET = 'Naimur';

export async function uploadToCloudinary(file, progressCallback) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);

      xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && progressCallback) {
              const percentComplete = (e.loaded / e.total) * 100;
              progressCallback(percentComplete);
          }
      };

      xhr.onload = () => {
          let response;
          try {
              response = JSON.parse(xhr.responseText);
          } catch (e) {
              response = {};
          }

          if (xhr.status === 200) {
              if (response.moderation && response.moderation.length > 0 && response.moderation[0].status === 'rejected') {
                  reject(new Error('Inappropriate content detected'));
                  return;
              }
              resolve(response.secure_url);
          } else {
              const errorMsg = response.error ? response.error.message : 'Cloudinary Upload Failed';
              reject(new Error(errorMsg));
          }
      };

      xhr.onerror = () => reject(new Error('Network Error'));

      xhr.send(formData);
  });
}
