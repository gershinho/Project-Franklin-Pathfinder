import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Image as ImageIcon, Search, Pencil, Eye, Settings, User, LogOut, FileSearch, Shield, UploadCloud, Loader2, CheckCircle2, Check, X, Maximize2, Minimize2, Activity, Tags, BookOpen, PanelLeft, Compass, Map, MessageSquare } from "lucide-react";
import logo from "../imports/image.png";
import { ResumeBuilder } from "./components/ResumeBuilder";
import { FileViewer } from "./components/FileViewer";
import { ask, stripWorksheetFromAnswer, type AskSource, type ClassifiedProcess } from "@/lib/ask";
import { extractAssignmentUrls } from "@/lib/assignmentLinks";
import { FormattedAnswer } from "./components/FormattedAnswer";
import { AssignmentTile } from "./components/AssignmentTile";
import { Roadmap } from "./components/Roadmap";

export default function App() {
  const [currentView, setCurrentView] = useState<"pathfinder" | "roadmap">("pathfinder");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
  const [responseWorksheets, setResponseWorksheets] = useState<string[]>([]);
  const [isResumeBuilderOpen, setIsResumeBuilderOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<{ id: string; name: string; type: string } | null>(null);
  const [isWorkspaceVisible, setIsWorkspaceVisible] = useState(true);
  
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
    setResponseWorksheets([]);

    try {
      const res = await ask(queryToAsk);
      const worksheets = [
        ...new Set([
          ...(res.worksheets ?? []),
          ...extractAssignmentUrls(res.answer),
        ]),
      ];
      setResponseWorksheets(worksheets);
      setResponseText(stripWorksheetFromAnswer(res.answer, worksheets));
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



  return (
    <div 
      className="min-h-screen bg-white relative overflow-hidden font-sans"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(23, 60, 122, 0.056) 1px, transparent 2px)",
        backgroundSize: "36px 36px"
      }}
    >
      {/* Sidebar Toggle */}
      <motion.button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-6 left-6 text-[#173C7A] hover:opacity-70 z-[60]"
        animate={{ x: isSidebarOpen ? "12rem" : "0rem" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <PanelLeft size={24} />
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl border-r border-[#173C7A]/10 z-50 flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="h-[64px] flex items-center pl-5 pr-14 border-b border-[#173C7A]/10">
                <img 
                  src={logo} 
                  alt="Archer" 
                  className="h-7 cursor-pointer hover:opacity-80 transition-opacity" 
                  onClick={() => { setIsSearching(false); setSearchQuery(""); }} 
                />
              </div>

              {/* Sidebar Navigation */}
              <div className="p-3 space-y-1">
                <button 
                  onClick={() => setCurrentView("pathfinder")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    currentView === "pathfinder" 
                      ? "bg-[#306FB8] text-white shadow-sm hover:scale-[1.02]" 
                      : "text-[#173C7A] hover:bg-[#173C7A]/5"
                  }`}
                >
                  <Compass size={16} />
                  Pathfinder
                </button>
                <button 
                  onClick={() => setCurrentView("roadmap")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    currentView === "roadmap" 
                      ? "bg-[#306FB8] text-white shadow-sm hover:scale-[1.02]" 
                      : "text-[#173C7A] hover:bg-[#173C7A]/5"
                  }`}
                >
                  <Map size={16} />
                  Roadmap
                </button>
              </div>

              <div className="mx-3 h-px bg-[#173C7A]/10 my-1.5" />

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Recent Chats</h3>
                  <button 
                    onClick={() => { setIsSearching(false); setSearchQuery(""); }}
                    className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-100 hover:bg-[#306FB8] hover:text-white rounded-md px-1.5 py-0.5 transition-colors flex items-center"
                  >
                    New Chat
                  </button>
                </div>
                <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-gray-600 hover:bg-gray-50 rounded-md transition-colors text-left truncate">
                  <MessageSquare size={14} className="shrink-0" />
                  Software Engineer transition
                </button>
                <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-gray-600 hover:bg-gray-50 rounded-md transition-colors text-left truncate">
                  <MessageSquare size={14} className="shrink-0" />
                  Product Manager roadmap
                </button>
                <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-gray-600 hover:bg-gray-50 rounded-md transition-colors text-left truncate">
                  <MessageSquare size={14} className="shrink-0" />
                  Interview prep strategies
                </button>
                <button className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-gray-600 hover:bg-gray-50 rounded-md transition-colors text-left truncate">
                  <MessageSquare size={14} className="shrink-0" />
                  Resume review feedback
                </button>
              </div>

              {/* Profile Section */}
              <div className="p-3 border-t border-[#173C7A]/10 relative">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="w-full flex items-center gap-2.5 p-1.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[#173C7A]/10 flex items-center justify-center text-[#173C7A] text-sm font-bold">
                    AM
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#173C7A] truncate leading-tight">Alex Morgan</p>
                    <p className="text-[11px] text-gray-500 truncate leading-tight">alex@example.com</p>
                  </div>
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-[60]" 
                        onClick={() => setIsProfileMenuOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-lg shadow-xl border border-[#173C7A]/10 overflow-hidden z-[70]"
                      >
                        <div className="px-3 py-2 border-b border-[#173C7A]/10 bg-gray-50/50">
                          <p className="text-[13px] font-medium text-[#173C7A] leading-tight">Alex Morgan</p>
                          <p className="text-[11px] text-gray-500 leading-tight">alex@example.com</p>
                        </div>
                        <div className="py-1.5">
                          <button className="w-full px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-[#306FB8] flex items-center gap-2.5 transition-colors text-left">
                            <User size={14} />
                            Your Profile
                          </button>
                          <button className="w-full px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-[#306FB8] flex items-center gap-2.5 transition-colors text-left">
                            <FileSearch size={14} />
                            Career History
                          </button>
                          <button className="w-full px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-[#306FB8] flex items-center gap-2.5 transition-colors text-left">
                            <Settings size={14} />
                            Account Settings
                          </button>
                          <button className="w-full px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-[#306FB8] flex items-center gap-2.5 transition-colors text-left">
                            <Shield size={14} />
                            Privacy & Data
                          </button>
                        </div>
                        <div className="border-t border-[#173C7A]/10 py-1.5">
                          <button className="w-full px-3 py-1.5 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
                            <LogOut size={14} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Top Right Navigation */}
      <div className="fixed top-6 right-6 flex items-center gap-4 z-50 pointer-events-none">
        {/* Supabase ask() call counter */}
        <div
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#173C7A]/15 text-[#173C7A] rounded-full pl-3 pr-1.5 py-1 shadow-sm pointer-events-auto"
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
      </div>

      {/* Main Content Area */}
      <motion.div 
        className="absolute inset-y-0 right-0 flex flex-col items-center"
        animate={{ left: isSidebarOpen ? "16rem" : "0rem" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {currentView === "pathfinder" ? (
          <>
            {/* LOGO */}
            <div 
              className="absolute z-50 transition-all duration-500 ease-in-out flex items-center gap-4"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -120px)",
                opacity: isSearching ? 0 : 1,
                pointerEvents: isSearching ? "none" : "auto",
                transformOrigin: "center"
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
                    bottom: "220px",
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




                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Generative response text */}
                  <motion.div 
                    layout
                    className="flex flex-col w-full min-h-0"
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
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
                              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                                <div className="min-w-0 flex-1">
                                  <FormattedAnswer
                                    text={typedText}
                                    isTyping={isAsking || typedText.length < fullText.length}
                                  />
                                </div>
                                {responseWorksheets.length > 0 &&
                                  !isAsking &&
                                  typedText.length >= fullText.length && (
                                    <aside className="shrink-0 sm:pt-1">
                                      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-[#306FB8]/70">
                                        Your next step
                                      </p>
                                      <div className="flex flex-wrap gap-3 sm:flex-col">
                                        {responseWorksheets.map((url, i) => (
                                          <AssignmentTile key={url} url={url} index={i} />
                                        ))}
                                      </div>
                                    </aside>
                                  )}
                              </div>
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
                top: isSearching ? "calc(100% - 150px)" : "50%",
                transform: "translate(-50%, -50%)",
                maxWidth: isSearching ? "52rem" : "42rem"
              }}
            >
              <div className={`relative w-full transition-transform duration-300 ${!isSearching && "hover:scale-[1.02]"}`}>
                <textarea
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.metaKey) {
                      e.preventDefault();
                      handleSearch();
                    } else if (e.key === "Enter" && e.metaKey) {
                      e.preventDefault();
                      const target = e.target as HTMLTextAreaElement;
                      const start = target.selectionStart;
                      const end = target.selectionEnd;
                      const newValue = searchQuery.substring(0, start) + "\n" + searchQuery.substring(end);
                      setSearchQuery(newValue);
                      setTimeout(() => {
                        target.selectionStart = target.selectionEnd = start + 1;
                      }, 0);
                    }
                  }}
                  placeholder={isSearching ? "Ask a follow up question..." : "Search for career advice..."}
                  className={`block w-full px-6 pr-16 border-2 border-[#173C7A] focus:outline-none focus:border-[#306FB8] focus:shadow-lg focus:shadow-[#306FB8]/20 bg-white shadow-md text-gray-800 resize-none overflow-hidden leading-[24px] ${
                    (isSearching || searchQuery.includes('\n') || searchQuery.length > 50) ? "py-5 rounded-3xl h-[100px]" : "py-[14px] rounded-full h-[56px]"
                  }`}
                />
                <button 
                  onClick={handleSearch}
                  className={`absolute right-2 flex items-center justify-center w-[44px] h-[44px] bg-[#306FB8] hover:bg-[#173C7A] text-white rounded-full transition-transform hover:scale-110 active:scale-95 ${
                    (isSearching || searchQuery.includes('\n') || searchQuery.length > 50) ? "bottom-3 bg-[#173C7A]" : "top-1/2 -translate-y-1/2"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <Roadmap />
        )}
      </motion.div>


      <AnimatePresence>
        {isResumeBuilderOpen && (
          <ResumeBuilder onClose={() => setIsResumeBuilderOpen(false)} />
        )}
        {viewingFile && (
          <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />
        )}
      </AnimatePresence>


    </div>
  );
}