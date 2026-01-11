import { useState, useEffect } from "react";
import axios from "axios";

interface UseS3ImageOptions {
  fallbackUrl?: string;
  retryAttempts?: number;
  defaultAvatarName?: string;
}

export const useS3Image = (
  imageKey: string | undefined,
  options: UseS3ImageOptions = {}
) => {
  const { fallbackUrl, retryAttempts = 2, defaultAvatarName } = options;

  // Initial checks for local image types to prevent unnecessary state changes
  const isLocalImage =
    imageKey && (imageKey.startsWith("blob:") || imageKey.startsWith("data:"));

  const [imageUrl, setImageUrl] = useState<string>(
    isLocalImage ? imageKey : ""
  );
  const [isLoading, setIsLoading] = useState(!isLocalImage);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const defaultFallbackUrl = defaultAvatarName
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultAvatarName)}`
    : fallbackUrl;
  const loadImage = async () => {
    if (!imageKey) {
      setImageUrl(defaultFallbackUrl || "");
      setIsLoading(false);
      return;
    }

    // If it's a blob URL, just use it directly without verification
    if (imageKey.startsWith("blob:") || imageKey.startsWith("data:")) {
      setImageUrl(imageKey);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(false);

      // If it's already a full URL, verify it works
      if (imageKey.startsWith("http")) {
        const img = new Image();
        img.src = imageKey;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        setImageUrl(imageKey);
        setIsLoading(false);
        return;
      }

      // Otherwise, fetch from S3
      const response = await axios.get(
        `/api/get-s3-image?key=${encodeURIComponent(imageKey)}`
      );

      if (response.data.status === "ok" && response.data.url) {
        // Verify the URL works
        try {
          const img = new Image();
          img.src = response.data.url;
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Image load timeout"));
            }, 10000); // 10 second timeout

            img.onload = () => {
              clearTimeout(timeout);
              resolve(true);
            };
            img.onerror = (e) => {
              clearTimeout(timeout);
              reject(new Error("Image load failed")); // Always reject with Error
            };
          });
          setImageUrl(response.data.url);
        } catch (verifyError) {
          console.error("Error verifying image URL:", verifyError);
          throw new Error("Failed to verify image URL");
        }
      } else {
        throw new Error("Invalid response from S3 API");
      }
    } catch (error) {
      // console.error("Error loading S3 image:", error);
      setError(true);

      // Retry logic with exponential backoff
      if (retryCount < retryAttempts) {
        const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 10000); // Cap at 10 seconds
        setRetryCount((prev) => prev + 1);
        setTimeout(() => loadImage(), backoffTime);
      } else {
        setImageUrl(defaultFallbackUrl || "");
      }
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    // If it's a local image (blob: or data:), skip the loading process
    if (
      imageKey &&
      (imageKey.startsWith("blob:") || imageKey.startsWith("data:"))
    ) {
      setImageUrl(imageKey);
      setIsLoading(false);
      setError(false); // Make sure no error is shown for blob URLs
      return;
    }

    setRetryCount(0); // Reset retry count when imageKey changes
    loadImage();

    return () => {
      // Clean up any blob URLs we might have created
      if (imageUrl && imageUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(imageUrl);
        } catch (e) {
          console.warn("Failed to revoke object URL", e);
        }
      }
      setImageUrl(""); // Clear the image URL on unmount
    };
  }, [imageKey]); // Only depend on imageKey to prevent unnecessary retries

  // Manual retry function that resets the retry count and triggers a new load
  const retry = () => {
    setRetryCount(0);
    loadImage();
  };

  return {
    imageUrl: imageUrl || defaultFallbackUrl || "",
    isLoading,
    error,
    retry,
  };
};

// Utility function for profile images specifically
export const useProfileImage = (
  imageKey: string | undefined,
  fallbackName: string,
  retryAttempts: number = 2
) => {
  return useS3Image(imageKey, {
    defaultAvatarName: fallbackName,
    retryAttempts,
  });
};
