'use client';

import React, { useEffect, useRef } from 'react';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import { useCms } from './CmsProvider';

type Props = {
  blogId: string;
  path: string;
  html: string;
  onValueChange: (value: string) => void;
  className?: string;
};

export default function BlogRichTextEditor({
  blogId,
  path,
  html,
  onValueChange,
  className,
}: Props) {
  const { patchBlogField } = useCms();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { quill, quillRef } = useQuill({
    theme: 'snow',
    modules: {
      toolbar: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'link'],
        [{ list: 'ordered' }, { list: 'bullet' }],
      ],
    },
  });

  useEffect(() => {
    if (!quill) return;
    if (quill.root.innerHTML !== html) {
      quill.clipboard.dangerouslyPasteHTML(html);
    }
    const handler = () => {
      const nextHtml = quill.root.innerHTML;
      onValueChange(nextHtml);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        patchBlogField(blogId, path, nextHtml);
      }, 1000);
    };
    quill.on('text-change', handler);
    return () => {
      quill.off('text-change', handler);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [blogId, html, onValueChange, patchBlogField, path, quill]);

  return (
    <div className={className}>
      <div ref={quillRef} className="bg-white text-[#242632]" />
    </div>
  );
}
