'use client';

import React from 'react';
import { useCms } from './CmsProvider';

const STATUS_LABELS: Record<string, string> = {
  idle: '',
  saving: 'Saving…',
  saved: 'Saved',
  unsaved: 'Unsaved changes',
  conflict: 'Conflict — refresh and retry',
  error: 'Error — try again',
};

export default function EditToolbar() {
  const {
    isAdmin,
    isEditing,
    status,
    enterEditMode,
    previewMode,
    flushPendingPatch,
    publishDirty,
    exitEditMode,
  } = useCms();

  if (!isAdmin) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9998] border-t border-white/10 bg-[#17192b] text-white shadow-lg"
      role="toolbar"
      aria-label="CMS edit toolbar"
    >
      <div className="container flex flex-wrap items-center gap-2 py-2">
        {!isEditing ? (
          <button
            type="button"
            className="rounded bg-[#e6463a] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d1372b]"
            onClick={() => void enterEditMode()}
          >
            Edit
          </button>
        ) : (
          <>
            <button
              type="button"
              className="rounded border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10"
              onClick={previewMode}
            >
              Preview
            </button>
            <button
              type="button"
              className="rounded border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10"
              onClick={() => void flushPendingPatch()}
            >
              Save
            </button>
            <button
              type="button"
              className="rounded bg-[#e6463a] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d1372b]"
              onClick={() => void publishDirty()}
            >
              Publish
            </button>
            <button
              type="button"
              className="rounded border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10"
              onClick={exitEditMode}
            >
              Exit
            </button>
          </>
        )}
        {STATUS_LABELS[status] ? (
          <span className="ml-auto text-xs text-white/70" aria-live="polite">
            {STATUS_LABELS[status]}
          </span>
        ) : null}
      </div>
    </div>
  );
}
