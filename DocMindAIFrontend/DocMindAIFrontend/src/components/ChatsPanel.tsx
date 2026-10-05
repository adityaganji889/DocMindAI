import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Clock,
  MessageSquarePlus,
  Search,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConversationStore } from '../store/conversationStore';
import { useDocumentStore } from '../store/documentStore';
import type { Conversation } from '../types';
import { clsx } from 'clsx';

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();

    const diffSec = Math.floor(
      (now.getTime() - date.getTime()) / 1000
    );

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 172800) return 'Yesterday';
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function getGroupLabel(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const startOfYesterday = new Date(
      startOfToday.getTime() - 86400000
    );

    const startOfLast7Days = new Date(
      startOfToday.getTime() - 7 * 86400000
    );

    if (date >= startOfToday) return 'Today';
    if (date >= startOfYesterday) return 'Yesterday';
    if (date >= startOfLast7Days) return 'Previous 7 Days';

    return 'Older';
  } catch {
    return 'Older';
  }
}

/* ─────────────────────────────────────────
   Skeleton
───────────────────────────────────────── */

const SkeletonChat: React.FC = () => (
  <div
    className="
      p-3
      rounded-xl
      border
      border-[var(--border-primary)]
      bg-[var(--bg-secondary)]
      flex
      items-center
      gap-3
      animate-pulse
    "
  >
    <div
      className="
        w-7 h-7
        rounded-lg
        bg-[var(--bg-input)]
        flex-shrink-0
      "
    />

    <div className="flex-1 space-y-2">
      <div
        className="
          h-3
          bg-[var(--bg-input)]
          rounded
          w-4/5
        "
      />

      <div
        className="
          h-2
          bg-[var(--border-primary)]
          rounded
          w-1/3
        "
      />
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Chat Item
───────────────────────────────────────── */

const ChatItem: React.FC<{
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
}> = ({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onRename,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (confirmDelete) {
      onDelete();
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);

      setTimeout(() => {
        setConfirmDelete(false);
      }, 2500);
    }
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();

    setEditTitle(conversation.title);
    setIsEditing(true);
  };

  const handleSaveEdit = (
    e?: React.MouseEvent | React.FormEvent
  ) => {
    if (e) e.stopPropagation();

    if (
      editTitle.trim() &&
      editTitle.trim() !== conversation.title
    ) {
      onRename(editTitle.trim());
    }

    setIsEditing(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();

    setEditTitle(conversation.title);
    setIsEditing(false);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditTitle(conversation.title);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      onClick={isEditing ? undefined : onSelect}
      className={clsx(
        `
          group
          relative
          flex
          items-center
          justify-between
          gap-2.5
          p-3
          rounded-xl
          border
          transition-all
          duration-200
          cursor-pointer
          select-none
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-red-500
        `,
        isActive
          ? `
              border-red-500/60
              bg-red-500/10
              shadow-sm
              shadow-red-500/10
              text-[var(--text-primary)]
            `
          : `
              border-[var(--border-primary)]
              bg-[var(--bg-secondary)]
              hover:border-red-400/40
              hover:bg-red-500/5
              text-[var(--text-secondary)]
              hover:text-[var(--text-primary)]
            `
      )}
    >
      <div className="flex items-start gap-2.5 min-w-0 flex-1">

        {/* Chat icon */}
        <div
          className={clsx(
            `
              p-1.5
              rounded-lg
              flex-shrink-0
              mt-0.5
              transition-colors
            `,
            isActive
              ? `
                  bg-red-500/15
                  text-red-500
                `
              : `
                  bg-[var(--bg-input)]
                  text-[var(--text-muted)]
                  group-hover:text-red-500
                `
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0">

          {isEditing ? (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                ref={inputRef}
                type="text"
                value={editTitle}
                onChange={(e) =>
                  setEditTitle(e.target.value)
                }
                onKeyDown={handleKeyDown}
                className="
                  w-full
                  bg-[var(--bg-input)]
                  border
                  border-red-500
                  text-[var(--text-primary)]
                  text-xs
                  rounded
                  px-2
                  py-1
                  focus:outline-none
                  focus:ring-1
                  focus:ring-red-400
                "
                aria-label="Edit chat title"
              />

              <button
                type="button"
                onClick={handleSaveEdit}
                aria-label="Save chat title"
                className="
                  p-1
                  hover:bg-red-500/10
                  text-red-500
                  rounded
                  transition
                  cursor-pointer
                  focus-visible:ring-2
                  focus-visible:ring-red-500
                "
              >
                <Check className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                aria-label="Cancel editing"
                className="
                  p-1
                  hover:bg-[var(--bg-input)]
                  text-[var(--text-muted)]
                  rounded
                  transition
                  cursor-pointer
                  focus-visible:ring-2
                  focus-visible:ring-slate-500
                "
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <p
                className="
                  text-xs
                  font-medium
                  truncate
                  leading-tight
                  text-[var(--text-primary)]
                "
              >
                {conversation.title}
              </p>

              <div className="flex items-center gap-1.5 mt-1">
                <Clock
                  className="
                    w-2.5
                    h-2.5
                    text-[var(--text-muted)]
                    flex-shrink-0
                  "
                />

                <span
                  className="
                    text-[10px]
                    text-[var(--text-muted)]
                  "
                >
                  {formatRelativeTime(
                    conversation.updatedAt
                  )}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {!isEditing && (
        <div className="flex items-center gap-1 flex-shrink-0">

          {/* Rename */}
          <button
            type="button"
            onClick={handleStartEdit}
            aria-label="Rename conversation"
            className="
              p-1
              rounded-lg
              transition-all
              text-xs
              opacity-0
              group-hover:opacity-100
              hover:bg-red-500/10
              text-[var(--text-muted)]
              hover:text-red-500
              focus-visible:opacity-100
              focus-visible:ring-2
              focus-visible:ring-red-500
              cursor-pointer
            "
            title="Rename chat"
          >
            <Edit2 className="w-3 h-3" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            aria-label={
              confirmDelete
                ? 'Confirm delete conversation'
                : 'Delete conversation'
            }
            className={clsx(
              `
                p-1
                rounded-lg
                transition-all
                text-xs
                cursor-pointer
                focus-visible:opacity-100
                focus-visible:ring-2
                focus-visible:ring-red-500
              `,
              confirmDelete
                ? `
                    bg-red-500/20
                    text-red-500
                    px-2
                    font-medium
                    opacity-100
                  `
                : `
                    opacity-0
                    group-hover:opacity-100
                    hover:bg-red-500/10
                    hover:text-red-500
                    text-[var(--text-muted)]
                  `
            )}
            title="Delete chat"
          >
            {confirmDelete ? (
              'Sure?'
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   Chats Panel
───────────────────────────────────────── */

export const ChatsPanel: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    isLoadingChats,
    newChat,
    selectChat,
    deleteChat,
    renameChat,
  } = useConversationStore();

  const { setActiveTab } = useDocumentStore();

  const [searchQuery, setSearchQuery] = useState('');

  const handleNewChat = () => {
    newChat();
    setActiveTab('chat');
  };

  const handleSelectChat = (id: string) => {
    selectChat(id);
    setActiveTab('chat');
  };

  /* ─────────────────────────────────────────
     Filter conversations
  ───────────────────────────────────────── */

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }

    const q = searchQuery.toLowerCase();

    return conversations.filter((c) =>
      c.title.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  /* ─────────────────────────────────────────
     Group conversations
  ───────────────────────────────────────── */

  const groupedConversations = useMemo(() => {
    const groups: Record<string, Conversation[]> = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: [],
    };

    filteredConversations.forEach((chat) => {
      const label = getGroupLabel(chat.updatedAt);

      if (!groups[label]) {
        groups[label] = [];
      }

      groups[label].push(chat);
    });

    return groups;
  }, [filteredConversations]);

  const groupKeys = [
    'Today',
    'Yesterday',
    'Previous 7 Days',
    'Older',
  ] as const;

  return (
    <div
      className="
        flex
        flex-col
        h-full
        overflow-hidden
        bg-[var(--bg-secondary)]
        text-[var(--text-primary)]
        transition-colors
        duration-300
      "
    >

      {/* ─────────────────────────────────────
          New Chat / Search
      ───────────────────────────────────── */}

      <div
        className="
          p-3
          border-b
          border-[var(--border-primary)]
          flex-shrink-0
          space-y-2
        "
      >

        {/* New Chat */}
        <button
          type="button"
          onClick={handleNewChat}
          aria-label="Start a new chat"
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
            hover:shadow-red-500/30
            cursor-pointer
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-red-500
          "
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        {/* Search */}
        {conversations.length > 3 && (
          <div className="relative">

            <Search
              className="
                w-3.5
                h-3.5
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-[var(--text-muted)]
              "
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search conversations..."
              className="
                w-full
                bg-[var(--bg-input)]
                border
                border-[var(--border-primary)]
                focus:border-red-500
                text-[var(--text-primary)]
                placeholder:text-[var(--text-muted)]
                text-xs
                rounded-lg
                pl-8
                pr-7
                py-1.5
                focus:outline-none
                focus:ring-1
                focus:ring-red-500
                transition-colors
              "
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="
                  absolute
                  right-2.5
                  top-1/2
                  -translate-y-1/2
                  text-[var(--text-muted)]
                  hover:text-[var(--text-primary)]
                  transition-colors
                  cursor-pointer
                "
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────
          Chat List
      ───────────────────────────────────── */}

      <div
        className="
          flex-1
          overflow-y-auto
          p-3
          space-y-3
        "
      >

        {/* Loading */}
        {isLoadingChats ? (
          <div className="space-y-2">
            <SkeletonChat />
            <SkeletonChat />
            <SkeletonChat />
          </div>

        ) : conversations.length === 0 ? (

          /* Empty state */
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
              h-56
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
              <MessageSquarePlus
                className="
                  w-6
                  h-6
                  text-red-500
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
              No chat history yet
            </p>

            <p
              className="
                text-[11px]
                text-[var(--text-muted)]
                mt-1
                max-w-[200px]
                leading-relaxed
              "
            >
              Start a new conversation to ask
              questions about your documents
            </p>

            <button
              type="button"
              onClick={handleNewChat}
              className="
                mt-3
                inline-flex
                items-center
                gap-1
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
              Start first chat →
            </button>
          </motion.div>

        ) : filteredConversations.length === 0 ? (

          /* No search results */
          <div
            className="
              text-center
              py-8
              text-[var(--text-muted)]
              text-xs
            "
          >
            No conversations match "{searchQuery}"
          </div>

        ) : (

          /* Conversations */
          <AnimatePresence mode="popLayout">
            {groupKeys.map((key) => {
              const items = groupedConversations[key];

              if (!items || items.length === 0) {
                return null;
              }

              return (
                <div
                  key={key}
                  className="space-y-1.5"
                >

                  {/* Group label */}
                  <div
                    className="
                      px-1
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-[var(--text-muted)]
                    "
                  >
                    {key}
                  </div>

                  <div className="space-y-1.5">
                    {items.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        conversation={chat}
                        isActive={
                          activeConversationId === chat.id
                        }
                        onSelect={() =>
                          handleSelectChat(chat.id)
                        }
                        onDelete={() =>
                          deleteChat(chat.id)
                        }
                        onRename={(newTitle) =>
                          renameChat(
                            chat.id,
                            newTitle
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ChatsPanel;
