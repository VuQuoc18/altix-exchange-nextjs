'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useCms } from './CmsProvider';

type EditableBlogTextProps = {
  blogId: string;
  path: string;
  value: string;
  onValueChange: (value: string) => void;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
};

export default function EditableBlogText({
  blogId,
  path,
  value,
  onValueChange,
  as: Tag = 'span',
  className,
}: EditableBlogTextProps) {
  const { isEditing, patchBlogField } = useCms();
  const ref = useRef<HTMLElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isEditing && ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [isEditing, value]);

  const flushPatch = useCallback(
    (nextValue: string) => {
      onValueChange(nextValue);
      patchBlogField(blogId, path, nextValue);
    },
    [blogId, onValueChange, patchBlogField, path],
  );

  const handleInput = useCallback(() => {
    if (!ref.current) return;
    const nextValue = ref.current.textContent ?? '';
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      flushPatch(nextValue);
    }, 1000);
  }, [flushPatch]);

  const handleBlur = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (!ref.current) return;
    flushPatch(ref.current.textContent ?? '');
  }, [flushPatch]);

  if (!isEditing) {
    return React.createElement(Tag, { className }, value);
  }

  return React.createElement(Tag, {
    ref,
    className: `${className ?? ''} outline outline-1 outline-dashed outline-[#e6463a]/60`.trim(),
    contentEditable: true,
    suppressContentEditableWarning: true,
    onInput: handleInput,
    onBlur: handleBlur,
    children: value,
  });
}
