'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useCms } from './CmsProvider';

type EditableTextProps = {
  pageSlug: string;
  path: string;
  fallback: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
};

export default function EditableText({
  pageSlug,
  path,
  fallback,
  as: Tag = 'span',
  className,
}: EditableTextProps) {
  const { isEditing, getString, patch } = useCms();
  const ref = useRef<HTMLElement>(null);
  const text = getString(pageSlug, path, fallback);

  useEffect(() => {
    if (isEditing && ref.current && ref.current.textContent !== text) {
      ref.current.textContent = text;
    }
  }, [isEditing, text]);

  const handleInput = useCallback(() => {
    if (!ref.current) return;
    patch(pageSlug, path, ref.current.textContent ?? '');
  }, [pageSlug, path, patch]);

  const handleBlur = useCallback(() => {
    handleInput();
  }, [handleInput]);

  if (!isEditing) {
    return React.createElement(Tag, { className }, text);
  }

  return React.createElement(Tag, {
    ref,
    className: `${className ?? ''} outline outline-1 outline-dashed outline-[#e6463a]/60`.trim(),
    contentEditable: true,
    suppressContentEditableWarning: true,
    onInput: handleInput,
    onBlur: handleBlur,
    defaultValue: undefined,
    children: text,
  });
}
