import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Image as ImageIcon, Search, Pencil, Eye, Settings, User, LogOut, FileSearch, Shield, UploadCloud, Loader2, CheckCircle2, Check, X, Maximize2, Minimize2, Activity, Tags, BookOpen } from "lucide-react";
import logo from "../imports/image.png";
import { ResumeBuilder } from "./components/ResumeBuilder";
import { FileViewer } from "./components/FileViewer";
import { ask, type AskSource, type ClassifiedProcess } from "@/lib/ask";
import { FormattedAnswer } from "./components/FormattedAnswer";

export default function App() {
  const [isShelfOpen, setIsShelfOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typedText, setTypedText] = useState("");
  const [responseText, setResponseText] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [searchCount, setSearchCount] = useState(0);
  const [lastQuery, setLastQuery] = useState("");
  const [responseSources, setResponseSources] = useState<AskSource[]>([]);
  const [responseClassified, setResponseClassified] = useState<ClassifiedProcess[]>([]);
  const [responseFrameworkRefs, setResponseFrameworkRefs] = useState<string[]>([]);
  const [responseWasFiltered, setResponseWasFiltered] = useState<boolean | null>(null);
  const [isResumeBuilderOpen, setIsResumeBuilderOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<{ id: string; name: string; type: string } | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  const [taskProgress, setTaskProgress] = useState(1); // 1 = Review Files, 2 = AI Approval, 3 = Complete
  const [activeTaskModal, setActiveTaskModal] = useState<number | null>(null);
  const [isWorkspaceVisible, setIsWorkspaceVisible] = useState(true);

  const tasks = [
    { id: 1, title: "Review Materials", description: "Review and edit your drafted resume and interview prep notes.", modalContent: "Your resume and cover letter drafts are ready for review. Make any final tweaks before the AI alignment check." },
    { id: 2, title: "AI Alignment Check", description: "Upload modified documents for AI feedback.", modalContent: "The AI evaluates your uploaded documents against the target job description to ensure maximum alignment and correct formatting." },
    { id: 3, title: "Ready to Apply", description: "Final submission and application generation.", modalContent: "Your materials are perfectly aligned! You are ready to export your finalized documents and submit your application to the employer." }
  ];
  
  const fullText = responseText;

  useEffect(() => {
    if (isSearching && fullText) {
      let i = 0;
      setTypedText("");
      const interval = setInterval(() => {
        setTypedText(fullText.slice(0, i));
        i++;
        if (i > fullText.length) clearInterval(interval);
      }, 15);
      return () => clearInterval(interval);
    } else {
      setTypedText("");
    }
  }, [isSearching, fullText]);

  const handleSearch = async () => {
    const queryToAsk = searchQuery.trim();
    if (!queryToAsk) return;

    setIsSearching(true);
    setIsWorkspaceVisible(true);
    setSearchCount((prev) => prev + 1);
    setLastQuery(queryToAsk);
    setSearchQuery(""); // Clear for follow up

    setAskError(null);
    setIsAsking(true);
    setResponseText("");
    setResponseSources([]);
    setResponseClassified([]);
    setResponseFrameworkRefs([]);
    setResponseWasFiltered(null);

    try {
      const res = await ask(queryToAsk);
      setResponseText(res.answer);
      setResponseSources(res.sources ?? []);
      setResponseClassified(res.classified ?? []);
      setResponseFrameworkRefs(res.framework_refs_used ?? []);
      setResponseWasFiltered(res.was_filtered ?? null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setAskError(message);
      setResponseText(
        "Sorry — I couldn’t reach the backend right now. Please check your Supabase Edge Function and try again."
      );
    } finally {
      setIsAsking(false);
    }
  };

  const handleSubmitForReview = () => {
    setIsSubmittingReview(true);
    setTimeout(() => {
      setIsSubmittingReview(false);
      setIsReviewSubmitted(true);
      setTaskProgress(2); // Move to next step on upload approval
      setTimeout(() => setIsReviewSubmitted(false), 3000);
    }, 1500);
  };

  return (
    <div 
      className="min-h-screen bg-white relative overflow-hidden font-sans"
      style={{
        backgroundImage: "radial-gradient(rgba(23, 60, 122, 0.08) 1.5px, transparent 1.5px)",
        backgroundSize: "28px 28px"
      }}
    >
      {/* Top Right Navigation */}
      <div className="fixed top-6 right-6 flex items-center gap-4 z-50">
        {/* Supabase ask() call counter */}
        <div
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#173C7A]/15 text-[#173C7A] rounded-full pl-3 pr-1.5 py-1 shadow-sm"
          title={`ask() Supabase function has been called ${searchCount} time${searchCount === 1 ? "" : "s"}`}
        >
          <Activity
            size={14}
            className={isAsking ? "text-[#306FB8] animate-pulse" : "text-[#306FB8]/70"}
          />
          <span className="text-xs font-medium tracking-wide hidden sm:inline">
            ask calls
          </span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={searchCount}
              initial={{ scale: 0.6, opacity: 0, y: -4 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.6, opacity: 0, y: 4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="min-w-[1.5rem] h-6 inline-flex items-center justify-center px-2 rounded-full bg-[#306FB8] text-white text-xs font-semibold tabular-nums"
            >
              {searchCount}
            </motion.span>
          </AnimatePresence>
        </div>
        <button className="bg-[#306FB8] hover:bg-[#173C7A] text-white px-4 py-2 rounded-lg transition-colors">
          take aim
        </button>
        <div className="relative">
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-[#173C7A]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          <AnimatePresence>
            {isProfileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileMenuOpen(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#173C7A]/10 z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-[#173C7A]/10 bg-gray-50/50">
                    <p className="text-sm font-medium text-[#173C7A]">Alex Morgan</p>
                    <p className="text-xs text-gray-500">alex@example.com</p>
                  </div>
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#306FB8] flex items-center gap-3 transition-colors">
                      <User size={16} />
                      Your Profile
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#306FB8] flex items-center gap-3 transition-colors">
                      <FileSearch size={16} />
                      Career History
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#306FB8] flex items-center gap-3 transition-colors">
                      <Settings size={16} />
                      Account Settings
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#306FB8] flex items-center gap-3 transition-colors">
                      <Shield size={16} />
                      Privacy & Data
                    </button>
                  </div>
                  <div className="border-t border-[#173C7A]/10 py-2">
                    <button className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="absolute inset-0 flex flex-col items-center">
        {/* LOGO */}
        <div 
          className="absolute z-50 transition-all duration-700 ease-in-out flex items-center gap-4"
          style={{
            left: isSearching ? "1.5rem" : "50%",
            top: isSearching ? "1.5rem" : "50%",
            transform: isSearching ? "translate(0, 0) scale(0.85)" : "translate(-50%, -120px) scale(1)",
            transformOrigin: "top left"
          }}
        >
          <img 
            src={logo} 
            alt="Archer" 
            className="h-16 opacity-90 cursor-pointer transition-opacity hover:opacity-100" 
            onClick={() => { setIsSearching(false); setSearchQuery(""); }} 
          />
        </div>

        {/* RESULTS AREA */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
              }}
              exit={{ opacity: 0, y: 10, transition: { duration: 0.2, ease: "easeIn" } }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute top-[120px] w-full max-w-5xl px-6 flex"
              style={{
                gap: isWorkspaceVisible ? "3rem" : "0rem",
                bottom: isShelfOpen ? "320px" : "220px",
              }}
            >
              {/* Sidebar with generic files */}
              <AnimatePresence mode="popLayout">
                {isWorkspaceVisible && (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }} 
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} 
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-1 min-h-0"
                  >
                    {(responseClassified.length > 0 || responseWasFiltered !== null || lastQuery) && (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white border border-[#173C7A]/10 p-4 rounded-xl shadow-sm"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Tags size={16} className="text-[#306FB8]" />
                          <h4 className="text-[#173C7A] font-semibold text-sm">Query Classification</h4>
                        </div>
                        {lastQuery && (
                          <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-3">
                            &ldquo;{lastQuery}&rdquo;
                          </p>
                        )}
                        {responseWasFiltered !== null && (
                          <p className="text-xs text-gray-600 mb-3">
                            Framework filter:{" "}
                            <span className="font-medium text-[#173C7A]">
                              {responseWasFiltered ? "Applied" : "Not applied"}
                            </span>
                          </p>
                        )}
                        {responseClassified.length > 0 ? (
                          <ul className="space-y-2">
                            {responseClassified.map((item, i) => (
                              <li
                                key={`${item.phase}-${item.process}-${i}`}
                                className="text-xs bg-[#306FB8]/5 border border-[#306FB8]/15 rounded-lg px-3 py-2"
                              >
                                <p className="font-medium text-[#173C7A]">
                                  Phase {item.phase}: {item.phase_name}
                                </p>
                                <p className="text-gray-600 mt-0.5">
                                  Process {item.process}: {item.process_name}
                                </p>
                              </li>
                            ))}
                          </ul>
                        ) : !isAsking ? (
                          <p className="text-xs text-gray-500">No framework match returned.</p>
                        ) : (
                          <p className="text-xs text-gray-500">Classifying…</p>
                        )}
                        {responseFrameworkRefs.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#173C7A]/10">
                            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">
                              Framework refs used
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {responseFrameworkRefs.map((ref) => (
                                <span
                                  key={ref}
                                  className="text-[11px] font-mono bg-[#173C7A]/8 text-[#173C7A] px-2 py-0.5 rounded-md"
                                >
                                  {ref}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                      onClick={() => setIsResumeBuilderOpen(true)}
                      className="bg-white border border-[#173C7A]/10 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-[#306FB8]/30 transition-all cursor-pointer flex items-center gap-4 group relative overflow-hidden"
                    >
                  <div className="bg-[#306FB8]/10 p-3 rounded-lg text-[#306FB8] group-hover:scale-110 transition-transform">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[#173C7A] font-medium text-sm">Resume_Draft.pdf</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Updated 2 mins ago</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#306FB8] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm absolute right-4">
                    <Pencil size={12} />
                    Edit
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                  onClick={() => setViewingFile({ id: 'prep', name: 'Interview_Prep.docx', type: 'document' })}
                  className="bg-white border border-[#173C7A]/10 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-[#306FB8]/30 transition-all cursor-pointer flex items-center gap-4 group relative overflow-hidden"
                >
                  <div className="bg-[#306FB8]/10 p-3 rounded-lg text-[#306FB8] group-hover:scale-110 transition-transform">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[#173C7A] font-medium text-sm">Interview_Prep.docx</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Career coaching notes</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#306FB8] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm absolute right-4">
                    <Eye size={12} />
                    View
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                  onClick={() => setViewingFile({ id: 'roadmap', name: 'Career_Roadmap.png', type: 'image' })}
                  className="bg-white border border-[#173C7A]/10 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-[#306FB8]/30 transition-all cursor-pointer flex items-center gap-4 group relative overflow-hidden"
                >
                  <div className="bg-[#306FB8]/10 p-3 rounded-lg text-[#306FB8] group-hover:scale-110 transition-transform">
                    <ImageIcon size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[#173C7A] font-medium text-sm">Career_Roadmap.png</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Visual timeline</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#306FB8] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm absolute right-4">
                    <Eye size={12} />
                    View
                  </div>
                </motion.div>

                {/* Upload Box */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                  className="mt-2 border-2 border-dashed border-[#173C7A]/20 rounded-xl pt-6 pb-12 px-6 flex flex-col items-center justify-center text-center hover:bg-[#306FB8]/5 hover:border-[#306FB8]/50 transition-colors cursor-pointer group bg-white/50 backdrop-blur-sm relative"
                >
                  <div className="bg-[#306FB8]/10 p-3 rounded-full text-[#306FB8] group-hover:scale-110 transition-transform mb-3">
                    <UploadCloud size={24} />
                  </div>
                  <h4 className="text-[#173C7A] font-medium text-sm">Upload new files</h4>
                  <p className="text-xs text-gray-500 mt-1">Drag & drop or click to browse</p>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleSubmitForReview(); }}
                    disabled={isSubmittingReview || isReviewSubmitted}
                    className="absolute bottom-3 right-3 bg-[#173C7A] hover:bg-[#0f2852] text-white px-3 py-1.5 rounded-md text-xs font-medium transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5 disabled:opacity-90 disabled:cursor-not-allowed z-10"
                  >
                    {isSubmittingReview ? (
                      <><Loader2 className="animate-spin" size={12} /> Sending...</>
                    ) : isReviewSubmitted ? (
                      <><CheckCircle2 size={12} /> Sent</>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generative response text */}
              <motion.div 
                layout
                className="flex flex-col gap-6 w-full min-h-0"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {/* Task Progress Bar - Circular Steps */}
                <AnimatePresence>
                  {isWorkspaceVisible && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, height: 0, overflow: 'hidden' }} 
                      animate={{ opacity: 1, y: 0, height: 'auto', overflow: 'visible' }} 
                      exit={{ opacity: 0, y: -10, height: 0, overflow: 'hidden' }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/80 backdrop-blur-sm border border-[#173C7A]/10 rounded-2xl p-2.5 shadow-sm flex items-center w-fit gap-3"
                    >
                  <span className="text-sm font-semibold text-[#173C7A] ml-2">Worksheets:</span>
                  <div className="flex items-center gap-2 relative z-10">
                    {tasks.map((task) => {
                      const isCompleted = taskProgress > task.id;
                      const isCurrent = taskProgress === task.id;
                      return (
                        <React.Fragment key={task.id}>
                          <div className="relative group flex items-center justify-center cursor-pointer">
                            <button
                              onClick={() => setActiveTaskModal(task.id)}
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-medium transition-all duration-300 shadow-sm z-10 ${
                                isCompleted
                                  ? 'bg-[#306FB8] text-white border-2 border-[#306FB8]'
                                  : isCurrent
                                  ? 'bg-white text-[#306FB8] border-2 border-[#306FB8] ring-4 ring-[#306FB8]/20'
                                  : 'bg-white text-gray-400 border-2 border-gray-200 hover:border-[#306FB8]/50'
                              }`}
                            >
                              {isCompleted ? <Check size={16} strokeWidth={3} /> : task.id}
                            </button>

                            {/* Hover Tooltip */}
                            <div className="absolute bottom-11 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-max bg-[#173C7A] text-white text-xs px-3 py-2 rounded-lg shadow-xl z-50 text-center">
                              <p className="font-semibold">{task.title}</p>
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#173C7A] rotate-45"></div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="bg-gradient-to-br from-white to-[#306FB8]/[0.03] rounded-2xl border border-[#173C7A]/10 flex-1 min-h-0 shadow-sm relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#306FB8] to-[#173C7A] opacity-80"></div>
                  <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-[#173C7A]/5">
                    <h3 className="text-lg font-semibold text-[#173C7A] flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        {(isAsking || typedText.length < fullText.length) && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#306FB8] opacity-75"></span>
                        )}
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#306FB8]"></span>
                      </span>
                      Archer AI Response
                    </h3>
                    <button
                      onClick={() => setIsWorkspaceVisible(!isWorkspaceVisible)}
                      className="p-2 text-[#173C7A]/60 hover:text-[#173C7A] hover:bg-[#306FB8]/10 rounded-lg transition-colors flex items-center gap-2"
                      title={isWorkspaceVisible ? "Hide Workspace" : "Show Workspace"}
                    >
                      {isWorkspaceVisible ? (
                        <><Maximize2 size={18} /><span className="text-sm font-medium">Focus Chat</span></>
                      ) : (
                        <><Minimize2 size={18} /><span className="text-sm font-medium">Show Files</span></>
                      )}
                    </button>
                  </div>
                  {askError && (
                    <div className="mx-8 mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {askError}
                    </div>
                  )}
                  <div className="flex-1 overflow-y-auto px-8 py-6 archer-scroll">
                    {typedText || isAsking ? (
                      typedText ? (
                        <>
                          <FormattedAnswer
                            text={typedText}
                            isTyping={isAsking || typedText.length < fullText.length}
                          />
                          {responseSources.length > 0 &&
                            !isAsking &&
                            typedText.length >= fullText.length && (
                              <div className="mt-8 pt-6 border-t border-[#173C7A]/10">
                                <div className="flex items-center gap-2 mb-4">
                                  <BookOpen size={18} className="text-[#306FB8]" />
                                  <h4 className="text-sm font-semibold text-[#173C7A]">
                                    Sources ({responseSources.length})
                                  </h4>
                                </div>
                                <ul className="space-y-3">
                                  {responseSources.map((source) => (
                                    <li
                                      key={source.source}
                                      className="bg-white border border-[#173C7A]/10 rounded-xl p-4 shadow-sm"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-medium text-[#173C7A] leading-snug">
                                          {source.file}
                                        </p>
                                        <span className="shrink-0 text-[11px] font-mono text-[#306FB8] bg-[#306FB8]/10 px-2 py-0.5 rounded-md">
                                          {(source.similarity * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                      {source.refs.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                          {source.refs.map((ref) => (
                                            <span
                                              key={ref}
                                              className="text-[10px] font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded"
                                            >
                                              {ref}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-3">
                                        {source.preview}
                                      </p>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500 text-[15px]">
                          <Loader2 className="animate-spin" size={16} />
                          <span>Thinking…</span>
                        </div>
                      )
                    ) : null}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEARCH BAR */}
        <div 
          className="absolute z-40 px-6 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-full"
          style={{
            left: "50%",
            top: isSearching ? (isShelfOpen ? "calc(100% - 250px)" : "calc(100% - 150px)") : "50%",
            transform: "translate(-50%, -50%)",
            maxWidth: isSearching ? "52rem" : "42rem"
          }}
        >
          <div className={`relative w-full transition-transform duration-300 ${!isSearching && "hover:scale-[1.02]"}`}>
            <textarea
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder={isSearching ? "Ask a follow up question..." : "Search for career advice..."}
              className={`block w-full px-6 pr-16 border-2 border-[#173C7A] focus:outline-none focus:border-[#306FB8] focus:shadow-lg focus:shadow-[#306FB8]/20 transition-all duration-500 bg-white shadow-md text-gray-800 resize-none overflow-hidden leading-[24px] ${
                isSearching ? "py-5 rounded-3xl h-[100px]" : "py-[14px] rounded-full h-[56px]"
              }`}
            />
            <button 
              onClick={handleSearch}
              className={`absolute right-2 flex items-center justify-center w-[44px] h-[44px] bg-[#306FB8] hover:bg-[#173C7A] text-white rounded-full transition-all duration-500 hover:scale-110 active:scale-95 ${
                isSearching ? "bottom-3 bg-[#173C7A]" : "top-1/2 -translate-y-1/2"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* SHELF TOGGLE */}
      <button
        onClick={() => setIsShelfOpen(!isShelfOpen)}
        className={`fixed left-1/2 -translate-x-1/2 bg-[#306FB8] hover:bg-[#173C7A] text-white rounded-full px-6 py-3 shadow-lg transition-all duration-500 hover:scale-110 active:scale-95 z-50 ${
          isShelfOpen ? "bottom-[130px]" : "bottom-6"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 ${isShelfOpen ? "rotate-180" : ""}`}
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>

      {/* SHELF CONTENT */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#173C7A] shadow-[0_-10px_40px_-15px_rgba(23,60,122,0.2)] transition-transform duration-500 ease-in-out z-40 ${
          isShelfOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-6xl mx-auto p-8">
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border-2 border-[#306FB8] bg-[#306FB8]/10 cursor-pointer text-center group relative overflow-hidden">
              <p className="text-[#173C7A] font-bold">Pathfinder</p>
            </div>
            <div className="p-4 rounded-lg border-2 border-[#306FB8]/20 hover:border-[#306FB8] hover:bg-[#306FB8]/5 transition-all cursor-pointer text-center group">
              <p className="text-[#173C7A] font-medium group-hover:scale-105 transition-transform">Career Assessment</p>
            </div>
            <div
              onClick={() => { setIsResumeBuilderOpen(true); setIsShelfOpen(false); }}
              className="p-4 rounded-lg border-2 border-[#306FB8]/20 hover:border-[#306FB8] hover:bg-[#306FB8]/5 transition-all cursor-pointer text-center group"
            >
              <p className="text-[#173C7A] font-medium group-hover:scale-105 transition-transform">Resume Builder</p>
            </div>
            <div className="p-4 rounded-lg border-2 border-[#306FB8]/20 hover:border-[#306FB8] hover:bg-[#306FB8]/5 transition-all cursor-pointer text-center group">
              <p className="text-[#173C7A] font-medium group-hover:scale-105 transition-transform">Interview Prep</p>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isResumeBuilderOpen && (
          <ResumeBuilder onClose={() => setIsResumeBuilderOpen(false)} />
        )}
        {viewingFile && (
          <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />
        )}
      </AnimatePresence>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {activeTaskModal !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setActiveTaskModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative z-10 border border-[#173C7A]/10"
            >
              <button
                onClick={() => setActiveTaskModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
              {(() => {
                const task = tasks.find(t => t.id === activeTaskModal);
                return task ? (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-[#306FB8]/10 text-[#306FB8] flex items-center justify-center mb-4">
                      {task.id === 1 ? <FileSearch size={24} /> : task.id === 2 ? <Shield size={24} /> : <CheckCircle2 size={24} />}
                    </div>
                    <h3 className="text-xl font-bold text-[#173C7A] mb-2">{task.title}</h3>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">{task.modalContent}</p>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={() => setActiveTaskModal(null)}
                        className="bg-[#173C7A] hover:bg-[#0f2852] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                      >
                        Got it
                      </button>
                    </div>
                  </>
                ) : null;
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}