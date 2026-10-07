"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  GraduationCap,
  FileText,
  DollarSign,
  Globe,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Briefcase,
  Search,
} from "lucide-react";

interface OrganizationOption {
  id: string;
  name: string;
  shortName: string;
  category: string;
  officialWebsite: string;
}

interface PostRow {
  postName: string;
  department: string;
  vacancies: string;
  qualifications: string;
}

interface StageRow {
  stageOrder: number;
  stageName: string;
  description: string;
  status: string;
  admitCardStatus: string;
  resultStatus: string;
}

interface ExamPatternRow {
  section: string;
  questions: string;
  marks: string;
  duration: string;
  negativeMarking: string;
  topics: string;
}

const ALL_QUALIFICATIONS = [
  { code: "ANY_GRADUATE", label: "Any Graduate (All Disciplines)" },
  { code: "BTECH", label: "B.Tech (Engineering)" },
  { code: "BE", label: "B.E. (Engineering)" },
  { code: "BCOM", label: "B.Com (Commerce)" },
  { code: "BSC", label: "B.Sc (Science)" },
  { code: "BA", label: "B.A. (Arts)" },
  { code: "BCA", label: "BCA (Computer Applications)" },
  { code: "MCA", label: "MCA (Master of Computer Applications)" },
  { code: "MBA", label: "MBA (Management)" },
  { code: "12TH_PASS", label: "12th Pass / PUC" },
  { code: "10TH_PASS", label: "10th / SSLC Pass" },
  { code: "DIPLOMA", label: "Diploma / Polytechnic" },
];

const STATES_LIST = [
  "All India",
  "Karnataka",
  "Uttar Pradesh",
  "Bihar",
  "Maharashtra",
  "Tamil Nadu",
  "Telangana",
  "Rajasthan",
  "Madhya Pradesh",
  "West Bengal",
  "Andhra Pradesh",
  "Delhi NCT",
  "Kerala",
  "Punjab",
  "Haryana",
  "Gujarat",
  "Odisha",
  "Jharkhand",
  "Assam",
];

export function CreateExamTab({ onExamCreated }: { onExamCreated?: () => void }) {
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [recentExams, setRecentExams] = useState<any[]>([]);

  // Form State
  const [isNewOrg, setIsNewOrg] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgShort, setNewOrgShort] = useState("");
  const [newOrgCategory, setNewOrgCategory] = useState("STATE_PSC");
  const [newOrgWebsite, setNewOrgWebsite] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [notificationNumber, setNotificationNumber] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [vacancies, setVacancies] = useState("");
  const [totalVacanciesNote, setTotalVacanciesNote] = useState("");
  const [stateLocation, setStateLocation] = useState("Karnataka");
  const [status, setStatus] = useState("ACTIVE");
  const [lifecycleStage, setLifecycleStage] = useState("APPLICATIONS_OPEN");

  const [fresherEligible, setFresherEligible] = useState(true);
  const [experienceReq, setExperienceReq] = useState("None required. Fresh graduates eligible.");
  const [minAge, setMinAge] = useState("18");
  const [maxAge, setMaxAge] = useState("35");
  const [ageRelaxationDetails, setAgeRelaxationDetails] = useState("Category 2A/2B/3A/3B: 38 years, SC/ST/Cat-1: 40 years");

  const [payScale, setPayScale] = useState("Pay Level-3 (₹21,400 - ₹42,000)");
  const [inHandSalaryMin, setInHandSalaryMin] = useState("29000");
  const [inHandSalaryMax, setInHandSalaryMax] = useState("35000");
  const [allowances, setAllowances] = useState("State DA, HRA, Medical allowance, Field conveyance");

  const [appStartDate, setAppStartDate] = useState("");
  const [appDeadline, setAppDeadline] = useState("");
  const [appFeeGeneral, setAppFeeGeneral] = useState("600");
  const [appFeeReserved, setAppFeeReserved] = useState("300");

  const [officialNotificationUrl, setOfficialNotificationUrl] = useState("");
  const [officialApplyUrl, setOfficialApplyUrl] = useState("");
  const [officialAdmitCardUrl, setOfficialAdmitCardUrl] = useState("");
  const [officialResultUrl, setOfficialResultUrl] = useState("");

  const [selectedQualifications, setSelectedQualifications] = useState<string[]>([
    "ANY_GRADUATE",
    "BTECH",
    "BE",
    "BCOM",
    "BSC",
  ]);

  const [posts, setPosts] = useState<PostRow[]>([
    { postName: "", department: "", vacancies: "", qualifications: "" },
  ]);

  const [stages, setStages] = useState<StageRow[]>([
    {
      stageOrder: 1,
      stageName: "Preliminary Written Examination",
      description: "Objective screening OMR/CBT examination",
      status: "SCHEDULED",
      admitCardStatus: "NOT_ANNOUNCED",
      resultStatus: "NOT_ANNOUNCED",
    },
    {
      stageOrder: 2,
      stageName: "Document Verification & Merit Allotment",
      description: "Scrutiny of original certificates and counseling",
      status: "SCHEDULED",
      admitCardStatus: "NOT_ANNOUNCED",
      resultStatus: "NOT_ANNOUNCED",
    },
  ]);

  const [syllabusSummary, setSyllabusSummary] = useState("");
  const [selectionProcessSummary, setSelectionProcessSummary] = useState("");

  const [examPatterns, setExamPatterns] = useState<ExamPatternRow[]>([
    {
      section: "Paper 1: General Knowledge & Current Events",
      questions: "100",
      marks: "100",
      duration: "120 minutes",
      negativeMarking: "0.25 marks per wrong answer",
      topics: "General Science, History, Geography, Indian Constitution, Karnataka Schemes",
    },
  ]);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<{ id: string; slug: string; title: string } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoadingOrgs(true);
    try {
      const res = await fetch("/api/admin/recruitments");
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data.organizations || []);
        setRecentExams(data.recruitments || []);
        if (data.organizations?.length > 0) {
          // Default to KEA if exists, otherwise first org
          const keaOrg = data.organizations.find((o: any) => o.shortName === "KEA");
          setSelectedOrgId(keaOrg ? keaOrg.id : data.organizations[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load organizations:", err);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === autoSlug(title)) {
      setSlug(autoSlug(val));
    }
  };

  const autoSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const toggleQualification = (code: string) => {
    setSelectedQualifications((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const addPostRow = () => {
    setPosts([...posts, { postName: "", department: "", vacancies: "", qualifications: "" }]);
  };

  const removePostRow = (idx: number) => {
    setPosts(posts.filter((_, i) => i !== idx));
  };

  const updatePostRow = (idx: number, field: keyof PostRow, value: string) => {
    const updated = [...posts];
    updated[idx][field] = value;
    setPosts(updated);
  };

  const addStageRow = () => {
    setStages([
      ...stages,
      {
        stageOrder: stages.length + 1,
        stageName: "",
        description: "",
        status: "SCHEDULED",
        admitCardStatus: "NOT_ANNOUNCED",
        resultStatus: "NOT_ANNOUNCED",
      },
    ]);
  };

  const removeStageRow = (idx: number) => {
    setStages(stages.filter((_, i) => i !== idx));
  };

  const updateStageRow = (idx: number, field: keyof StageRow, value: any) => {
    const updated = [...stages];
    (updated[idx] as any)[field] = value;
    setStages(updated);
  };

  const addExamPatternRow = () => {
    setExamPatterns([
      ...examPatterns,
      {
        section: "",
        questions: "",
        marks: "",
        duration: "",
        negativeMarking: "0.25 marks per wrong answer",
        topics: "",
      },
    ]);
  };

  const removeExamPatternRow = (idx: number) => {
    setExamPatterns(examPatterns.filter((_, i) => i !== idx));
  };

  const updateExamPatternRow = (idx: number, field: keyof ExamPatternRow, value: string) => {
    const updated = [...examPatterns];
    updated[idx][field] = value;
    setExamPatterns(updated);
  };

  const handleDeleteExam = async (id: string, examTitle: string) => {
    if (!confirm(`Are you sure you want to delete exam: "${examTitle}"? This will permanently remove it from the platform.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/recruitments/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Exam deleted successfully");
        fetchInitialData();
        if (onExamCreated) onExamCreated();
      } else {
        alert(data.error || "Failed to delete exam");
      }
    } catch {
      alert("Error contacting server to delete exam.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitting(true);

    try {
      // Validate
      if (!title.trim()) {
        setSubmitError("Recruitment / Exam Title is required.");
        setSubmitting(false);
        return;
      }
      if (!shortDescription.trim()) {
        setSubmitError("Short Description is required.");
        setSubmitting(false);
        return;
      }
      if (!officialNotificationUrl.trim() || !officialApplyUrl.trim()) {
        setSubmitError("Both Official Notification URL and Official Apply Portal URL are required.");
        setSubmitting(false);
        return;
      }
      if (isNewOrg && (!newOrgName || !newOrgShort || !newOrgWebsite)) {
        setSubmitError("Please fill all details for the new organization (Name, Short Code, Website).");
        setSubmitting(false);
        return;
      }

      // Format patterns
      const formattedPatterns = examPatterns
        .filter((ep) => ep.section && ep.section.trim())
        .map((ep) => ({
          section: ep.section.trim(),
          questions: ep.questions ? parseInt(ep.questions, 10) : undefined,
          marks: ep.marks ? parseInt(ep.marks, 10) : undefined,
          duration: ep.duration.trim() || undefined,
          negativeMarking: ep.negativeMarking.trim() || undefined,
          topics: ep.topics ? ep.topics.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }));

      // Format payload
      const payload = {
        orgId: isNewOrg ? undefined : selectedOrgId,
        newOrg: isNewOrg
          ? {
              name: newOrgName.trim(),
              shortName: newOrgShort.trim().toUpperCase(),
              category: newOrgCategory,
              officialWebsite: newOrgWebsite.trim(),
            }
          : undefined,
        title: title.trim(),
        slug: slug.trim() || undefined,
        notificationNumber: notificationNumber.trim() || undefined,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim() || shortDescription.trim(),
        vacancies: vacancies ? parseInt(vacancies, 10) : undefined,
        totalVacanciesNote: totalVacanciesNote.trim() || undefined,
        stateLocation: stateLocation.trim() || "All India",
        status,
        lifecycleStage,
        fresherEligible,
        experienceReq: experienceReq.trim(),
        minAge: minAge ? parseInt(minAge, 10) : undefined,
        maxAge: maxAge ? parseInt(maxAge, 10) : undefined,
        ageRelaxationDetails: ageRelaxationDetails.trim() || undefined,
        payScale: payScale.trim(),
        inHandSalaryMin: inHandSalaryMin ? parseInt(inHandSalaryMin, 10) : undefined,
        inHandSalaryMax: inHandSalaryMax ? parseInt(inHandSalaryMax, 10) : undefined,
        allowances: allowances.trim() || undefined,
        appStartDate: appStartDate ? new Date(appStartDate).toISOString() : undefined,
        appDeadline: appDeadline ? new Date(appDeadline).toISOString() : undefined,
        appFeeGeneral: appFeeGeneral ? parseInt(appFeeGeneral, 10) : 0,
        appFeeReserved: appFeeReserved ? parseInt(appFeeReserved, 10) : 0,
        officialNotificationUrl: officialNotificationUrl.trim(),
        officialApplyUrl: officialApplyUrl.trim(),
        officialAdmitCardUrl: officialAdmitCardUrl.trim() || undefined,
        officialResultUrl: officialResultUrl.trim() || undefined,
        syllabusSummary: syllabusSummary.trim() || undefined,
        selectionProcessSummary: selectionProcessSummary.trim() || undefined,
        qualifications: selectedQualifications,
        posts: posts
          .filter((p) => p.postName && p.postName.trim())
          .map((p) => ({
            postName: p.postName.trim(),
            department: p.department.trim() || undefined,
            vacancies: p.vacancies ? parseInt(p.vacancies, 10) : undefined,
            qualifications: p.qualifications.trim() || undefined,
          })),
        stages: stages
          .filter((s) => s.stageName && s.stageName.trim())
          .map((s, idx) => ({
            stageOrder: idx + 1,
            stageName: s.stageName.trim(),
            description: s.description.trim() || undefined,
            status: s.status,
            admitCardStatus: s.admitCardStatus,
            resultStatus: s.resultStatus,
          })),
        examPattern: formattedPatterns,
      };

      const res = await fetch("/api/admin/recruitments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitSuccess(data.recruitment);
        // Refresh list
        fetchInitialData();
        if (onExamCreated) onExamCreated();
        // Reset top title
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSubmitError(data.error || "Failed to create recruitment");
      }
    } catch (err: any) {
      setSubmitError(err?.message || "Network error while saving exam");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-slate-900 border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Examination Publishing Console</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Publish New Government Exam & Recruitment
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Input verified commission circulars with complete multi-tier posts, selection stages,
            exam pattern syllabi, and official portal URLs. All entries automatically integrate with
            discovery, candidate eligibility matching, and calendar schedules.
          </p>
        </div>
      </div>

      {submitSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-sm text-white">
                Exam Published Successfully: {submitSuccess.title}
              </p>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                The recruitment is now live on the public discovery portal with full eligibility and syllabus breakdown.
              </p>
            </div>
          </div>
          <a
            href={`/recruitments/${submitSuccess.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 transition-colors shadow-md shadow-emerald-600/30"
          >
            <span>View Published Exam</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {submitError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Organization & Basic Details */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>1. Organization & Core Identification</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Organization Dropdown */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Recruiting Organization / Commission <span className="text-rose-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewOrg(!isNewOrg)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline"
                >
                  {isNewOrg ? "← Select Existing Commission" : "+ Register New Board / Org"}
                </button>
              </div>

              {isNewOrg ? (
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] text-slate-400 block mb-1">Full Organization Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Karnataka Examination Authority"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Short Code</label>
                      <input
                        type="text"
                        placeholder="e.g. KEA"
                        value={newOrgShort}
                        onChange={(e) => setNewOrgShort(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Sector / Category</label>
                      <select
                        value={newOrgCategory}
                        onChange={(e) => setNewOrgCategory(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="STATE_PSC">State PSC / Commission / Board</option>
                        <option value="CENTRAL">Central Ministry / UPSC / SSC</option>
                        <option value="BANKING">Banking & Finance (IBPS / SBI)</option>
                        <option value="REGULATORY">Regulatory Body (RBI / SEBI)</option>
                        <option value="RAILWAY">Railways (RRB)</option>
                        <option value="DEFENCE">Defence & Space</option>
                        <option value="PSU">Public Sector Undertaking</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Official Website</label>
                      <input
                        type="url"
                        placeholder="https://cetonline.karnataka.gov.in/kea/"
                        value={newOrgWebsite}
                        onChange={(e) => setNewOrgWebsite(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.shortName} — {org.name} ({org.category})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* State / Location */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Cadre / State Location <span className="text-rose-400">*</span>
              </label>
              <select
                value={stateLocation}
                onChange={(e) => setStateLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {STATES_LIST.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Title */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Official Exam / Recruitment Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. KEA Village Administrative Officer (VAO - Grama Prashasaka) 2026"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Custom Slug */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                SEO Deep-Link Slug (URL Identifier)
              </label>
              <input
                type="text"
                placeholder="kea-village-administrative-officer-2026"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* Notification Number */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Official Notification Reference No.
              </label>
              <input
                type="text"
                placeholder="e.g. KEA/RECRUIT/VAO/01/2026"
                value={notificationNumber}
                onChange={(e) => setNotificationNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Current Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ACTIVE">ACTIVE (Open for Applications)</option>
                <option value="CLOSING_SOON">CLOSING_SOON (Deadline within 7 days)</option>
                <option value="EXAM_SCHEDULED">EXAM_SCHEDULED (Dates Announced)</option>
                <option value="ADMIT_CARD_OUT">ADMIT_CARD_OUT (Hall Tickets Live)</option>
                <option value="RESULT_OUT">RESULT_OUT (Merit / Scorecard Out)</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            {/* Lifecycle Stage */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Lifecycle Stage
              </label>
              <select
                value={lifecycleStage}
                onChange={(e) => setLifecycleStage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="APPLICATIONS_OPEN">APPLICATIONS_OPEN</option>
                <option value="APPLICATIONS_CLOSED">APPLICATIONS_CLOSED</option>
                <option value="EXAMINATION_PROCESS">EXAMINATION_PROCESS</option>
                <option value="SELECTION_PROCESS">SELECTION_PROCESS</option>
                <option value="FINAL_RESULT">FINAL_RESULT</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Descriptions & Vacancies */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>2. Notice Descriptions & Vacancy Count</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Short Summary Description (for Search Cards & Discovery) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 1,000 Village Administrative Officers (Grama Prashasaka) under Revenue Department Karnataka across all 31 districts."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Full Official Circular Description
              </label>
              <textarea
                rows={3}
                placeholder="Comprehensive notification overview and background..."
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Total Vacancies Count
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={vacancies}
                  onChange={(e) => setVacancies(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Vacancies / Reservation Clarification Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1,000 district cadre posts with Kalyana Karnataka (HK) 371(J) reservations."
                  value={totalVacanciesNote}
                  onChange={(e) => setTotalVacanciesNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <input
                  type="checkbox"
                  id="fresherCheck"
                  checked={fresherEligible}
                  onChange={(e) => setFresherEligible(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="fresherCheck" className="text-xs font-medium text-slate-200 cursor-pointer">
                  <span className="font-bold text-white block">Fresher Candidates Eligible</span>
                  No prior professional experience required for direct entry
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Experience Requirement Clause
                </label>
                <input
                  type="text"
                  value={experienceReq}
                  onChange={(e) => setExperienceReq(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Age & Salary Structure */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>3. Age Limits & In-Hand Salary Structure</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Minimum Age Limit (Years)
              </label>
              <input
                type="number"
                placeholder="18"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Maximum Age Limit (UR/General)
              </label>
              <input
                type="number"
                placeholder="35"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Age Relaxation Details
              </label>
              <input
                type="text"
                placeholder="OBC: 3 yrs, SC/ST: 5 yrs"
                value={ageRelaxationDetails}
                onChange={(e) => setAgeRelaxationDetails(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Official Pay Scale Matrix <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Pay Scale ₹21,400 - ₹42,000"
                value={payScale}
                onChange={(e) => setPayScale(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Est. Min In-Hand Salary (₹/month)
              </label>
              <input
                type="number"
                placeholder="29000"
                value={inHandSalaryMin}
                onChange={(e) => setInHandSalaryMin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Est. Max In-Hand Salary (₹/month)
              </label>
              <input
                type="number"
                placeholder="35000"
                value={inHandSalaryMax}
                onChange={(e) => setInHandSalaryMax(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Allowances, HRA, Medical & State Perks
            </label>
            <input
              type="text"
              placeholder="State DA, HRA, Medical reimbursement, Rural Conveyance"
              value={allowances}
              onChange={(e) => setAllowances(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Section 4: Dates & Official Links */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>4. Important Timeline Dates & Official Portal Links</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Online Applications Open
              </label>
              <input
                type="date"
                value={appStartDate}
                onChange={(e) => setAppStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Application Deadline Cutoff
              </label>
              <input
                type="date"
                value={appDeadline}
                onChange={(e) => setAppDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Fee (General / OBC in ₹)
              </label>
              <input
                type="number"
                placeholder="600"
                value={appFeeGeneral}
                onChange={(e) => setAppFeeGeneral(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Fee (SC / ST / Women in ₹)
              </label>
              <input
                type="number"
                placeholder="300"
                value={appFeeReserved}
                onChange={(e) => setAppFeeReserved(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Official Notification PDF / Circular URL <span className="text-rose-400">*</span>
              </label>
              <input
                type="url"
                placeholder="https://cetonline.karnataka.gov.in/kea/documents/notice_2026.pdf"
                value={officialNotificationUrl}
                onChange={(e) => setOfficialNotificationUrl(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Official Application Form URL <span className="text-rose-400">*</span>
              </label>
              <input
                type="url"
                placeholder="https://cetonline.karnataka.gov.in/kea/vao"
                value={officialApplyUrl}
                onChange={(e) => setOfficialApplyUrl(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Official Admit Card Download URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://cetonline.karnataka.gov.in/kea/vao/admitcard"
                value={officialAdmitCardUrl}
                onChange={(e) => setOfficialAdmitCardUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Official Result / Merit List URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://cetonline.karnataka.gov.in/kea/vao/results"
                value={officialResultUrl}
                onChange={(e) => setOfficialResultUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Educational Qualifications */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span>5. Eligible Educational Qualifications</span>
          </div>

          <p className="text-xs text-slate-400">
            Select degrees allowed for this recruitment. Candidates with matching qualifications will see high compatibility scores.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {ALL_QUALIFICATIONS.map((q) => {
              const isSelected = selectedQualifications.includes(q.code);
              return (
                <button
                  type="button"
                  key={q.code}
                  onClick={() => toggleQualification(q.code)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? "bg-blue-600/20 border-blue-500 text-blue-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="truncate">{q.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 6: Specific Posts Breakdown */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>6. Department Posts Breakdown</span>
            </div>
            <button
              type="button"
              onClick={addPostRow}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Post</span>
            </button>
          </div>

          <div className="space-y-3">
            {posts.map((post, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Post Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Village Administrative Officer"
                    value={post.postName}
                    onChange={(e) => updatePostRow(idx, "postName", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Revenue Department"
                    value={post.department}
                    onChange={(e) => updatePostRow(idx, "department", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Vacancies</label>
                  <input
                    type="number"
                    placeholder="e.g. 1000"
                    value={post.vacancies}
                    onChange={(e) => updatePostRow(idx, "vacancies", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[11px] text-slate-400 block mb-1">Qualifications</label>
                    <input
                      type="text"
                      placeholder="12th / PUC / Any Graduate"
                      value={post.qualifications}
                      onChange={(e) => updatePostRow(idx, "qualifications", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  {posts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePostRow(idx)}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Selection Process & Stages */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>7. Selection Process & Examination Stages</span>
            </div>
            <button
              type="button"
              onClick={addStageRow}
              className="px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stage</span>
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Selection Process Overview Flow
            </label>
            <input
              type="text"
              placeholder="e.g. Compulsory Kannada Test -> Written Competitive Examination -> Document Verification (No interview)"
              value={selectionProcessSummary}
              onChange={(e) => setSelectionProcessSummary(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-3 pt-2">
            {stages.map((stage, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400">
                    Stage {idx + 1}
                  </span>
                  {stages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStageRow(idx)}
                      className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Stage Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Written Competitive Exam (Paper 1 & 2)"
                      value={stage.stageName}
                      onChange={(e) => updateStageRow(idx, "stageName", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-400 block mb-1">Description</label>
                    <input
                      type="text"
                      placeholder="Objective OMR test covering GK and General Kannada/English"
                      value={stage.description}
                      onChange={(e) => updateStageRow(idx, "description", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Stage Status</label>
                    <select
                      value={stage.status}
                      onChange={(e) => updateStageRow(idx, "status", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="SCHEDULED">SCHEDULED</option>
                      <option value="ONGOING">ONGOING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="POSTPONED">POSTPONED</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Admit Card Status</label>
                    <select
                      value={stage.admitCardStatus}
                      onChange={(e) => updateStageRow(idx, "admitCardStatus", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="NOT_ANNOUNCED">NOT_ANNOUNCED</option>
                      <option value="EXPECTED_SOON">EXPECTED_SOON</option>
                      <option value="RELEASED">RELEASED (Downloadable)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Result Status</label>
                    <select
                      value={stage.resultStatus}
                      onChange={(e) => updateStageRow(idx, "resultStatus", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="NOT_ANNOUNCED">NOT_ANNOUNCED</option>
                      <option value="EXPECTED_SOON">EXPECTED_SOON</option>
                      <option value="RELEASED">RELEASED (Merit Declared)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 8: Syllabus & Exam Pattern */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>8. Syllabus & Exam Pattern Breakdown</span>
            </div>
            <button
              type="button"
              onClick={addExamPatternRow}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Exam Section</span>
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Comprehensive Syllabus Summary
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Compulsory Kannada Language Test (SSLC standard - 50 marks). Written Competitive Exam: Paper 1 (General Knowledge - 100 marks) + Paper 2 (General Kannada/English - 100 marks). 0.25 negative marking."
              value={syllabusSummary}
              onChange={(e) => setSyllabusSummary(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-3 pt-2">
            {examPatterns.map((ep, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">
                    Exam Pattern Section {idx + 1}
                  </span>
                  {examPatterns.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExamPatternRow(idx)}
                      className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-400 block mb-1">Section / Paper Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Paper 1: General Knowledge"
                      value={ep.section}
                      onChange={(e) => updateExamPatternRow(idx, "section", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Questions</label>
                    <input
                      type="number"
                      placeholder="100"
                      value={ep.questions}
                      onChange={(e) => updateExamPatternRow(idx, "questions", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Total Marks</label>
                    <input
                      type="number"
                      placeholder="100"
                      value={ep.marks}
                      onChange={(e) => updateExamPatternRow(idx, "marks", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Duration & Time</label>
                    <input
                      type="text"
                      placeholder="120 minutes (2 Hours)"
                      value={ep.duration}
                      onChange={(e) => updateExamPatternRow(idx, "duration", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Negative Marking Clause</label>
                    <input
                      type="text"
                      placeholder="0.25 marks per wrong answer"
                      value={ep.negativeMarking}
                      onChange={(e) => updateExamPatternRow(idx, "negativeMarking", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Topics (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Karnataka History, Constitution, Rural Development, Current Affairs, Science"
                    value={ep.topics}
                    onChange={(e) => updateExamPatternRow(idx, "topics", e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${submitting ? "animate-spin" : ""}`} />
            <span>{submitting ? "Verifying & Publishing Exam..." : "🚀 Publish Exam to Discovery"}</span>
          </button>
        </div>
      </form>

      {/* Directory of Active / Managed Exams */}
      <div className="p-6 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span>Active Managed Exams in System ({recentExams.length})</span>
          </div>
          <button
            onClick={fetchInitialData}
            className="text-xs text-slate-400 hover:text-white font-semibold"
          >
            Refresh List
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Title & Organization</th>
                <th className="py-2.5 px-3">Vacancies</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Posts & Stages</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentExams.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3">
                    <p className="font-bold text-white">{rec.title}</p>
                    <p className="text-[11px] text-blue-400">{rec.organization?.shortName} — {rec.organization?.name}</p>
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {rec.vacancies?.toLocaleString() || "Not Stated"}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {rec.posts?.length || 0} Posts • {rec.stages?.length || 0} Stages
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/recruitments/${rec.slug || rec.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDeleteExam(rec.id, rec.title)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
