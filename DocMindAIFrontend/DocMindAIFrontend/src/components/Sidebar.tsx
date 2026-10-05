import React, { useState } from 'react';
import {
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Upload,
  RefreshCw,
  X,
  FileType,
  FilePieChart,
  File,
  FolderOpen,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocumentStore } from '../store/documentStore';
import { useConversationStore } from '../store/conversationStore';
import type {
  DocumentMetadataDto,
  DocumentStatus,
} from '../types';
import ChatsPanel from './ChatsPanel';
import { clsx } from 'clsx';

interface SidebarProps {
  onUploadClick: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getFileEmoji(contentType: string): React.ReactNode {
  if (contentType.includes('pdf')) {
    return <FileText className="w-4 h-4 text-red-500" />;
  }

  if (
    contentType.includes('word') ||
    contentType.includes('docx')
  ) {
    return <FileType className="w-4 h-4 text-red-400" />;
  }

  if (contentType.includes('csv')) {
    return <FilePieChart className="w-4 h-4 text-emerald-500" />;
  }

  return <File className="w-4 h-4 text-[var(--text-muted)]" />;
}

const STATUS_CONFIG: Record<
  DocumentStatus,
  {
    icon: React.ReactNode;
    color: string;
    dot: string;
    label: string;
  }
> = {
  INDEXED: {
    icon: <CheckCircle className="w-3 h-3" />,
    color:
      'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    dot: 'bg-emerald-500',
    label: 'Indexed',
  },

  PROCESSING: {
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
    color:
      'text-amber-500 bg-amber-500/10 border-amber-500/20',
    dot: 'bg-amber-500 animate-pulse',
    label: 'Processing',
  },

  UPLOADING: {
    icon: <Clock className="w-3 h-3" />,
    color:
      'text-blue-500 bg-blue-500/10 border-blue-500/20',
    dot: 'bg-blue-500 animate-pulse',
    label: 'Uploading',
  },

  FAILED: {
    icon: <AlertCircle className="w-3 h-3" />,
    color:
      'text-red-500 bg-red-500/10 border-red-500/20',
    dot: 'bg-red-500',
    label: 'Failed',
  },
};

const StatusBadge: React.FC<{
  status: DocumentStatus;
}> = ({ status }) => {
  const cfg =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG.INDEXED;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border',
        cfg.color
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

const SkeletonDoc: React.FC = () => (
  <div
    className="
      p-3
      rounded-xl
      border
      border-[var(--border-primary)]
      bg-[var(--bg-input)]
      flex
      items-center
      gap-3
      animate-pulse
    "
  >
    <div
      className="
        w-7
        h-7
        rounded-lg
        bg-[var(--border-primary)]
        flex-shrink-0
      "
    />

    <div className="flex-1 space-y-2">
      <div
        className="
          h-3
          bg-[var(--border-primary)]
          rounded
          w-3/4
        "
      />

      <div
        className="
          h-2
          bg-[var(--border-primary)]
          rounded
          w-1/2
          opacity-60
        "
      />
    </div>
  </div>
);

const DocumentItem: React.FC<{
  doc: DocumentMetadataDto;
}> = ({ doc }) => {
  const {
    selectedDocumentId,
    setSelectedDocumentId,
    deleteDocument,
  } = useDocumentStore();

  const [expanded, setExpanded] =
    useState(false);

  const [confirmDelete, setConfirmDelete] =
    useState(false);

  const isSelected =
    selectedDocumentId === doc.id;

  const handleDelete = () => {
    if (confirmDelete) {
      deleteDocument(doc.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);

      setTimeout(() => {
        setConfirmDelete(false);
      }, 2500);
    }
  };

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 6,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
      }}
      transition={{
        duration: 0.18,
      }}
      className={clsx(
        `
          rounded-xl
          border
          transition-all
          duration-200
          overflow-hidden
        `,
        isSelected
          ? `
            border-red-500/60
            bg-red-500/10
            shadow-sm
            shadow-red-500/10
          `
          : `
            border-[var(--border-primary)]
            bg-[var(--bg-input)]
            hover:border-red-500/30
            hover:bg-red-500/5
          `
      )}
    >
      {/* Main row */}

      <div
        className="
          flex
          items-start
          gap-2.5
          p-3
          cursor-pointer
          select-none
        "
        onClick={() =>
          setSelectedDocumentId(
            isSelected ? null : doc.id
          )
        }
      >
        {/* File icon */}

        <div
          className={clsx(
            `
              p-1.5
              rounded-lg
              flex-shrink-0
              mt-0.5
              transition-colors
            `,
            isSelected
              ? 'bg-red-500/15'
              : 'bg-[var(--bg-secondary)]'
          )}
        >
          {getFileEmoji(doc.contentType)}
        </div>

        {/* Document information */}

        <div className="flex-1 min-w-0">
          <p
            className="
              text-xs
              font-semibold
              text-[var(--text-primary)]
              truncate
              leading-tight
            "
            title={doc.filename}
          >
            {doc.filename}
          </p>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <StatusBadge status={doc.status} />

            <span
              className="
                text-[10px]
                text-[var(--text-muted)]
              "
            >
              {formatBytes(doc.fileSize)}
            </span>
          </div>
        </div>

        {/* Actions */}

        <div
          className="
            flex
            items-center
            gap-0.5
            flex-shrink-0
            mt-0.5
          "
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            aria-label={
              expanded
                ? 'Collapse document details'
                : 'Expand document details'
            }
            className="
              p-1
              hover:bg-red-500/10
              text-[var(--text-muted)]
              hover:text-red-500
              rounded-lg
              transition-colors
              cursor-pointer
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-red-500
            "
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            aria-label={
              confirmDelete
                ? 'Confirm delete document'
                : 'Delete document'
            }
            className={clsx(
              `
                p-1
                rounded-lg
                transition-all
                text-xs
                cursor-pointer
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-red-500
              `,
              confirmDelete
                ? `
                  bg-red-500/15
                  text-red-500
                  px-2
                  font-medium
                `
                : `
                  text-[var(--text-muted)]
                  hover:bg-red-500/10
                  hover:text-red-500
                `
            )}
          >
            {confirmDelete ? (
              'Sure?'
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded information */}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: 'auto',
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.15,
            }}
            className="
              px-3
              pb-3
              border-t
              border-[var(--border-primary)]
              overflow-hidden
            "
          >
            <div className="grid grid-cols-3 gap-1.5 mt-2.5">
              {doc.totalChunks != null && (
                <div
                  className="
                    bg-[var(--bg-secondary)]
                    rounded-lg
                    p-2
                    text-center
                    border
                    border-[var(--border-primary)]
                  "
                >
                  <p className="text-base font-bold text-red-500">
                    {doc.totalChunks}
                  </p>

                  <p className="text-[10px] text-[var(--text-muted)]">
                    chunks
                  </p>
                </div>
              )}

              {doc.totalPages != null && (
                <div
                  className="
                    bg-[var(--bg-secondary)]
                    rounded-lg
                    p-2
                    text-center
                    border
                    border-[var(--border-primary)]
                  "
                >
                  <p className="text-base font-bold text-[var(--text-primary)]">
                    {doc.totalPages}
                  </p>

                  <p className="text-[10px] text-[var(--text-muted)]">
                    pages
                  </p>
                </div>
              )}

              <div
                className="
                  bg-[var(--bg-secondary)]
                  rounded-lg
                  p-2
                  text-center
                  border
                  border-[var(--border-primary)]
                "
              >
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  {formatDate(doc.createdAt)}
                </p>

                <p className="text-[10px] text-[var(--text-muted)]">
                  added
                </p>
              </div>
            </div>

            {doc.errorMessage && (
              <div
                className="
                  mt-2
                  px-2.5
                  py-1.5
                  bg-red-500/10
                  border
                  border-red-500/20
                  rounded-lg
                "
              >
                <p className="text-xs text-red-500">
                  {doc.errorMessage}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const Sidebar: React.FC<
  SidebarProps
> = ({ onUploadClick }) => {
  const {
    documents,
    isLoadingDocuments,
    fetchDocuments,
    selectedDocumentId,
    setSelectedDocumentId,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useDocumentStore();

  const {
    conversations,
    loadChats,
  } = useConversationStore();

  const [sidebarTab, setSidebarTab] =
    useState<'documents' | 'chats'>(
      'documents'
    );

  const handleRefresh = () => {
    if (sidebarTab === 'documents') {
      fetchDocuments();
    } else {
      loadChats();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() =>
              setIsSidebarOpen(false)
            }
            className="
              fixed
              inset-0
              bg-black/40
              dark:bg-black/70
              backdrop-blur-xs
              z-30
              md:hidden
            "
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={clsx(
          `
            flex
            flex-col
            h-full
            bg-[var(--bg-secondary)]
            border-r
            border-[var(--border-primary)]
            transition-all
            duration-250
            ease-in-out
            flex-shrink-0
            z-30
            md:static
            fixed
            inset-y-0
            left-0
            top-14
            md:top-0
            text-[var(--text-primary)]
          `,
          isSidebarOpen
            ? 'w-72 shadow-2xl md:shadow-none'
            : `
              w-0
              -translate-x-full
              md:translate-x-0
              overflow-hidden
              border-r-0
            `
        )}
      >
        {/* Sidebar Mode Tabs */}

        <div
          className="
            flex
            items-center
            justify-between
            px-3
            py-2.5
            border-b
            border-[var(--border-primary)]
            flex-shrink-0
            bg-[var(--bg-secondary)]
          "
        >
          <div
            className="
              flex
              items-center
              gap-1
              bg-[var(--bg-input)]
              p-0.5
              rounded-xl
              border
              border-[var(--border-primary)]
            "
          >
            {/* Documents tab */}

            <button
              type="button"
              onClick={() =>
                setSidebarTab('documents')
              }
              aria-label="View uploaded documents"
              className={clsx(
                `
                  flex
                  items-center
                  gap-1.5
                  px-2.5
                  py-1
                  rounded-lg
                  text-xs
                  font-medium
                  transition-all
                  cursor-pointer
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-red-500
                `,
                sidebarTab === 'documents'
                  ? `
                    bg-[var(--primary)]
                    hover:bg-[var(--primary-hover)]
                    text-white
                    shadow-sm
                    shadow-red-500/30
                  `
                  : `
                    text-[var(--text-muted)]
                    hover:text-[var(--text-primary)]
                    hover:bg-red-500/5
                  `
              )}
            >
              <FolderOpen className="w-3.5 h-3.5" />

              <span>Docs</span>

              <span
                className={clsx(
                  `
                    text-[10px]
                    px-1.5
                    py-0.2
                    rounded-full
                    font-mono
                  `,
                  sidebarTab === 'documents'
                    ? 'bg-red-700 text-white'
                    : `
                      bg-[var(--bg-secondary)]
                      text-[var(--text-muted)]
                    `
                )}
              >
                {documents.length}
              </span>
            </button>

            {/* Chats tab */}

            <button
              type="button"
              onClick={() =>
                setSidebarTab('chats')
              }
              aria-label="View chat history"
              className={clsx(
                `
                  flex
                  items-center
                  gap-1.5
                  px-2.5
                  py-1
                  rounded-lg
                  text-xs
                  font-medium
                  transition-all
                  cursor-pointer
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-red-500
                `,
                sidebarTab === 'chats'
                  ? `
                    bg-[var(--primary)]
                    hover:bg-[var(--primary-hover)]
                    text-white
                    shadow-sm
                    shadow-red-500/30
                  `
                  : `
                    text-[var(--text-muted)]
                    hover:text-[var(--text-primary)]
                    hover:bg-red-500/5
                  `
              )}
            >
              <MessageSquare className="w-3.5 h-3.5" />

              <span>Chats</span>

              <span
                className={clsx(
                  `
                    text-[10px]
                    px-1.5
                    py-0.2
                    rounded-full
                    font-mono
                  `,
                  sidebarTab === 'chats'
                    ? 'bg-red-700 text-white'
                    : `
                      bg-[var(--bg-secondary)]
                      text-[var(--text-muted)]
                    `
                )}
              >
                {conversations.length}
              </span>
            </button>
          </div>

          {/* Sidebar actions */}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleRefresh}
              aria-label="Refresh content"
              className="
                p-1.5
                hover:bg-red-500/10
                rounded-lg
                transition-colors
                cursor-pointer
                text-[var(--text-muted)]
                hover:text-red-500
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-red-500
              "
              title="Refresh"
            >
              <RefreshCw
                className={clsx(
                  'w-3.5 h-3.5',
                  isLoadingDocuments &&
                    'animate-spin text-red-500'
                )}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                setIsSidebarOpen(false)
              }
              aria-label="Close sidebar"
              className="
                p-1.5
                hover:bg-red-500/10
                rounded-lg
                transition-colors
                cursor-pointer
                text-[var(--text-muted)]
                hover:text-red-500
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-red-500
              "
              title="Close sidebar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}

        {sidebarTab === 'chats' ? (
          <ChatsPanel />
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Upload CTA */}

            <div
              className="
                p-3
                border-b
                border-[var(--border-primary)]
                flex-shrink-0
              "
            >
              <button
                type="button"
                onClick={onUploadClick}
                aria-label="Upload documents"
                className="
                  w-full
                  flex
                  items-center
                  justify-center
                  gap-2
                  px-4
                  py-2.5
                  bg-[var(--primary)]
                  hover:bg-[var(--primary-hover)]
                  active:scale-[0.98]
                  text-white
                  text-xs
                  sm:text-sm
                  font-medium
                  rounded-xl
                  transition-all
                  shadow-lg
                  shadow-red-500/20
                  hover:shadow-red-500/35
                  cursor-pointer
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-red-500
                "
              >
                <Upload className="w-4 h-4" />
                <span>Upload Documents</span>
              </button>
            </div>

            {/* Active document filter */}

            {selectedDocumentId && (
              <div
                className="
                  px-3
                  py-2
                  flex-shrink-0
                  border-b
                  border-[var(--border-primary)]
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDocumentId(null)
                  }
                  aria-label="Clear document filter"
                  className="
                    flex
                    items-center
                    gap-1.5
                    text-xs
                    text-red-500
                    hover:text-red-600
                    dark:text-red-400
                    dark:hover:text-red-300
                    bg-red-500/10
                    hover:bg-red-500/15
                    border
                    border-red-500/30
                    px-3
                    py-1.5
                    rounded-lg
                    transition-all
                    w-full
                    justify-center
                    cursor-pointer
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-red-500
                  "
                >
                  <X className="w-3.5 h-3.5" />

                  <span>
                    Clear document filter
                  </span>
                </button>
              </div>
            )}

            {/* Document list */}

            <div
              className="
                flex-1
                overflow-y-auto
                p-3
                space-y-2
              "
            >
              {isLoadingDocuments ? (
                <div className="space-y-2">
                  <SkeletonDoc />
                  <SkeletonDoc />
                  <SkeletonDoc />
                </div>
              ) : documents.length === 0 ? (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    h-52
                    text-center
                    px-4
                  "
                >
                  <div
                    className="
                      w-12
                      h-12
                      bg-[var(--bg-input)]
                      border
                      border-[var(--border-primary)]
                      rounded-2xl
                      flex
                      items-center
                      justify-center
                      mb-3
                      shadow-inner
                    "
                  >
                    <FileText
                      className="
                        w-6
                        h-6
                        text-[var(--text-muted)]
                      "
                    />
                  </div>

                  <p
                    className="
                      text-xs
                      text-[var(--text-primary)]
                      font-semibold
                    "
                  >
                    No documents yet
                  </p>

                  <p
                    className="
                      text-[11px]
                      text-[var(--text-muted)]
                      mt-1
                      leading-relaxed
                    "
                  >
                    Upload PDF, DOCX, TXT, MD or CSV
                    files to get started
                  </p>

                  <button
                    type="button"
                    onClick={onUploadClick}
                    className="
                      mt-3
                      text-xs
                      text-red-500
                      hover:text-red-400
                      font-medium
                      underline
                      underline-offset-4
                      transition-colors
                      cursor-pointer
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-red-500
                      rounded
                    "
                  >
                    Upload first document &rarr;
                  </button>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {documents.map((doc) => (
                    <DocumentItem
                      key={doc.id}
                      doc={doc}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
