import React, { useState } from 'react';
import {
  Search,
  Loader2,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Layers,
  SlidersHorizontal,
  Tag,
  BarChart2,
} from 'lucide-react';

import { chatApi } from '../services/api';
import { useDocumentStore } from '../store/documentStore';
import type {
  CitationDto,
  SearchResultDto,
} from '../types';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────────── */
/* Search types                                                    */
/* ─────────────────────────────────────────────────────────────── */

const SEARCH_TYPES = [
  {
    label: 'All',
    icon: '🔍',
    placeholder:
      'Search any concept, topic or keyword…',
    color: 'indigo',
  },
  {
    label: 'Clauses',
    icon: '📜',
    placeholder:
      'Find specific clauses or provisions…',
    color: 'blue',
  },
  {
    label: 'Facts & Data',
    icon: '📊',
    placeholder:
      'Find facts, figures and statistics…',
    color: 'emerald',
  },
  {
    label: 'Definitions',
    icon: '📚',
    placeholder:
      'Look up defined terms…',
    color: 'purple',
  },
];

/* ─────────────────────────────────────────────────────────────── */
/* Search type colors                                              */
/* ─────────────────────────────────────────────────────────────── */

const COLOR_MAP: Record<string, string> = {
  indigo:
    'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]',
  blue:
    'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]',
  emerald:
    'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]',
  purple:
    'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]',
};

/* ─────────────────────────────────────────────────────────────── */
/* Score colors                                                    */
/* ─────────────────────────────────────────────────────────────── */

function getScoreColor(score: number) {
  if (score >= 0.8) {
    return {
      bar: 'bg-emerald-500',
      badge:
        'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      label: 'High',
    };
  }

  if (score >= 0.6) {
    return {
      bar: 'bg-amber-500',
      badge:
        'text-amber-500 bg-amber-500/10 border-amber-500/20',
      label: 'Med',
    };
  }

  return {
    bar: 'bg-red-500',
    badge:
      'text-red-500 bg-red-500/10 border-red-500/20',
    label: 'Low',
  };
}

/* ─────────────────────────────────────────────────────────────── */
/* Result card                                                     */
/* ─────────────────────────────────────────────────────────────── */

const ResultCard: React.FC<{
  match: CitationDto;
  index: number;
}> = ({ match, index }) => {
  const [expanded, setExpanded] =
    useState(false);

  const score =
    match.similarityScore ?? 0;

  const pct = (score * 100).toFixed(1);

  const {
    bar,
    badge,
    label,
  } = getScoreColor(score);

  return (
    <div
      className="
        border
        border-[var(--border-primary)]
        rounded-xl
        overflow-hidden
        bg-[var(--bg-input)]
        hover:border-[var(--text-muted)]
        transition-all
        duration-300
        animate-fade-in
        group
      "
    >
      {/* Accent */}

      <div
        className={clsx(
          'h-0.5 w-full',
          bar
        )}
      />

      <div className="p-4">
        {/* Header */}

        <div className="flex items-start gap-3 mb-3">
          <div
            className="
              flex-shrink-0
              w-7
              h-7
              bg-[var(--bg-primary)]
              border
              border-[var(--border-primary)]
              rounded-lg
              flex
              items-center
              justify-center
              text-xs
              font-bold
              text-[var(--text-muted)]
              group-hover:border-[var(--primary)]/40
              transition-colors
            "
          >
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <p
                  className="
                    text-sm
                    font-semibold
                    text-[var(--text-primary)]
                    truncate
                    max-w-xs
                  "
                >
                  {match.fileName}
                </p>

                <div className="flex items-center gap-2 mt-0.5">
                  {match.pageNumber && (
                    <span
                      className="
                        text-xs
                        text-[var(--text-muted)]
                        flex
                        items-center
                        gap-0.5
                      "
                    >
                      <FileText className="w-3 h-3" />
                      p.{match.pageNumber}
                    </span>
                  )}

                  {match.chunkIndex != null && (
                    <span
                      className="
                        text-xs
                        text-[var(--text-muted)]
                      "
                    >
                      chunk #{match.chunkIndex}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span
                  className={clsx(
                    'text-xs font-bold px-2 py-0.5 rounded-full border',
                    badge
                  )}
                >
                  {label} · {pct}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Similarity */}

        <div
          className="
            w-full
            bg-[var(--border-primary)]
            rounded-full
            h-1
            mb-3
            overflow-hidden
          "
        >
          <div
            className={clsx(
              'h-1 rounded-full transition-all duration-500',
              bar
            )}
            style={{
              width: `${pct}%`,
            }}
          />
        </div>

        {/* Snippet */}

        <p
          className={clsx(
            `
              text-sm
              text-[var(--text-secondary)]
              leading-relaxed
            `,
            !expanded && 'line-clamp-3'
          )}
        >
          {match.snippet}
        </p>

        {/* Expand */}

        {match.snippet.length > 200 && (
          <button
            type="button"
            onClick={() =>
              setExpanded(!expanded)
            }
            className="
              flex
              items-center
              gap-1
              text-xs
              text-[var(--primary)]
              hover:opacity-80
              mt-2
              transition-colors
              cursor-pointer
            "
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Show more
              </>
            )}
          </button>
        )}

        {/* Metadata */}

        {match.metadata &&
          Object.keys(match.metadata)
            .length > 0 && (
            <div
              className="
                flex
                flex-wrap
                gap-1.5
                mt-3
                pt-3
                border-t
                border-[var(--border-primary)]
              "
            >
              {Object.entries(
                match.metadata
              )
                .filter(
                  ([key]) =>
                    ![
                      'documentId',
                      'fileName',
                      'snippet',
                    ].includes(key)
                )
                .slice(0, 5)
                .map(([key, value]) => (
                  <span
                    key={key}
                    className="
                      inline-flex
                      items-center
                      gap-1
                      text-xs
                      bg-[var(--bg-primary)]
                      text-[var(--text-muted)]
                      px-2
                      py-0.5
                      rounded-full
                      border
                      border-[var(--border-primary)]
                    "
                  >
                    <Tag className="w-2.5 h-2.5" />

                    <span className="text-[var(--text-muted)]">
                      {key}:
                    </span>

                    <span className="text-[var(--text-secondary)]">
                      {String(value)}
                    </span>
                  </span>
                ))}
            </div>
          )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/* Search View                                                     */
/* ─────────────────────────────────────────────────────────────── */

const SearchView: React.FC = () => {
  const {
    selectedDocumentId,
    documents,
  } = useDocumentStore();

  const [query, setQuery] =
    useState('');

  const [isSearching, setIsSearching] =
    useState(false);

  const [results, setResults] =
    useState<SearchResultDto | null>(
      null
    );

  const [topK, setTopK] =
    useState(10);

  const [minSimilarity, setMinSimilarity] =
    useState(0.3);

  const [selectedType, setSelectedType] =
    useState(0);

  const [showFilters, setShowFilters] =
    useState(false);

  const selectedDoc =
    documents.find(
      (doc) =>
        doc.id === selectedDocumentId
    );

  /* ───────────────────────────────────────── */
  /* Search                                     */
  /* ───────────────────────────────────────── */

  const handleSearch = async () => {
    if (!query.trim() || isSearching) {
      return;
    }

    setIsSearching(true);

    try {
      const res =
        await chatApi.searchSimilarity({
          query: query.trim(),
          documentId:
            selectedDocumentId ??
            undefined,
          topK,
          similaritySearch:
            minSimilarity,
        });

      setResults(res.data);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Search failed'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const EXAMPLE_QUERIES = [
    'payment terms',
    'termination clause',
    'liability cap',
    'force majeure',
    'intellectual property',
    'governing law',
    'warranty',
  ];

  return (
    <div
      className="
        flex
        flex-col
        h-full
        overflow-hidden
        bg-[var(--bg-primary)]
        text-[var(--text-primary)]
        transition-colors
        duration-300
      "
    >
      {/* ───────────────────────────────────────── */}
      {/* Search Header                              */}
      {/* ───────────────────────────────────────── */}

      <div
        className="
          px-6
          py-4
          border-b
          border-[var(--border-primary)]
          flex-shrink-0
          bg-[var(--bg-secondary)]
          transition-colors
          duration-300
        "
      >
        {/* Title row */}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="
                w-7
                h-7
                bg-[var(--primary)]/10
                rounded-lg
                flex
                items-center
                justify-center
                flex-shrink-0
              "
            >
              <Search
                className="
                  w-3.5
                  h-3.5
                  text-[var(--primary)]
                "
              />
            </div>

            <h2
              className="
                text-sm
                font-semibold
                text-[var(--text-primary)]
              "
            >
              Semantic Search
            </h2>

            {selectedDoc && (
              <span
                className="
                  text-xs
                  bg-[var(--primary)]/10
                  text-[var(--primary)]
                  px-2
                  py-0.5
                  rounded-full
                  border
                  border-[var(--primary)]/25
                  truncate
                  max-w-[220px]
                "
              >
                {selectedDoc.filename}
              </span>
            )}
          </div>

          {/* Filters */}

          <button
            type="button"
            onClick={() =>
              setShowFilters(
                !showFilters
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
                flex-shrink-0
              `,
              showFilters
                ? `
                  bg-[var(--primary)]/10
                  border-[var(--primary)]/30
                  text-[var(--primary)]
                `
                : `
                  border-[var(--border-primary)]
                  text-[var(--text-muted)]
                  hover:text-[var(--text-primary)]
                  hover:border-[var(--text-muted)]
                `
            )}
          >
            <SlidersHorizontal className="w-3 h-3" />
            Filters {showFilters && '✓'}
          </button>
        </div>

        {/* Search type tabs */}

        <div
          className="
            flex
            gap-2
            mb-3
            overflow-x-auto
            pb-0.5
            no-scrollbar
          "
        >
          {SEARCH_TYPES.map(
            (type, index) => (
              <button
                type="button"
                key={index}
                onClick={() =>
                  setSelectedType(
                    index
                  )
                }
                className={clsx(
                  `
                    flex
                    items-center
                    gap-1.5
                    px-3
                    py-1.5
                    rounded-lg
                    text-xs
                    font-medium
                    whitespace-nowrap
                    transition-all
                    flex-shrink-0
                    cursor-pointer
                  `,
                  selectedType === index
                    ? `${COLOR_MAP[type.color]} shadow-sm`
                    : `
                      bg-[var(--bg-input)]
                      border
                      border-[var(--border-primary)]
                      text-[var(--text-muted)]
                      hover:text-[var(--text-primary)]
                      hover:border-[var(--text-muted)]
                    `
                )}
              >
                <span>
                  {type.icon}
                </span>

                {type.label}
              </button>
            )
          )}
        </div>

        {/* Search input */}

        <div className="flex gap-2">
          <div
            className="
              flex-1
              flex
              items-center
              gap-2
              bg-[var(--bg-input)]
              border
              border-[var(--border-primary)]
              rounded-xl
              px-4
              py-2.5
              focus-within:border-[var(--primary)]
              transition-colors
            "
          >
            <Search
              className="
                w-4
                h-4
                text-[var(--text-muted)]
                flex-shrink-0
              "
            />

            <input
              type="text"
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter'
                ) {
                  handleSearch();
                }
              }}
              placeholder={
                SEARCH_TYPES[
                  selectedType
                ].placeholder
              }
              disabled={isSearching}
              className="
                flex-1
                bg-transparent
                text-sm
                text-[var(--text-primary)]
                placeholder-[var(--text-muted)]
                outline-none
                disabled:opacity-60
              "
            />

            {query && (
              <button
                type="button"
                onClick={() =>
                  setQuery('')
                }
                disabled={isSearching}
                className="
                  text-[var(--text-muted)]
                  hover:text-[var(--text-primary)]
                  transition-colors
                  cursor-pointer
                  disabled:opacity-40
                "
                aria-label="Clear search"
              >
                <ChevronUp className="w-3.5 h-3.5 rotate-180" />
              </button>
            )}
          </div>

          {/* Search button */}

          <button
            type="button"
            onClick={handleSearch}
            disabled={
              !query.trim() ||
              isSearching
            }
            className="
              flex
              items-center
              gap-2
              px-5
              py-2.5
              bg-[var(--primary)]
              hover:bg-[var(--primary-hover)]
              disabled:opacity-40
              disabled:cursor-not-allowed
              text-white
              text-sm
              font-medium
              rounded-xl
              transition-all
              shadow-sm
              cursor-pointer
            "
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}

            Search
          </button>
        </div>

        {/* Advanced filters */}

        {showFilters && (
          <div
            className="
              mt-3
              p-4
              bg-[var(--bg-primary)]
              rounded-xl
              border
              border-[var(--border-primary)]
              animate-fade-in
            "
          >
            <div className="grid grid-cols-2 gap-6">
              {/* Top results */}

              <div>
                <div className="flex justify-between mb-2">
                  <label
                    className="
                      text-xs
                      text-[var(--text-muted)]
                      font-medium
                    "
                  >
                    Top Results
                  </label>

                  <span
                    className="
                      text-xs
                      font-bold
                      text-[var(--primary)]
                    "
                  >
                    {topK}
                  </span>
                </div>

                <input
                  type="range"
                  min={1}
                  max={25}
                  value={topK}
                  onChange={(event) =>
                    setTopK(
                      Number(
                        event.target
                          .value
                      )
                    )
                  }
                  className="
                    w-full
                    h-1.5
                    accent-[var(--primary)]
                    bg-[var(--border-primary)]
                    rounded-full
                  "
                />

                <div
                  className="
                    flex
                    justify-between
                    mt-1
                    text-[10px]
                    text-[var(--text-muted)]
                  "
                >
                  <span>1</span>
                  <span>25</span>
                </div>
              </div>

              {/* Minimum similarity */}

              <div>
                <div className="flex justify-between mb-2">
                  <label
                    className="
                      text-xs
                      text-[var(--text-muted)]
                      font-medium
                    "
                  >
                    Min Similarity
                  </label>

                  <span
                    className="
                      text-xs
                      font-bold
                      text-[var(--primary)]
                    "
                  >
                    {(
                      minSimilarity * 100
                    ).toFixed(0)}
                    %
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={
                    minSimilarity
                  }
                  onChange={(event) =>
                    setMinSimilarity(
                      Number(
                        event.target
                          .value
                      )
                    )
                  }
                  className="
                    w-full
                    h-1.5
                    accent-[var(--primary)]
                    bg-[var(--border-primary)]
                    rounded-full
                  "
                />

                <div
                  className="
                    flex
                    justify-between
                    mt-1
                    text-[10px]
                    text-[var(--text-muted)]
                  "
                >
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Example queries */}

        {!results &&
          !isSearching && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span
                className="
                  text-xs
                  text-[var(--text-muted)]
                "
              >
                Try:
              </span>

              {EXAMPLE_QUERIES.map(
                (example) => (
                  <button
                    type="button"
                    key={example}
                    onClick={() =>
                      setQuery(example)
                    }
                    className="
                      text-xs
                      bg-[var(--bg-input)]
                      border
                      border-[var(--border-primary)]
                      text-[var(--text-muted)]
                      hover:text-[var(--primary)]
                      hover:border-[var(--primary)]/40
                      px-2.5
                      py-1
                      rounded-full
                      transition-colors
                      cursor-pointer
                    "
                  >
                    {example}
                  </button>
                )
              )}
            </div>
          )}
      </div>

      {/* ───────────────────────────────────────── */}
      {/* Results                                   */}
      {/* ───────────────────────────────────────── */}

      <div
        className="
          flex-1
          overflow-y-auto
          p-6
          bg-[var(--bg-primary)]
          transition-colors
          duration-300
        "
      >
        {/* Empty state */}

        {!results &&
          !isSearching && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div
                className="
                  w-20
                  h-20
                  bg-[var(--bg-input)]
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  mb-5
                  border
                  border-[var(--border-primary)]
                "
              >
                <Search
                  className="
                    w-9
                    h-9
                    text-[var(--text-muted)]
                  "
                />
              </div>

              <h3
                className="
                  text-lg
                  font-semibold
                  text-[var(--text-primary)]
                  mb-2
                "
              >
                Search your documents
              </h3>

              <p
                className="
                  text-sm
                  text-[var(--text-muted)]
                  max-w-sm
                  leading-relaxed
                "
              >
                Use vector similarity search
                to find relevant clauses,
                concepts, facts, and
                definitions across all your
                indexed documents.
              </p>
            </div>
          )}

        {/* Searching */}

        {isSearching && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="relative">
              <Loader2
                className="
                  w-10
                  h-10
                  text-[var(--primary)]
                  animate-spin
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  blur-xl
                  bg-[var(--primary)]/20
                  rounded-full
                "
              />
            </div>

            <div className="text-center">
              <p
                className="
                  text-[var(--text-primary)]
                  font-medium
                "
              >
                Searching vector store…
              </p>

              <p
                className="
                  text-xs
                  text-[var(--text-muted)]
                  mt-1
                "
              >
                Running similarity search
                across document embeddings
              </p>
            </div>
          </div>
        )}

        {/* Results */}

        {results &&
          !isSearching && (
            <div>
              {/* Summary */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-4
                  pb-4
                  border-b
                  border-[var(--border-primary)]
                "
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <BarChart2
                      className="
                        w-4
                        h-4
                        text-[var(--primary)]
                      "
                    />

                    <span
                      className="
                        text-sm
                        font-medium
                        text-[var(--text-primary)]
                      "
                    >
                      {results.totalMatches}{' '}
                      result
                      {results.totalMatches !==
                      1
                        ? 's'
                        : ''}
                    </span>
                  </div>

                  <span
                    className="
                      text-[var(--text-muted)]
                      text-sm
                    "
                  >
                    for
                  </span>

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-[var(--primary)]
                      truncate
                    "
                  >
                    "{results.query}"
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {results.totalMatches ===
                  0 ? (
                    <div
                      className="
                        flex
                        items-center
                        gap-1.5
                        text-amber-500
                        text-xs
                      "
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      No matches
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setResults(null)
                      }
                      className="
                        text-xs
                        text-[var(--text-muted)]
                        hover:text-[var(--text-primary)]
                        transition-colors
                        cursor-pointer
                      "
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* No matches */}

              {results.totalMatches ===
              0 ? (
                <div className="text-center py-16">
                  <Layers
                    className="
                      w-10
                      h-10
                      text-[var(--text-muted)]
                      mx-auto
                      mb-3
                    "
                  />

                  <p
                    className="
                      text-[var(--text-secondary)]
                      font-medium
                    "
                  >
                    No matching chunks found
                  </p>

                  <p
                    className="
                      text-sm
                      text-[var(--text-muted)]
                      mt-1
                    "
                  >
                    Try a different query or
                    reduce the similarity
                    threshold in filters
                  </p>
                </div>
              ) : (
                /* Result cards */

                <div className="space-y-3">
                  {results.matches.map(
                    (match, index) => (
                      <ResultCard
                        key={index}
                        match={match}
                        index={index}
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

export default SearchView;
