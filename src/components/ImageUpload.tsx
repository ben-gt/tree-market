"use client";

import { useState, useRef, useCallback } from "react";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

interface PreviewImage {
  url: string;
  isUploaded: boolean;
  file?: File;
}

export default function ImageUpload({
  images,
  onChange,
  maxImages = 5,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<PreviewImage[]>(
    images.map((url) => ({ url, isUploaded: true }))
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setError("");

      const remainingSlots = maxImages - previews.length;
      if (remainingSlots <= 0) {
        setError(`Maximum ${maxImages} images allowed`);
        return;
      }

      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      // Create local previews immediately
      const newPreviews: PreviewImage[] = [];
      for (const file of filesToProcess) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          setError("Only JPEG, PNG, and WebP images are allowed");
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError("Images must be less than 5MB");
          return;
        }

        const previewUrl = URL.createObjectURL(file);
        newPreviews.push({ url: previewUrl, isUploaded: false, file });
      }

      setPreviews((prev) => [...prev, ...newPreviews]);

      // Upload files
      setUploading(true);
      try {
        const formData = new FormData();
        filesToProcess.forEach((file) => formData.append("files", file));

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Upload failed");
        }

        const { urls } = await response.json();

        // Update previews with uploaded URLs
        setPreviews((prev) => {
          const uploaded = prev.filter((p) => p.isUploaded);
          const newUploaded = urls.map((url: string) => ({
            url,
            isUploaded: true,
          }));
          return [...uploaded, ...newUploaded];
        });

        // Clean up object URLs
        newPreviews.forEach((p) => URL.revokeObjectURL(p.url));

        // Update parent with all uploaded URLs
        onChange([...images, ...urls]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        // Remove failed previews
        setPreviews((prev) => prev.filter((p) => p.isUploaded));
      } finally {
        setUploading(false);
      }
    },
    [images, maxImages, onChange, previews.length]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeImage = (index: number) => {
    const preview = previews[index];
    if (!preview.isUploaded) {
      URL.revokeObjectURL(preview.url);
    }

    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);

    const newImages = newPreviews
      .filter((p) => p.isUploaded)
      .map((p) => p.url);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Upload area */}
      {previews.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-green-500 bg-green-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="space-y-2">
            <div className="text-4xl text-gray-400">📷</div>
            <p className="text-sm font-medium text-gray-700">
              {dragActive ? "Drop images here" : "Click or drag images to upload"}
            </p>
            <p className="text-xs text-gray-500">
              JPEG, PNG, WebP · Max 5MB each · Up to {maxImages} images
            </p>
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
                <span className="text-sm text-gray-600">Uploading...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {previews.map((preview, index) => (
            <div
              key={preview.url}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
            >
              <img
                src={preview.url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {!preview.isUploaded && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                ×
              </button>

              {index === 0 && preview.isUploaded && (
                <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        {previews.length} of {maxImages} images ·{" "}
        {previews.length > 0 ? "First image will be the main photo" : "Add at least one photo"}
      </p>
    </div>
  );
}
