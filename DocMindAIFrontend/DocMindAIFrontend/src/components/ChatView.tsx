import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';

import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markdown';

import {
  Send,
  Bot,
  User,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  Zap,
  Sparkles,
  RotateCcw,
  Square,
  Copy,
  Check,
  Wifi,
  WifiOff,
} from 'lucide-react';

import { chatApi } from '../services/api';
import { useDocumentStore } from '../store/documentStore';
import { useConversationStore } from '../store/conversationStore';
import type {
  ConversationMessage,
  CitationDto,
} from '../types';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────────── */
/* Prompt templates                                                */
/* ─────────────────────────────────────────────────────────────── */

const PROMPT_TEMPLATES = [
  {
    category: 'Summarization',
    icon: '📋',
    gradient:
      'from-red-500/15 to-rose-500/15',
    border: 'border-red-500/25',
    accent: 'text-red-600 dark:text-red-400',
    templates: [
      {
        label: 'Executive Summary',
        prompt:
          'Provide a concise executive summary of the key points in this document.',
      },
      {
        label: 'Key Findings',
        prompt:
          'What are the key findings and conclusions from this document?',
      },
      {
        label: 'Action Items',
        prompt:
          'List all action items, tasks, and next steps mentioned in this document.',
      },
    ],
  },
  {
    category: 'Legal & Compliance',
    icon: '⚖️',
    gradient:
      'from-red-500/15 to-orange-500/15',
    border: 'border-red-500/25',
    accent: 'text-red-600 dark:text-red-400',
    templates: [
      {
        label: 'Key Clauses',
        prompt:
          'What are the most important clauses and provisions in this document?',
      },
      {
        label: 'Obligations',
        prompt:
          'What obligations and responsibilities are defined in this document?',
      },
      {
        label: 'Risk Analysis',
        prompt:
          'Identify potential risks, liabilities, and red flags in this document.',
      },
    ],
  },
  {
    category: 'Analysis',
    icon: '🔍',
    gradient:
      'from-rose-500/15 to-red-500/15',
    border: 'border-rose-500/25',
    accent:
      'text-rose-600 dark:text-rose-400',
    templates: [
      {
        label: 'Data Points',
        prompt:
          'Extract all key data points, statistics, and metrics from this document.',
      },
      {
        label: 'Definitions',
        prompt:
          'List and explain all key terms and definitions used in this document.',
      },
      {
        label: 'Timeline',
        prompt:
          'Create a chronological timeline of all events and dates mentioned.',
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────── */
/* Prism renderer                                                  */
/* ─────────────────────────────────────────────────────────────── */

function renderPrismTokens(
  tokens: (string | Prism.Token)[],
  keyPrefix = ''
): React.ReactNode[] {
  return tokens.map((token, idx) => {
    const key = `${keyPrefix}-${idx}`;

    if (typeof token === 'string') {
      return token;
    }

    const className = `token ${token.type} ${
      Array.isArray(token.alias)
        ? token.alias.join(' ')
        : token.alias || ''
    }`;

    if (typeof token.content === 'string') {
      return (
        <span key={key} className={className}>
          {token.content}
        </span>
      );
    }

    if (Array.isArray(token.content)) {
      return (
        <span key={key} className={className}>
          {renderPrismTokens(
            token.content as (string | Prism.Token)[],
            key
          )}
        </span>
      );
    }

    return (
      <span key={key} className={className}>
        {String(token.content)}
      </span>
    );
  });
}

/* ─────────────────────────────────────────────────────────────── */
/* Code block                                                       */
/* ─────────────────────────────────────────────────────────────── */

const CodeBlock: React.FC<{
  language: string;
  code: string;
}> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);

    toast.success('Code copied to clipboard');
  };

  const normalizedLang =
    (language || 'text').toLowerCase();

  const grammar =
    Prism.languages[normalizedLang] ||
    Prism.languages.text;

  const tokens = grammar
    ? Prism.tokenize(code, grammar)
    : [code];

  return (
    <div
      className="
        my-3
        rounded-xl
        border
        border-[var(--border-primary)]
        bg-[var(--bg-primary)]
        overflow-hidden
        text-xs
        shadow-md
        transition-colors
        duration-300
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          px-3.5
          py-2
          bg-[var(--bg-secondary)]
          border-b
          border-[var(--border-primary)]
          text-[var(--text-muted)]
          font-mono
          text-[11px]
          transition-colors
          duration-300
        "
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400/70" />
          </div>

          <span
            className="
              font-semibold
              uppercase
              tracking-wider
              text-[var(--primary)]
              ml-1
            "
          >
            {language || 'code'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="
            flex
            items-center
            gap-1.5
            text-[11px]
            text-[var(--text-muted)]
            hover:text-[var(--text-primary)]
            px-2
            py-1
            rounded
            bg-[var(--bg-input)]
            hover:bg-red-500/10
            transition-colors
            cursor-pointer
          "
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}

          <span>
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </button>
      </div>

      <div className="p-3.5 overflow-x-auto">
        <pre
          className="
            font-mono
            text-xs
            leading-relaxed
            text-[var(--text-secondary)]
            m-0
            p-0
            bg-transparent
            border-0
          "
        >
          <code className={`language-${normalizedLang}`}>
            {renderPrismTokens(tokens, 'code')}
          </code>
        </pre>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* Markdown renderer                                                */
/* ─────────────────────────────────────────────────────────────── */

const MarkdownContent: React.FC<{
  content: string;
  isStreaming?: boolean;
}> = ({ content, isStreaming }) => {
  return (
    <div
      className="
        text-sm
        leading-relaxed
        overflow-hidden
        text-[var(--text-secondary)]
        space-y-2
      "
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p({ children }) {
            return (
              <p
                className="
                  mb-2.5
                  last:mb-0
                  leading-relaxed
                  text-[var(--text-secondary)]
                "
              >
                {children}
              </p>
            );
          },

          h1({ children }) {
            return (
              <h1
                className="
                  text-xl
                  font-bold
                  text-[var(--text-primary)]
                  mt-4
                  mb-2
                  pb-1
                  border-b
                  border-[var(--border-primary)]
                  first:mt-0
                "
              >
                {children}
              </h1>
            );
          },

          h2({ children }) {
            return (
              <h2
                className="
                  text-lg
                  font-bold
                  text-[var(--text-primary)]
                  mt-3.5
                  mb-1.5
                  first:mt-0
                "
              >
                {children}
              </h2>
            );
          },

          h3({ children }) {
            return (
              <h3
                className="
                  text-base
                  font-semibold
                  text-[var(--text-primary)]
                  mt-3
                  mb-1
                  first:mt-0
                "
              >
                {children}
              </h3>
            );
          },

          h4({ children }) {
            return (
              <h4
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-[var(--primary)]
                  mt-2.5
                  mb-1
                  first:mt-0
                "
              >
                {children}
              </h4>
            );
          },

          ul({ children }) {
            return (
              <ul
                className="
                  list-disc
                  ml-5
                  pl-1
                  space-y-1.5
                  my-2
                  text-[var(--text-secondary)]
                "
              >
                {children}
              </ul>
            );
          },

          ol({ children }) {
            return (
              <ol
                className="
                  list-decimal
                  ml-5
                  pl-1
                  space-y-1.5
                  my-2
                  text-[var(--text-secondary)]
                "
              >
                {children}
              </ol>
            );
          },

          li({ children }) {
            return (
              <li className="leading-relaxed pl-0.5">
                {children}
              </li>
            );
          },

          blockquote({ children }) {
            return (
              <blockquote
                className="
                  border-l-4
                  border-red-500
                  bg-red-500/10
                  px-3.5
                  py-2
                  rounded-r-lg
                  text-[var(--text-secondary)]
                  italic
                  my-2.5
                  text-xs
                  leading-relaxed
                "
              >
                {children}
              </blockquote>
            );
          },

          hr() {
            return (
              <hr
                className="
                  border-[var(--border-primary)]
                  my-3.5
                "
              />
            );
          },

          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  text-[var(--primary)]
                  hover:opacity-80
                  underline
                  underline-offset-2
                  transition-colors
                  font-medium
                "
              >
                {children}
              </a>
            );
          },

          strong({ children }) {
            return (
              <strong
                className="
                  font-semibold
                  text-[var(--text-primary)]
                "
              >
                {children}
              </strong>
            );
          },

          em({ children }) {
            return (
              <em
                className="
                  italic
                  text-[var(--text-secondary)]
                "
              >
                {children}
              </em>
            );
          },

          del({ children }) {
            return (
              <del
                className="
                  line-through
                  text-[var(--text-muted)]
                "
              >
                {children}
              </del>
            );
          },

          table({ children }) {
            return (
              <div
                className="
                  my-3
                  overflow-x-auto
                  rounded-xl
                  border
                  border-[var(--border-primary)]
                  shadow-sm
                "
              >
                <table
                  className="
                    min-w-full
                    divide-y
                    divide-[var(--border-primary)]
                    text-left
                    text-xs
                  "
                >
                  {children}
                </table>
              </div>
            );
          },

          thead({ children }) {
            return (
              <thead className="bg-[var(--bg-secondary)]">
                {children}
              </thead>
            );
          },

          tbody({ children }) {
            return (
              <tbody
                className="
                  divide-y
                  divide-[var(--border-primary)]
                  bg-[var(--bg-primary)]
                "
              >
                {children}
              </tbody>
            );
          },

          th({ children }) {
            return (
              <th
                className="
                  px-3.5
                  py-2.5
                  font-semibold
                  text-[var(--text-primary)]
                "
              >
                {children}
              </th>
            );
          },

          td({ children }) {
            return (
              <td
                className="
                  px-3.5
                  py-2
                  text-[var(--text-secondary)]
                "
              >
                {children}
              </td>
            );
          },

          code({ className, children }) {
            const match =
              /language-(\w+)/.exec(
                className || ''
              );

            const codeString =
              String(children).replace(
                /\n$/,
                ''
              );

            const isMultiLine =
              codeString.includes('\n');

            if (match || isMultiLine) {
              return (
                <CodeBlock
                  language={
                    match ? match[1] : ''
                  }
                  code={codeString}
                />
              );
            }

            return (
              <code
                className="
                  px-1.5
                  py-0.5
                  mx-0.5
                  bg-red-500/10
                  text-[var(--primary)]
                  rounded
                  text-[13px]
                  font-mono
                  border
                  border-red-500/20
                "
              >
                {children}
              </code>
            );
          },

          pre({ children }) {
            return <>{children}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {isStreaming && (
        <span className="cursor-blink" />
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* Citation card                                                    */
/* ─────────────────────────────────────────────────────────────── */

const CitationCard: React.FC<{
  citation: CitationDto;
  index: number;
}> = ({ citation, index }) => {
  const [expanded, setExpanded] =
    useState(false);

  const score =
    citation.similarityScore ?? 0;

  const pct = (score * 100).toFixed(0);

  const barColor =
    score >= 0.8
      ? 'bg-red-500'
      : score >= 0.6
      ? 'bg-orange-500'
      : 'bg-rose-400';

  const textColor =
    score >= 0.8
      ? 'text-red-500'
      : score >= 0.6
      ? 'text-orange-500'
      : 'text-rose-400';

  const ext = citation.fileName
    ?.split('.')
    .pop()
    ?.toLowerCase();

  const extColors: Record<
    string,
    string
  > = {
    pdf: 'text-red-500',
    docx: 'text-red-400',
    csv: 'text-rose-500',
    md: 'text-red-600',
  };

  return (
    <div
      className="
        border
        border-[var(--border-primary)]
        rounded-xl
        overflow-hidden
        bg-[var(--bg-primary)]
        hover:border-red-500/40
        transition-colors
        duration-300
      "
    >
      <button
        type="button"
        onClick={() =>
          setExpanded(!expanded)
        }
        className="
          w-full
          flex
          items-center
          gap-2.5
          p-2.5
          text-left
          cursor-pointer
        "
      >
        <span
          className="
            flex-shrink-0
            w-5
            h-5
            bg-red-500/10
            text-red-500
            rounded-md
            text-xs
            flex
            items-center
            justify-center
            font-bold
            border
            border-red-500/20
          "
        >
          {index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <FileText
              className={clsx(
                'w-3 h-3 flex-shrink-0',
                extColors[ext ?? ''] ??
                  'text-[var(--text-muted)]'
              )}
            />

            <p
              className="
                text-xs
                text-[var(--text-secondary)]
                font-medium
                truncate
              "
            >
              {citation.fileName}
            </p>

            {citation.pageNumber && (
              <span
                className="
                  text-xs
                  text-[var(--text-muted)]
                  flex-shrink-0
                "
              >
                p.{citation.pageNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <div
              className="
                flex-1
                h-1
                bg-[var(--border-primary)]
                rounded-full
                overflow-hidden
              "
            >
              <div
                className={clsx(
                  'h-1 rounded-full',
                  barColor
                )}
                style={{
                  width: `${pct}%`,
                }}
              />
            </div>

            <span
              className={clsx(
                'text-[10px] font-bold flex-shrink-0',
                textColor
              )}
            >
              {pct}%
            </span>
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div
          className="
            px-3
            pb-3
            pt-0
            border-t
            border-[var(--border-primary)]
            animate-fade-in
          "
        >
          <p
            className="
              text-xs
              text-[var(--text-secondary)]
              leading-relaxed
              mt-2
            "
          >
            {citation.snippet}
          </p>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* Message bubble                                                   */
/* ─────────────────────────────────────────────────────────────── */

const MessageBubble: React.FC<{
  message: ConversationMessage;
}> = ({ message }) => {
  const isUser =
    message.messageType === 'USER';

  const [showCitations, setShowCitations] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [showTime, setShowTime] =
    useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      message.content
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);

    toast.success('Copied to clipboard');
  };

  const timeStr = message.createdAt
    ? new Date(
        message.createdAt
      ).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div
      className={clsx(
        'flex gap-3 group',
        isUser
          ? 'flex-row-reverse'
          : 'flex-row'
      )}
      onMouseEnter={() =>
        setShowTime(true)
      }
      onMouseLeave={() =>
        setShowTime(false)
      }
    >
      {/* Avatar */}

      <div
        className={clsx(
          `
            flex-shrink-0
            w-8
            h-8
            rounded-full
            flex
            items-center
            justify-center
            shadow-sm
            mt-0.5
          `,
          isUser
            ? 'bg-red-600'
            : 'bg-gradient-to-br from-red-500 to-rose-600'
        )}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-white" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-white" />
        )}
      </div>

      {/* Content */}

      <div
        className={clsx(
          'max-w-[78%] min-w-0',
          isUser
            ? 'items-end'
            : 'items-start'
        )}
      >
        <div
          className={clsx(
            `
              rounded-2xl
              px-4
              py-3
              text-sm
              transition-colors
              duration-300
            `,
            isUser
              ? `
                bg-red-600
                text-white
                rounded-tr-sm
                shadow-sm
              `
              : `
                bg-[var(--bg-input)]
                border
                border-[var(--border-primary)]
                rounded-tl-sm
              `
          )}
        >
          {isUser ? (
            <p className="text-white leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <MarkdownContent
              content={message.content}
              isStreaming={
                message.isStreaming
              }
            />
          )}
        </div>

        {/* Footer */}

        <div
          className={clsx(
            'flex items-center gap-2 mt-1.5',
            isUser
              ? 'justify-end'
              : 'justify-start'
          )}
        >
          {timeStr && (
            <span
              className={clsx(
                `
                  text-xs
                  text-[var(--text-muted)]
                  transition-opacity
                `,
                showTime
                  ? 'opacity-100'
                  : 'opacity-0'
              )}
            >
              {timeStr}
            </span>
          )}

          {!isUser &&
            message.responseTimeMs !==
              undefined &&
            message.responseTimeMs > 0 && (
              <span
                className="
                  flex
                  items-center
                  gap-1
                  text-xs
                  text-[var(--text-muted)]
                "
              >
                <Zap className="w-2.5 h-2.5 text-red-500" />
                {message.responseTimeMs}ms
              </span>
            )}

          {!isUser &&
            !message.isStreaming &&
            message.content && (
              <button
                type="button"
                onClick={handleCopy}
                className="
                  opacity-0
                  group-hover:opacity-100
                  flex
                  items-center
                  gap-1
                  text-xs
                  text-[var(--text-muted)]
                  hover:text-red-500
                  transition-all
                  cursor-pointer
                "
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-red-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
        </div>

        {/* Citations */}

        {!isUser &&
          (message.citations?.length ??
            0) > 0 &&
          !message.isStreaming && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() =>
                  setShowCitations(
                    !showCitations
                  )
                }
                className="
                  flex
                  items-center
                  gap-1.5
                  text-xs
                  text-red-500
                  hover:opacity-80
                  transition-colors
                  cursor-pointer
                "
              >
                <FileText className="w-3.5 h-3.5" />

                {message.citations!.length}{' '}
                source
                {message.citations!.length >
                1
                  ? 's'
                  : ''}

                {showCitations ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showCitations && (
                <div className="mt-2 space-y-1.5 animate-fade-in">
                  {message.citations!.map(
                    (c, i) => (
                      <CitationCard
                        key={i}
                        citation={c}
                        index={i}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* Typing indicator                                                 */
/* ─────────────────────────────────────────────────────────────── */

const TypingIndicator = () => (
  <div className="flex gap-3 animate-fade-in">
    <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
      <Bot className="w-3.5 h-3.5 text-white" />
    </div>

    <div
      className="
        bg-[var(--bg-input)]
        border
        border-[var(--border-primary)]
        rounded-2xl
        rounded-tl-sm
        px-4
        py-3
        transition-colors
        duration-300
      "
    >
      <div className="flex items-center gap-1 h-4">
        <div className="typing-dot bg-red-500" />
        <div className="typing-dot bg-red-500" />
        <div className="typing-dot bg-red-500" />
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────── */
/* Main ChatView                                                    */
/* ─────────────────────────────────────────────────────────────── */

const ChatView: React.FC = () => {
  const {
    selectedDocumentId,
    documents,
  } = useDocumentStore();

  const {
    activeConversationId,
    messages: allMessages,
    streamingMode,
    setStreamingMode,
    appendMessage,
    updateLastMessageContent,
    updateMessageMetadata,
    newChat,
  } = useConversationStore();

  const messages =
    allMessages[activeConversationId] ||
    [];

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] =
    useState(false);
  const [isStreaming, setIsStreaming] =
    useState(false);
  const [showTemplates, setShowTemplates] =
    useState(true);

  const abortRef =
    useRef<AbortController | null>(null);

  const bottomRef =
    useRef<HTMLDivElement>(null);

  const chatContainerRef =
    useRef<HTMLDivElement>(null);

  const shouldAutoScrollRef =
    useRef(true);

  const inputRef =
    useRef<HTMLTextAreaElement>(null);

  const selectedDoc =
    documents.find(
      (d) => d.id === selectedDocumentId
    );

  const handleScroll = useCallback(() => {
    const el =
      chatContainerRef.current;

    if (!el) return;

    const distanceToBottom =
      el.scrollHeight -
      el.scrollTop -
      el.clientHeight;

    shouldAutoScrollRef.current =
      distanceToBottom < 120;
  }, []);

  useEffect(() => {
    if (
      shouldAutoScrollRef.current
    ) {
      bottomRef.current?.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [
    messages.length,
    isLoading,
    isStreaming,
  ]);

  /* ───────────────────────────────────────── */
  /* Streaming                                 */
  /* ───────────────────────────────────────── */

  const sendStreaming = useCallback(
    async (
      question: string,
      convId: string
    ) => {
      const assistantMsgId =
        crypto.randomUUID();

      const startTime = Date.now();

      await appendMessage(convId, {
        id: assistantMsgId,
        messageType: 'ASSISTANT',
        content: '',
        createdAt:
          new Date().toISOString(),
        isStreaming: true,
      });

      setIsStreaming(true);

      const controller =
        new AbortController();

      abortRef.current = controller;

      const citationPromise =
        chatApi
          .searchSimilarity({
            query: question,
            documentId:
              selectedDocumentId ??
              undefined,
            topK: 5,
          })
          .catch(() => null);

      try {
        const response =
          await chatApi.stream(
            {
              question,
              documentId:
                selectedDocumentId ??
                undefined,
              topK: 5,
              conversationId: convId,
            },
            controller.signal
          );

        if (!response.ok) {
          let errorDetail =
            `HTTP ${response.status}`;

          try {
            const errData =
              await response.json();

            if (errData?.message) {
              errorDetail =
                errData.message;
            }
          } catch {
            // Ignore JSON parsing errors.
          }

          throw new Error(
            errorDetail
          );
        }

        if (!response.body) {
          throw new Error(
            'No response body'
          );
        }

        const reader =
          response.body.getReader();

        const decoder =
          new TextDecoder();

        let buffer = '';
        let accumulated = '';
        let streamEnded = false;
        let lastRenderTime = 0;

        const THROTTLE_MS = 35;

        const flushUpdate = (
          streaming: boolean
        ) => {
          updateLastMessageContent(
            convId,
            assistantMsgId,
            accumulated,
            streaming
          );

          if (
            shouldAutoScrollRef.current
          ) {
            bottomRef.current?.scrollIntoView(
              {
                behavior: 'smooth',
              }
            );
          }
        };

        const contentType =
          response.headers.get(
            'content-type'
          ) || '';

        const isEventStream =
          contentType.includes(
            'text/event-stream'
          );

        while (!streamEnded) {
          const { done, value } =
            await reader.read();

          if (done) break;

          const textChunk =
            decoder.decode(value, {
              stream: true,
            });

          if (isEventStream) {
            buffer += textChunk;

            const eventBlocks =
              buffer.split(
                /\r?\n\r?\n/
              );

            buffer =
              eventBlocks.pop() || '';

            for (const block of eventBlocks) {
              if (!block) continue;

              const lines =
                block.split(
                  /\r?\n/
                );

              const dataLines: string[] =
                [];

              for (const line of lines) {
                if (
                  line.startsWith(
                    'data:'
                  )
                ) {
                  dataLines.push(
                    line.slice(5)
                  );
                }
              }

              if (
                dataLines.length > 0
              ) {
                const eventData =
                  dataLines.join(
                    '\n'
                  );

                if (
                  eventData.trim() ===
                  '[DONE]'
                ) {
                  streamEnded = true;
                  break;
                }

                accumulated +=
                  eventData;
              }
            }
          } else {
            if (
              textChunk.includes(
                '[DONE]'
              )
            ) {
              accumulated +=
                textChunk.replace(
                  '[DONE]',
                  ''
                );

              streamEnded = true;
            } else {
              accumulated +=
                textChunk;
            }
          }

          const now = Date.now();

          if (
            now - lastRenderTime >=
              THROTTLE_MS ||
            streamEnded
          ) {
            lastRenderTime = now;

            flushUpdate(true);
          }
        }

        if (
          !streamEnded &&
          isEventStream &&
          buffer.trim()
        ) {
          const lines =
            buffer.split(/\r?\n/);

          const dataLines: string[] =
            [];

          for (const line of lines) {
            if (
              line.startsWith(
                'data:'
              )
            ) {
              dataLines.push(
                line.slice(5)
              );
            }
          }

          if (
            dataLines.length > 0
          ) {
            const eventData =
              dataLines.join('\n');

            if (
              eventData.trim() !==
              '[DONE]'
            ) {
              accumulated +=
                eventData;
            }
          }
        }

        try {
          await reader.cancel();
        } catch {
          // Ignore cancellation errors.
        }

        const responseTimeMs =
          Date.now() - startTime;

        setIsStreaming(false);

        abortRef.current = null;

        updateLastMessageContent(
          convId,
          assistantMsgId,
          accumulated,
          false
        );

        if (
          shouldAutoScrollRef.current
        ) {
          bottomRef.current?.scrollIntoView(
            {
              behavior: 'smooth',
            }
          );
        }

        const simRes =
          await citationPromise;

        if (
          simRes?.data?.matches
            ?.length
        ) {
          await updateMessageMetadata(
            convId,
            assistantMsgId,
            {
              citations:
                simRes.data.matches,
              responseTimeMs,
              isStreaming: false,
            }
          );
        } else {
          await updateMessageMetadata(
            convId,
            assistantMsgId,
            {
              responseTimeMs,
              isStreaming: false,
            }
          );
        }
      } catch (err: unknown) {
        if (
          (err as Error).name ===
          'AbortError'
        ) {
          updateLastMessageContent(
            convId,
            assistantMsgId,
            'Response generation stopped.',
            false
          );
        } else {
          const msg =
            err instanceof Error
              ? err.message
              : 'Stream failed';

          toast.error(msg);

          updateLastMessageContent(
            convId,
            assistantMsgId,
            `❌ ${msg}`,
            false
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [
      selectedDocumentId,
      appendMessage,
      updateLastMessageContent,
      updateMessageMetadata,
    ]
  );

  /* ───────────────────────────────────────── */
  /* Normal query                              */
  /* ───────────────────────────────────────── */

  const sendNormal = useCallback(
    async (
      question: string,
      convId: string
    ) => {
      setIsLoading(true);

      try {
        const res =
          await chatApi.query({
            question,
            documentId:
              selectedDocumentId ??
              undefined,
            topK: 5,
            conversationId: convId,
          });

        await appendMessage(convId, {
          id: crypto.randomUUID(),
          messageType: 'ASSISTANT',
          content: res.data.answer,
          citations:
            res.data.citations,
          responseTimeMs:
            res.data.responseTimeMs,
          createdAt:
            new Date().toISOString(),
        });
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Something went wrong';

        toast.error(msg);

        await appendMessage(convId, {
          id: crypto.randomUUID(),
          messageType: 'ASSISTANT',
          content: `❌ ${msg}`,
          createdAt:
            new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      selectedDocumentId,
      appendMessage,
    ]
  );

  /* ───────────────────────────────────────── */
  /* Send message                              */
  /* ───────────────────────────────────────── */

  const sendMessage = useCallback(
    async (question: string) => {
      if (
        !question.trim() ||
        isLoading ||
        isStreaming
      ) {
        return;
      }

      setShowTemplates(false);

      const convId =
        activeConversationId ||
        crypto.randomUUID();

      const userMsg: ConversationMessage =
        {
          id: crypto.randomUUID(),
          messageType: 'USER',
          content: question.trim(),
          createdAt:
            new Date().toISOString(),
        };

      setInput('');

      if (inputRef.current) {
        inputRef.current.style.height =
          'auto';
      }

      await appendMessage(
        convId,
        userMsg
      );

      if (streamingMode) {
        await sendStreaming(
          question.trim(),
          convId
        );
      } else {
        await sendNormal(
          question.trim(),
          convId
        );
      }

      inputRef.current?.focus();
    },
    [
      isLoading,
      isStreaming,
      activeConversationId,
      streamingMode,
      appendMessage,
      sendStreaming,
      sendNormal,
    ]
  );

  const stopStream = () => {
    abortRef.current?.abort();
  };

  const handleNewChat = () => {
    newChat();

    setShowTemplates(true);

    abortRef.current?.abort();
  };

  const isBusy =
    isLoading || isStreaming;

  const charCount = input.length;

  return (
    <div
      className="
        flex
        flex-col
        h-full
        bg-[var(--bg-primary)]
        text-[var(--text-primary)]
        transition-colors
        duration-300
      "
    >
      {/* Chat header */}

      <div
        className="
          flex
          items-center
          justify-between
          px-6
          py-3
          border-b
          border-[var(--border-primary)]
          flex-shrink-0
          bg-[var(--bg-secondary)]
          transition-colors
          duration-300
        "
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="
              w-6
              h-6
              bg-gradient-to-br
              from-red-500
              to-rose-600
              rounded-lg
              flex
              items-center
              justify-center
              flex-shrink-0
            "
          >
            <Sparkles className="w-3 h-3 text-white" />
          </div>

          <span
            className="
              text-sm
              font-semibold
              text-[var(--text-primary)]
              truncate
            "
          >
            {selectedDoc
              ? selectedDoc.filename
              : 'All Documents'}
          </span>

          {selectedDoc && (
            <span
              className="
                text-[10px]
                font-semibold
                bg-red-500/10
                text-red-500
                px-2
                py-0.5
                rounded-full
                border
                border-red-500/25
                uppercase
                tracking-wide
                flex-shrink-0
              "
            >
              Focused
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Streaming toggle */}

          <button
            type="button"
            onClick={() =>
              setStreamingMode(
                !streamingMode
              )
            }
            className={clsx(
              `
                flex
                items-center
                gap-1.5
                text-xs
                px-3
                py-1.5
                rounded-lg
                border
                transition-all
                cursor-pointer
              `,
              streamingMode
                ? `
                  bg-red-500/10
                  border-red-500/30
                  text-red-500
                  hover:bg-red-500/15
                `
                : `
                  bg-[var(--bg-input)]
                  border-[var(--border-primary)]
                  text-[var(--text-muted)]
                  hover:text-red-500
                `
            )}
            title={
              streamingMode
                ? 'Streaming ON — click to disable'
                : 'Streaming OFF — click to enable'
            }
          >
            {streamingMode ? (
              <>
                <Wifi className="w-3 h-3" />
                Streaming
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                Normal
              </>
            )}
          </button>

          {/* New chat */}

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleNewChat}
              className="
                flex
                items-center
                gap-1.5
                text-xs
                text-[var(--text-muted)]
                hover:text-red-500
                border
                border-[var(--border-primary)]
                hover:border-red-500/40
                px-3
                py-1.5
                rounded-lg
                transition-colors
                cursor-pointer
              "
            >
              <RotateCcw className="w-3 h-3" />
              New chat
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}

      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="
          flex-1
          overflow-y-auto
          px-6
          py-6
          space-y-5
          bg-[var(--bg-primary)]
          transition-colors
          duration-300
        "
      >
        {/* Welcome */}

        {messages.length === 0 &&
          showTemplates && (
            <div className="animate-fade-in max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="relative inline-block mb-4">
                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-br
                      from-red-500
                      to-rose-600
                      rounded-2xl
                      blur-xl
                      opacity-40
                    "
                  />

                  <div
                    className="
                      relative
                      w-16
                      h-16
                      bg-gradient-to-br
                      from-red-500
                      to-rose-600
                      rounded-2xl
                      flex
                      items-center
                      justify-center
                      shadow-xl
                      shadow-red-500/30
                    "
                  >
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                </div>

                <h2
                  className="
                    text-2xl
                    font-bold
                    text-[var(--text-primary)]
                    mb-2
                  "
                >
                  DocMind AI
                </h2>

                <p
                  className="
                    text-[var(--text-muted)]
                    text-sm
                    leading-relaxed
                    max-w-sm
                    mx-auto
                  "
                >
                  {selectedDoc
                    ? `Chatting with "${selectedDoc.filename}". Ask anything or pick a template below.`
                    : 'Ask questions across all your indexed documents, or select one from the sidebar.'}
                </p>

                {streamingMode && (
                  <div
                    className="
                      mt-3
                      inline-flex
                      items-center
                      gap-1.5
                      text-xs
                      text-red-500
                      bg-red-500/10
                      border
                      border-red-500/20
                      px-3
                      py-1
                      rounded-full
                    "
                  >
                    <Wifi className="w-3 h-3" />
                    Real-time streaming enabled
                  </div>
                )}
              </div>

              {/* Template grid */}

              <div className="space-y-3">
                {PROMPT_TEMPLATES.map(
                  (cat) => (
                    <div
                      key={cat.category}
                      className={clsx(
                        `
                          rounded-2xl
                          border
                          bg-gradient-to-br
                          p-4
                        `,
                        cat.gradient,
                        cat.border
                      )}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">
                          {cat.icon}
                        </span>

                        <h3
                          className={clsx(
                            'text-xs font-bold uppercase tracking-wider',
                            cat.accent
                          )}
                        >
                          {cat.category}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {cat.templates.map(
                          (t) => (
                            <button
                              type="button"
                              key={t.label}
                              onClick={() =>
                                sendMessage(
                                  t.prompt
                                )
                              }
                              className="
                                text-left
                                p-3
                                rounded-xl
                                bg-[var(--text-primary)]/5
                                hover:bg-red-500/10
                                border
                                border-[var(--text-primary)]/10
                                hover:border-red-500/25
                                transition-all
                                text-xs
                                text-[var(--text-secondary)]
                                hover:text-[var(--text-primary)]
                                group
                                cursor-pointer
                              "
                            >
                              <span className="font-medium block mb-0.5">
                                {t.label}
                              </span>

                              <span
                                className="
                                  text-[var(--text-muted)]
                                  text-[10px]
                                  line-clamp-2
                                  group-hover:text-red-400
                                  transition-colors
                                "
                              >
                                {t.prompt.slice(
                                  0,
                                  55
                                )}
                                …
                              </span>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        {/* Messages */}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
          />
        ))}

        {/* Typing */}

        {isLoading &&
          !isStreaming && (
            <TypingIndicator />
          )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}

      <div
        className="
          px-6
          py-4
          border-t
          border-[var(--border-primary)]
          flex-shrink-0
          bg-[var(--bg-secondary)]
          transition-colors
          duration-300
        "
      >
        {/* Streaming status */}

        {isStreaming && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-0.5">
              <div
                className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce"
                style={{
                  animationDelay: '0ms',
                }}
              />

              <div
                className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce"
                style={{
                  animationDelay: '100ms',
                }}
              />

              <div
                className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce"
                style={{
                  animationDelay: '200ms',
                }}
              />
            </div>

            <span
              className="
                text-xs
                text-red-500
                font-medium
              "
            >
              AI is responding…
            </span>
          </div>
        )}

        {/* Input */}

        <div
          className={clsx(
            `
              flex
              gap-3
              items-end
              border
              rounded-2xl
              px-4
              py-3
              transition-all
              duration-300
              bg-[var(--bg-input)]
            `,
            isBusy
              ? 'border-[var(--border-primary)]'
              : `
                border-[var(--border-primary)]
                focus-within:border-red-500
                focus-within:ring-1
                focus-within:ring-red-500/20
              `
          )}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey
              ) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder={
              isBusy
                ? 'Waiting for response…'
                : selectedDoc
                ? `Ask about "${selectedDoc.filename}"…`
                : 'Ask a question about your documents…'
            }
            rows={1}
            disabled={isBusy}
            className="
              flex-1
              bg-transparent
              text-sm
              text-[var(--text-primary)]
              placeholder-[var(--text-muted)]
              resize-none
              outline-none
              leading-relaxed
              disabled:opacity-60
            "
            style={{
              minHeight: '24px',
              maxHeight: '144px',
            }}
            onInput={(e) => {
              const t =
                e.currentTarget;

              t.style.height = 'auto';

              t.style.height = `${Math.min(
                t.scrollHeight,
                144
              )}px`;
            }}
          />

          {/* Stop / Send */}

          {isStreaming ? (
            <button
              type="button"
              onClick={stopStream}
              className="
                flex-shrink-0
                p-2
                bg-red-500/10
                hover:bg-red-500/20
                border
                border-red-500/30
                text-red-500
                rounded-xl
                transition-colors
                cursor-pointer
              "
              title="Stop generation"
            >
              <Square className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                sendMessage(input)
              }
              disabled={
                !input.trim() || isBusy
              }
              className="
                flex-shrink-0
                p-2
                bg-red-600
                hover:bg-red-700
                disabled:opacity-40
                disabled:cursor-not-allowed
                text-white
                rounded-xl
                transition-all
                cursor-pointer
                shadow-sm
                shadow-red-500/20
              "
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Footer */}

        <div className="flex items-center justify-between mt-2 px-1">
          <p
            className="
              text-[11px]
              text-[var(--text-muted)]
            "
          >
            Enter to send · Shift+Enter for new line
          </p>

          <div className="flex items-center gap-2">
            {charCount > 0 && (
              <span
                className={clsx(
                  'text-[11px]',
                  charCount > 1000
                    ? 'text-red-500'
                    : 'text-[var(--text-muted)]'
                )}
              >
                {charCount}
              </span>
            )}

            {messages.length > 0 && (
              <span
                className="
                  text-[11px]
                  text-[var(--text-muted)]
                "
              >
                {messages.length} msgs
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
