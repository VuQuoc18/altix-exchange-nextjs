'use client';

import React, { useRef } from 'react';
import { useCms } from './CmsProvider';

type EditableBlogImageProps = {
  blogId: string;
  path: string;
  value: string;
  onValueChange: (value: string) => void;
  alt: string;
  className?: string;
};

export default function EditableBlogImage({
  blogId,
  path,
  value,
  onValueChange,
  alt,
  className,
}: EditableBlogImageProps) {
  const { isEditing, patchBlogField, uploadMedia } = useCms();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const uploadedUrl = await uploadMedia(file);
      onValueChange(uploadedUrl);
      patchBlogField(blogId, path, uploadedUrl);
    } catch {
      // upload errors surface via toolbar status when patch fails
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full min-h-[220px] w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm text-slate-500">
          No cover image
        </div>
      )}
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
