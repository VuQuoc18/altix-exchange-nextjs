'use client';

import React, { useRef } from 'react';
import { useCms } from './CmsProvider';

type EditableImageProps = {
  pageSlug: string;
  path: string;
  fallback: string;
  alt: string;
  className?: string;
};

export default function EditableImage({
  pageSlug,
  path,
  fallback,
  alt,
  className,
}: EditableImageProps) {
  const { isEditing, getString, patch, uploadMedia } = useCms();
  const inputRef = useRef<HTMLInputElement>(null);
  const url = getString(pageSlug, path, fallback);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const uploadedUrl = await uploadMedia(file);
      patch(pageSlug, path, uploadedUrl);
    } catch {
      // upload errors surface via toolbar status when patch fails
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className={`relative inline-block ${className ?? ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url || fallback} alt={alt} className={className} />
      {isEditing ? (
        <>
          <button
            type="button"
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-[#17192b]/50 text-sm font-medium text-white opacity-0 transition hover:opacity-100"
            onClick={() => inputRef.current?.click()}
          >
            Change image
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => void handleFile(event)}
          />
        </>
      ) : null}
    </div>
  );
}
