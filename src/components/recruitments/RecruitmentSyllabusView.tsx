"use client";

import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Layers,
  Sparkles,
  Download,
} from "lucide-react";

interface SyllabusSection {
  section: string;
  questions?: number | string;
  marks?: number | string;
  duration?: string;
  negativeMarking?: string;
  topics?: string[];
}

interface Props {
  recruitment: {
    id: string;
    title: string;
    organization?: { shortName?: string; name?: string };
    syllabusSummary?: string | null;
    examPatternJson?: string | null;
    selectionProcessSummary?: string | null;
  };
}

export function RecruitmentSyllabusView({ recruitment }: Props) {
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    0: true, // Expand first section by default
    1: true,
  });

  const parsedPattern: SyllabusSection[] = React.useMemo(() => {
    if (!recruitment.examPatternJson) return [];
    try {
      const data = JSON.parse(recruitment.examPatternJson);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }, [recruitment.examPatternJson]);

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopySyllabus = () => {
    let text = `# ${recruitment.title} - Official Examination Syllabus & Pattern\n\n`;
    text += `Organization: ${recruitment.organization?.name || recruitment.organization?.shortName}\n\n`;

    if (recruitment.selectionProcessSummary) {
      text += `## Selection Scheme\n${recruitment.selectionProcessSummary}\n\n`;
    }

    if (recruitment.syllabusSummary) {
      text += `## Syllabus Overview\n${recruitment.syllabusSummary}\n\n`;
    }

    if (parsedPattern.length > 0) {
      text += `## Detailed Section-wise Pattern & Topics\n\n`;
      parsedPattern.forEach((s, idx) => {
        text += `### ${idx + 1}. ${s.section}\n`;
        text += `- Questions: ${s.questions || "N/A"}\n`;
        text += `- Max Marks: ${s.marks || "N/A"}\n`;
        if (s.duration) text += `- Duration: ${s.duration}\n`;
        if (s.negativeMarking) text += `- Negative Marking: ${s.negativeMarking}\n`;
        if (s.topics && s.topics.length > 0) {
          text += `- Core Topics:\n`;
          s.topics.forEach((t) => (text += `  * ${t}\n`));
        }
        text += `\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSyllabus = () => {
    let text = `${recruitment.title} - Official Examination Syllabus & Pattern\n`;
    text += `=================================================================\n\n`;
    text += `Organization: ${recruitment.organization?.name || recruitment.organization?.shortName}\n\n`;

    if (recruitment.selectionProcessSummary) {
      text += `SELECTION SCHEME:\n${recruitment.selectionProcessSummary}\n\n`;
    }

    if (recruitment.syllabusSummary) {
      text += `SYLLABUS OVERVIEW:\n${recruitment.syllabusSummary}\n\n`;
    }

    if (parsedPattern.length > 0) {
      text += `DETAILED SECTIONS & TOPICS:\n`;
      text += `--------------------------\n\n`;
      parsedPattern.forEach((s, idx) => {
        text += `${idx + 1}. ${s.section.toUpperCase()}\n`;
        text += `   Questions: ${s.questions || "N/A"} | Marks: ${s.marks || "N/A"} | Duration: ${s.duration || "Standard"}\n`;
        if (s.negativeMarking) text += `   Negative Marking: ${s.negativeMarking}\n`;
        if (s.topics && s.topics.length > 0) {
          text += `   Topics Included:\n`;
          s.topics.forEach((t) => (text += `     • ${t}\n`));
        }
        text += `\n`;
      });
    }

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${recruitment.title.replace(/[^a-zA-Z0-9]/g, "_")}_Syllabus.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalQuestions = parsedPattern.reduce((acc, s) => {
    const q = typeof s.questions === "number" ? s.questions : parseInt(s.questions as string) || 0;
    return acc + q;
  }, 0);

  const totalMarks = parsedPattern.reduce((acc, s) => {
    const m = typeof s.marks === "number" ? s.marks : parseInt(s.marks as string) || 0;
    return acc + m;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with Actions */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Official Examination Syllabus & Pattern
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive subject-wise syllabus, mark distribution, and high-yield topics
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopySyllabus}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors shadow-sm"
              title="Copy markdown study syllabus to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Syllabus"}</span>
            </button>

            <button
              onClick={handleDownloadSyllabus}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-xs font-semibold text-blue-300 transition-colors shadow-sm"
              title="Download text study blueprint"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.txt)</span>
            </button>
          </div>
        </div>

        {/* Quick Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Total Sections</span>
            <div className="text-base font-bold text-white mt-0.5">
              {parsedPattern.length} Subject Papers
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Total Question Pool</span>
            <div className="text-base font-bold text-blue-400 mt-0.5">
              {totalQuestions > 0 ? `${totalQuestions} Questions` : "Stage Specific"}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Maximum Marks</span>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              {totalMarks > 0 ? `${totalMarks} Marks` : "Tier Dependent"}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Negative Marking</span>
            <div className="text-xs font-bold text-amber-400 mt-1 truncate">
              {parsedPattern[0]?.negativeMarking || "Applicable as per rules"}
            </div>
          </div>
        </div>

        {/* Syllabus Summary / Strategy Overview */}
        {recruitment.syllabusSummary && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Preparation Strategy & Subject Summary:
            </span>
            <p className="text-slate-300 leading-relaxed">
              {recruitment.syllabusSummary}
            </p>
          </div>
        )}
      </div>

      {/* Section-by-Section Interactive Breakdown */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <span>Section-Wise Pattern & Detailed Topics</span>
        </h4>

        {parsedPattern.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400 text-xs">
            Detailed syllabus sections are being updated from the official gazette notification.
          </div>
        ) : (
          <div className="space-y-3">
            {parsedPattern.map((section, idx) => {
              const isExpanded = !!expandedSections[idx];

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all duration-200"
                >
                  {/* Header row (clickable toggle) */}
                  <button
                    type="button"
                    onClick={() => toggleSection(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-start sm:items-center justify-between gap-4 hover:bg-slate-850/50 transition-colors"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Section {idx + 1}
                        </span>
                        {section.duration && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {section.duration}
                          </span>
                        )}
                        {section.negativeMarking && (
                          <span className="text-[10px] text-amber-400/90 font-mono">
                            • {section.negativeMarking}
                          </span>
                        )}
                      </div>

                      <h5 className="text-base font-bold text-slate-100 truncate">
                        {section.section}
                      </h5>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-bold text-white block">
                          {section.questions ? `${section.questions} Questions` : "Objective / Descriptive"}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-semibold">
                          {section.marks ? `${section.marks} Marks` : "Scored"}
                        </span>
                      </div>

                      <div className="p-1 rounded-lg bg-slate-800 text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Body: Detailed Topics */}
                  {isExpanded && (
                    <div className="px-4 pb-5 sm:px-5 border-t border-slate-800/80 pt-4 space-y-3 bg-slate-950/40">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">
                          Prescribed Core Topics & Concepts:
                        </span>
                        {section.topics && (
                          <span className="text-[11px] text-slate-400">
                            {section.topics.length} key areas
                          </span>
                        )}
                      </div>

                      {section.topics && section.topics.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {section.topics.map((topic, tIdx) => (
                            <div
                              key={tIdx}
                              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/90 text-xs text-slate-200 flex items-start gap-2"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{topic}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          Refer to official notification annexure for detailed sub-topics.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Negative Marking & Exam Rules Disclaimer Callout */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-300 block font-semibold">Important Scoring Advisory:</strong>
          <p className="text-amber-200/90 leading-relaxed">
            Ensure thorough practice under timed conditions. Where negative marking is applicable, unattempted questions incur no penalty, while incorrect guesses deduct marks from your aggregate score. Scores across multi-shift examinations are normalized using the standard official commission formula.
          </p>
        </div>
      </div>
    </div>
  );
}
