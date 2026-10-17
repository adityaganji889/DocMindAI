import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  X,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  File,
  FileImage,
  FileCode,
  FilePieChart,
  Trash2,
} from 'lucide-react';
import { documentApi } from '../services/api';
import { useDocumentStore } from '../store/documentStore';
import type { UploadingFile } from '../types';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCEPTED_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    '.docx',
  ],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'text/csv': ['.csv'],
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') {
    return (
      <FileText className="w-4 h-4 text-red-500" />
    );
  }

  if (ext === 'csv') {
    return (
      <FilePieChart className="w-4 h-4 text-emerald-500" />
    );
  }

  if (ext === 'md') {
    return (
      <FileCode className="w-4 h-4 text-purple-500" />
    );
  }

  if (ext === 'docx') {
    return (
      <FileImage className="w-4 h-4 text-blue-500" />
    );
  }

  return (
    <File className="w-4 h-4 text-slate-500" />
  );
}

const UploadDialog: React.FC<UploadDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { fetchDocuments } = useDocumentStore();

  const onDrop = useCallback((accepted: File[]) => {
    console.log('[onDrop] Callback triggered');
    console.log('[onDrop] Accepted files:', accepted);
    const newFiles: UploadingFile[] = accepted.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      progress: 0,
      status: 'pending',
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    console.log('[onDrop] Added files:', newFiles.length);
  }, []);

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_TYPES,
      multiple: true,
    });

  const removeFile = (id: string) => {
    setFiles((prev) =>
      prev.filter((f) => f.id !== id)
    );
  };

  const handleUpload = async () => {
    console.log('[UploadDialog] handleUpload called');
    console.log('[UploadDialog] Files:', files);
    const pending = files.filter(
      (f) => f.status === 'pending'
    );

    console.log('[UploadDialog] Pending files:', pending.length);

    if (pending.length === 0) { 
      console.log('[UploadDialog] No pending files');  
      return;
    }

    setIsUploading(true);

    await Promise.all(
      pending.map(async (uf) => {
        console.log('[UploadDialog] Calling API for:', uf.file.name);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uf.id
              ? { ...f, status: 'uploading' }
              : f
          )
        );

        try {
          const res = await documentApi.upload(
            uf.file,
            (pct) => {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === uf.id
                    ? {
                      ...f,
                      progress: pct,
                    }
                    : f
                )
              );
            }
          );

          setFiles((prev) =>
            prev.map((f) =>
              f.id === uf.id
                ? {
                  ...f,
                  status: 'done',
                  progress: 100,
                  result: res.data,
                }
                : f
            )
          );
        } catch (err: unknown) {
          const msg =
            err instanceof Error
              ? err.message
              : 'Upload failed';

          setFiles((prev) =>
            prev.map((f) =>
              f.id === uf.id
                ? {
                  ...f,
                  status: 'error',
                  error: msg,
                }
                : f
            )
          );
        }
      })
    );

    setIsUploading(false);

    await fetchDocuments();

    // Calculate from the pending files instead of stale React state.
    const successCount = pending.length;

    if (successCount > 0) {
      toast.success(
        `${successCount} document(s) uploaded & indexed`
      );
    }
  };

  const handleClose = () => {
    console.trace('X: handleClose called');
    if (!isUploading) {
      setFiles([]);
      onClose();
    }
  };

  const allDone =
    files.length > 0 &&
    files.every(
      (f) =>
        f.status === 'done' ||
        f.status === 'error'
    );

  const pendingCount = files.filter(
    (f) => f.status === 'pending'
  ).length;

  const totalSize = files.reduce(
    (acc, f) => acc + f.file.size,
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-[var(--text-primary)]">

      {/* =====================================================
          BACKDROP
          ===================================================== */}
      <div
        className="
          absolute
          inset-0
          bg-black/40
          dark:bg-black/70
          backdrop-blur-sm
          transition-all
          duration-300
        "
        onClick={handleClose}
      />

      {/* =====================================================
          DIALOG
          ===================================================== */}
      <div
        className="
          relative
          z-10
          w-full
          max-w-lg

          bg-[var(--bg-secondary)]

          border
          border-[var(--border-primary)]

          rounded-2xl

          shadow-2xl
          shadow-black/20
          dark:shadow-black/50

          overflow-hidden

          animate-fade-in

          transition-all
          duration-300
        "
      >

        {/* =================================================
            HEADER
            ================================================= */}
        <div
          className="
            flex
            items-center
            justify-between
            px-6
            py-4

            border-b
            border-[var(--border-primary)]

            bg-[var(--bg-secondary)]

            transition-colors
            duration-300
          "
        >
          <div className="flex items-center gap-3">

            {/* Red icon */}
            <div
              className="
                w-9
                h-9
                rounded-xl

                bg-red-500/10
                border
                border-red-500/20

                flex
                items-center
                justify-center
              "
            >
              <Upload
                className="
                  w-4
                  h-4
                  text-red-500
                "
              />
            </div>

            <div>
              <h2
                className="
                  text-base
                  font-semibold
                  text-[var(--text-primary)]
                "
              >
                Upload Documents
              </h2>

              <p
                className="
                  text-xs
                  text-[var(--text-muted)]
                  mt-0.5
                "
              >
                PDF · DOCX · TXT · MD · CSV
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="
              p-1.5
              rounded-lg

              text-[var(--text-muted)]

              hover:text-[var(--text-primary)]
              hover:bg-[var(--bg-input)]

              transition-colors

              disabled:opacity-40
              cursor-pointer

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-red-500
            "
            aria-label="Close upload dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* =================================================
            BODY
            ================================================= */}
        <div className="p-5">

          {/* =================================================
              DROP ZONE
              ================================================= */}
          <div
            {...getRootProps()}
            className={clsx(
              `
                relative
                border-2
                border-dashed
                rounded-xl
                p-8
                text-center
                cursor-pointer

                transition-all
                duration-200

                overflow-hidden
                group
              `,
              isDragActive
                ? `
                  border-red-500
                  bg-red-500/10
                `
                : `
                  border-[var(--border-primary)]

                  hover:border-red-400
                  hover:bg-red-500/5
                `
            )}
          >
            <input {...getInputProps()} />

            {/* Animated red background */}
            <div
              className={clsx(
                `
                  absolute
                  inset-0

                  bg-gradient-to-br
                  from-red-500/5
                  via-transparent
                  to-red-700/5

                  transition-opacity
                  duration-300
                `,
                isDragActive
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100'
              )}
            />

            <div className="relative flex flex-col items-center gap-3">

              {/* Upload icon */}
              <div
                className={clsx(
                  `
                    w-14
                    h-14
                    rounded-2xl

                    flex
                    items-center
                    justify-center

                    transition-all
                    duration-300
                  `,
                  isDragActive
                    ? `
                      bg-red-500/15
                      scale-110
                    `
                    : `
                      bg-[var(--bg-input)]
                      group-hover:scale-105
                    `
                )}
              >
                <Upload
                  className={clsx(
                    'w-6 h-6 transition-colors',
                    isDragActive
                      ? 'text-red-500'
                      : 'text-[var(--text-muted)]'
                  )}
                />
              </div>

              <div>
                <p
                  className="
                    text-[var(--text-primary)]
                    font-medium
                  "
                >
                  {isDragActive
                    ? '✨ Drop to upload'
                    : 'Drag & drop files here'}
                </p>

                <p
                  className="
                    text-[var(--text-muted)]
                    text-sm
                    mt-1
                  "
                >
                  or{' '}
                  <span
                    className="
                      text-red-500
                      hover:text-red-400
                      hover:underline
                    "
                  >
                    click to browse
                  </span>
                </p>
              </div>

              {/* File type badges */}
              <div className="flex flex-wrap gap-1.5 justify-center mt-1">

                <span
                  className="
                    text-xs
                    px-2
                    py-0.5
                    rounded-full
                    font-medium

                    text-red-500
                    bg-red-500/10
                    border
                    border-red-500/10
                  "
                >
                  .pdf
                </span>

                <span
                  className="
                    text-xs
                    px-2
                    py-0.5
                    rounded-full
                    font-medium

                    text-blue-500
                    bg-blue-500/10
                    border
                    border-blue-500/10
                  "
                >
                  .docx
                </span>

                <span
                  className="
                    text-xs
                    px-2
                    py-0.5
                    rounded-full
                    font-medium

                    text-[var(--text-secondary)]
                    bg-[var(--bg-input)]
                    border
                    border-[var(--border-primary)]
                  "
                >
                  .txt
                </span>

                <span
                  className="
                    text-xs
                    px-2
                    py-0.5
                    rounded-full
                    font-medium

                    text-purple-500
                    bg-purple-500/10
                    border
                    border-purple-500/10
                  "
                >
                  .md
                </span>

                <span
                  className="
                    text-xs
                    px-2
                    py-0.5
                    rounded-full
                    font-medium

                    text-emerald-500
                    bg-emerald-500/10
                    border
                    border-emerald-500/10
                  "
                >
                  .csv
                </span>

              </div>
            </div>
          </div>

          {/* =================================================
              STATS BAR
              ================================================= */}
          {files.length > 0 && (
            <div
              className="
                flex
                items-center
                justify-between
                mt-3
                px-1
              "
            >
              <span
                className="
                  text-xs
                  text-[var(--text-muted)]
                "
              >
                {files.length} file(s) ·{' '}
                {formatBytes(totalSize)}
              </span>

              <button
                type="button"
                onClick={() => setFiles([])}
                disabled={isUploading}
                className="
                  text-xs
                  text-[var(--text-muted)]

                  hover:text-red-500

                  flex
                  items-center
                  gap-1

                  transition-colors

                  disabled:opacity-40
                  cursor-pointer
                "
              >
                <Trash2 className="w-3 h-3" />
                Clear all
              </button>
            </div>
          )}

          {/* =================================================
              FILE LIST
              ================================================= */}
          {files.length > 0 && (
            <div
              className="
                mt-2
                space-y-2
                max-h-56
                overflow-y-auto
                pr-1
              "
            >
              {files.map((uf) => (
                <div
                  key={uf.id}
                  className="
                    flex
                    items-center
                    gap-3
                    p-3

                    bg-[var(--bg-input)]

                    rounded-xl

                    border
                    border-[var(--border-primary)]

                    transition-colors
                    duration-300
                  "
                >

                  {/* File icon */}
                  <div
                    className="
                      p-2

                      bg-[var(--bg-secondary)]

                      rounded-lg
                      flex-shrink-0

                      border
                      border-[var(--border-primary)]
                    "
                  >
                    {getFileIcon(uf.file.name)}
                  </div>

                  <div className="flex-1 min-w-0">

                    <div className="flex items-center justify-between mb-1.5">

                      <p
                        className="
                          text-xs
                          text-[var(--text-primary)]
                          font-medium
                          truncate
                          max-w-[200px]
                        "
                      >
                        {uf.file.name}
                      </p>

                      <div
                        className="
                          flex
                          items-center
                          gap-1.5
                          flex-shrink-0
                          ml-2
                        "
                      >
                        <span
                          className="
                            text-xs
                            text-[var(--text-muted)]
                          "
                        >
                          {formatBytes(uf.file.size)}
                        </span>

                        {uf.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() =>
                              removeFile(uf.id)
                            }
                            className="
                              text-[var(--text-muted)]
                              hover:text-red-500
                              transition-colors
                              cursor-pointer
                            "
                            aria-label={`Remove ${uf.file.name}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}

                        {uf.status === 'uploading' && (
                          <Loader2
                            className="
                              w-3.5
                              h-3.5
                              text-red-500
                              animate-spin
                            "
                          />
                        )}

                        {uf.status === 'done' && (
                          <CheckCircle
                            className="
                              w-3.5
                              h-3.5
                              text-emerald-500
                            "
                          />
                        )}

                        {uf.status === 'error' && (
                          <AlertCircle
                            className="
                              w-3.5
                              h-3.5
                              text-red-500
                            "
                          />
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    <div
                      className="
                        w-full
                        bg-[var(--border-primary)]
                        rounded-full
                        h-1
                      "
                    >
                      <div
                        className={clsx(
                          'h-1 rounded-full transition-all duration-300',
                          uf.status === 'done' &&
                          'bg-emerald-500',
                          uf.status === 'error' &&
                          'bg-red-500',
                          uf.status === 'uploading' &&
                          'bg-red-500',
                          uf.status === 'pending' &&
                          'bg-transparent'
                        )}
                        style={{
                          width:
                            uf.status === 'pending'
                              ? '0%'
                              : `${uf.progress}%`,
                        }}
                      />
                    </div>

                    {/* Error */}
                    {uf.status === 'error' && (
                      <p
                        className="
                          text-xs
                          text-red-500
                          mt-1
                        "
                      >
                        {uf.error}
                      </p>
                    )}

                    {/* Success */}
                    {uf.status === 'done' &&
                      uf.result && (
                        <p
                          className="
                            text-xs
                            text-emerald-500
                            mt-1
                          "
                        >
                          ✓{' '}
                          {uf.result.chunksCreated ?? 0}{' '}
                          chunks indexed
                        </p>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =================================================
            FOOTER
            ================================================= */}
        <div
          className="
            flex
            items-center
            justify-end
            gap-3

            px-5
            py-4

            border-t
            border-[var(--border-primary)]

            bg-[var(--bg-secondary)]

            transition-colors
            duration-300
          "
        >

          {/* Cancel / Close */}
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="
              px-4
              py-2

              text-sm
              text-[var(--text-secondary)]

              hover:text-[var(--text-primary)]

              border
              border-[var(--border-primary)]

              hover:border-red-400
              hover:bg-red-500/5

              rounded-xl

              transition-all

              disabled:opacity-50
              cursor-pointer

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-red-500
            "
          >
            {allDone ? 'Close' : 'Cancel'}
          </button>

          {/* Upload */}
          {!allDone && (
            <button
              type="button"
              onClick={handleUpload}
              // onClick={(e) => {
              //   e.preventDefault();
              //   e.stopPropagation();
              //   console.log('[UploadDialog] Upload button clicked');
              //   void handleUpload();
              // }}
              disabled={
                isUploading || pendingCount === 0
              }
              className="
                flex
                items-center
                gap-2

                px-5
                py-2

                text-sm
                font-medium

                bg-[var(--primary)]
                hover:bg-[var(--primary-hover)]

                active:scale-[0.98]

                text-white

                rounded-xl

                transition-all

                disabled:opacity-40
                disabled:cursor-not-allowed

                shadow-lg
                shadow-red-500/20
                hover:shadow-red-500/30

                cursor-pointer

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-red-500
              "
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Upload {pendingCount} file
                  {pendingCount !== 1 ? 's' : ''}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadDialog;
