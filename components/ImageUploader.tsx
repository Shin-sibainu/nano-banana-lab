"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import type { ImageData } from "@/lib/types";

interface ImageUploaderProps {
  value?: ImageData;
  onChange: (value: ImageData | undefined) => void;
  required?: boolean;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  required,
  className,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback(
    (file: File) => {
      // Check file size
      if (file.size > 5 * 1024 * 1024) {
        alert("ファイルサイズは5MB以下にしてください");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;

          // Improved quality: 768px for better results while staying safe
          // Testing shows 768px = ~50-80KB per image = safe under 32K token limit
          const maxSize = 768; // Increased for better quality
          let width = img.width;
          let height = img.height;

          // Always resize to reduce tokens
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            } else {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Better quality compression for 768px
          const dataUrl = canvas.toDataURL("image/jpeg", 0.65); // Increased quality
          const base64 = dataUrl.split(",")[1]; // Extract pure base64

          // Calculate size
          const sizeInKB = Math.round((base64.length * 3) / 4 / 1024);

          // Check if still too large (adjusted threshold for 768px)
          if (sizeInKB > 300) {
            // Increased threshold
            // Fallback to smaller dimensions
            const smallerSize = 640;
            let smallWidth = img.width;
            let smallHeight = img.height;

            if (smallWidth > smallerSize || smallHeight > smallerSize) {
              if (smallWidth > smallHeight) {
                smallHeight = Math.round(
                  (smallHeight * smallerSize) / smallWidth
                );
                smallWidth = smallerSize;
              } else {
                smallWidth = Math.round(
                  (smallWidth * smallerSize) / smallHeight
                );
                smallHeight = smallerSize;
              }
            }

            canvas.width = smallWidth;
            canvas.height = smallHeight;
            ctx.drawImage(img, 0, 0, smallWidth, smallHeight);

            const dataUrlSmall = canvas.toDataURL("image/jpeg", 0.6);
            const base64Small = dataUrlSmall.split(",")[1];
            const sizeSmallKB = Math.round((base64Small.length * 3) / 4 / 1024);
            onChange({
              base64: base64Small,
              mimeType: "image/jpeg",
              previewUrl: dataUrlSmall,
            });
            return;
          }

          onChange({
            base64: base64,
            mimeType: "image/jpeg",
            previewUrl: dataUrl,
          });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith("image/"));

      if (imageFile) {
        handleFileSelect(imageFile);
      }
    },
    [handleFileSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
          value ? "aspect-square" : "aspect-video"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        {value ? (
          <div className="relative w-full h-full">
            <NextImage
              src={value.previewUrl}
              alt="Uploaded image"
              fill
              className="object-cover rounded-md"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-2">
              画像をドラッグ&ドロップまたはクリックして選択
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              PNG, JPG, WEBP (最大5MB)
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              ファイルを選択
            </Button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}
