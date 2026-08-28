'use client';

import React, { useEffect } from 'react';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import { useCms } from './CmsProvider';

type Props = {
  pageSlug: string;
  path: string;
  html: string;
  className?: string;
};

export default function RichTextEditor({ pageSlug, path, html, className }: Props) {
  const { patch } = useCms();
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
      patch(pageSlug, path, quill.root.innerHTML);
    };
    quill.on('text-change', handler);
    return () => {
      quill.off('text-change', handler);
    };
  }, [quill, html, pageSlug, path, patch]);

  return (
    <div className={className}>
      <div ref={quillRef} className="bg-white text-[#242632]" />
    </div>
  );
}
