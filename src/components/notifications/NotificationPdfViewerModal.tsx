"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";

interface OfficialDoc {
  id: string;
  documentType: string;
  title: string;
  fileUrl: string;
  sourceUrl?: string | null;
  versionNumber?: number;
  publicationDate?: string | Date | null;
  fileSizeMb?: number | null;
  checksumSha256?: string | null;
}

interface CitationTarget {
  fieldName: string;
  pageNumber: number;
  sectionClause?: string | null;
  rawExcerpt?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentTitle: string;
  officialSourceUrl?: string;
  documentVersion?: number;
  publicationDate?: string | Date;
  recruitmentTitle?: string;
  citations?: CitationTarget[];
  initialPage?: number;
}

export function NotificationPdfViewerModal({
  isOpen,
  onClose,
  documentUrl,
  documentTitle,
  officialSourceUrl,
  documentVersion = 1,
  publicationDate,
  recruitmentTitle,
  citations = [],
  initialPage = 1,
}: Props) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"viewer" | "citations">("viewer");

  if (!isOpen) return null;

  // Build PDF viewer URL with page and zoom parameter (standard browser PDF support)
  const pdfEmbedUrl = `${documentUrl}#page=${currentPage}&zoom=${zoomLevel}${
    searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
  }`;

  const formattedDate = publicationDate
    ? new Date(publicationDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not specified";

  const handleJumpToCitation = (page: number) => {
    setCurrentPage(page);
    setActiveTab("viewer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? "w-full h-full rounded-none"
            : "w-full max-w-6xl max-h-[92vh] h-[850px]"
        }`}
      >
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-white truncate max-w-md">
                  {documentTitle || "Official Notification PDF"}
                </h3>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Version {documentVersion}.0
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Official
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-3 mt-0.5 truncate">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  Published: {formattedDate}
                </span>
                {recruitmentTitle && (
                  <span className="text-slate-500 hidden md:inline truncate">
                    • {recruitmentTitle}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {citations.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setActiveTab(activeTab === "viewer" ? "citations" : "viewer")
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  activeTab === "citations"
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Citations ({citations.length})
              </button>
            )}

            <a
              href={documentUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Download original government PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download Original</span>
            </a>

            {officialSourceUrl && (
              <a
                href={officialSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-colors"
                title="Open official department portal"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Open Official Source</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/80 text-xs text-slate-300">
          {/* Page navigation controls */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Page</span>
            <div className="flex items-center rounded-lg border border-slate-700 bg-slate-950 overflow-hidden">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min={1}
                value={currentPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1) setCurrentPage(val);
                }}
                className="w-12 text-center bg-transparent py-1 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick jump to page presets */}
            <div className="hidden lg:flex items-center gap-1.5 ml-2">
              <span className="text-slate-500">Jump to:</span>
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  currentPage === 1
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                Cover
              </button>
              {citations.slice(0, 3).map((cit) => (
                <button
                  key={cit.fieldName}
                  type="button"
                  onClick={() => setCurrentPage(cit.pageNumber)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                    currentPage === cit.pageNumber
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  {cit.fieldName} (p.{cit.pageNumber})
                </button>
              ))}
            </div>
          </div>

          {/* Search in document */}
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search text in document..."
                className="w-full pl-8 pr-3 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center text-[11px] font-mono text-slate-300">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body: Viewer or Citation Traceability Panel */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden flex flex-col md:flex-row">
          {activeTab === "citations" && citations.length > 0 && (
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/95 overflow-y-auto p-4 space-y-3 shrink-0">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Citation-Level Audit
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {citations.length} Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Click any citation below to jump directly to its exact page and clause in the official notification.
              </p>
              <div className="space-y-2">
                {citations.map((c) => (
                  <div
                    key={c.fieldName}
                    onClick={() => handleJumpToCitation(c.pageNumber)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      currentPage === c.pageNumber
                        ? "bg-blue-600/15 border-blue-500/50 shadow-sm"
                        : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white capitalize">
                        {c.fieldName.replace(/([A-Z])/g, " $1")}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Page {c.pageNumber}
                      </span>
                    </div>
                    {c.sectionClause && (
                      <p className="text-[11px] font-medium text-blue-300 truncate">
                        {c.sectionClause}
                      </p>
                    )}
                    {c.rawExcerpt && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 italic font-serif">
                        &ldquo;{c.rawExcerpt}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Embedded PDF Viewer */}
          <div className="flex-1 relative h-full flex flex-col bg-slate-950">
            <object
              data={pdfEmbedUrl}
              type="application/pdf"
              className="w-full h-full min-h-[500px] border-0"
            >
              {/* Fallback iframe */}
              <iframe
                src={pdfEmbedUrl}
                className="w-full h-full border-0 min-h-[500px]"
                title={documentTitle}
              >
                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
                    <FileText className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      Document Preview Unavailable in this Browser
                    </h4>
                    <p className="text-sm text-slate-400 max-w-md mt-1">
                      Your current browser does not support inline PDF rendering. You can download or view the official government notice directly.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in New Tab
                    </a>
                    <a
                      href={documentUrl}
                      download
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </a>
                  </div>
                </div>
              </iframe>
            </object>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>
              Official Government Document. Always cross-verify critical dates and eligibility criteria with this source.
            </span>
          </div>
          <span className="font-mono text-slate-500 hidden sm:inline">
            Document ID: {documentUrl.split("/").pop()?.substring(0, 24)}
          </span>
        </div>
      </div>
    </div>
  );
}
