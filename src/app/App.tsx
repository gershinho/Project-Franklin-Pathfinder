import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Image as ImageIcon, Search, Pencil, Eye, Settings, User, LogOut, FileSearch, Shield, UploadCloud, Loader2, CheckCircle2, Check, X, Maximize2, Minimize2, Activity, Tags, BookOpen, PanelLeft, Compass, Map, MessageSquare } from "lucide-react";
import logo from "../imports/image.png";
import { ResumeBuilder } from "./components/ResumeBuilder";
import { FileViewer } from "./components/FileViewer";
import { ask, type AskSource, type ClassifiedProcess } from "@/lib/ask";
import { extractAssignmentUrls } from "@/lib/assignmentLinks";
import { FormattedAnswer } from "./components/FormattedAnswer";
import { Roadmap } from "./components/Roadmap";
import { LandingPage } from "./components/LandingPage";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<"pathfinder" | "roadmap">("pathfinder");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typedText, setTypedText] = useState("");
  const [responseText, setResponseText] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState("");
  const [responseSources, setResponseSources] = useState<AskSource[]>([]);
  const [responseClassified, setResponseClassified] = useState<ClassifiedProcess[]>([]);
  const [responseFrameworkRefs, setResponseFrameworkRefs] = useState<string[]>([]);
  const [responseWasFiltered, setResponseWasFiltered] = useState<boolean | null>(null);
  const [responseWorksheets, setResponseWorksheets] = useState<string[]>([]);
  const [isResumeBuilderOpen, setIsResumeBuilderOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<{ id: string; name: string; type: string } | null>(null);
  
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



  if (!isAuthenticated) {
    return <LandingPage onLogin={() => setIsAuthenticated(true)} />;
  }

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
        initial={false}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-6 left-6 text-[#173C7A] hover:opacity-70 z-[60]"
        animate={{ x: isSidebarOpen ? "12rem" : "0rem" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <PanelLeft size={24} />
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence initial={false}>
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

              <div className="px-3 pt-1">
                <button 
                  onClick={() => { setIsSearching(false); setSearchQuery(""); setCurrentView("pathfinder"); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <MessageSquare size={16} />
                  New Chat
                </button>
              </div>

              {/* Flex Spacer */}
              <div className="flex-1" />

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
                            <Settings size={14} />
                            Account Settings
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



      {/* Main Content Area */}
      <motion.div 
        className="absolute inset-y-0 right-0 flex flex-col items-center"
        initial={false}
        animate={{ left: isSidebarOpen ? "16rem" : "0rem" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {currentView === "pathfinder" ? (
          <>
            {/* LOGO */}
            <motion.div 
              className="absolute z-50 flex items-center gap-4"
              initial={false}
              animate={{
                left: "50%",
                top: "50%",
                x: "-50%",
                y: "-120px",
                opacity: isSearching ? 0 : 1
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
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
            </motion.div>

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
                    gap: "0rem",
                    bottom: "220px",
                  }}
                >
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
                              </div>
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
            <motion.div 
              className="absolute z-40 px-6 w-full"
              initial={false}
              animate={{
                left: "50%",
                top: isSearching ? "calc(100% - 150px)" : "50%",
                x: "-50%",
                y: "-50%",
                maxWidth: isSearching ? "52rem" : "42rem"
              }}
              transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
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
                  placeholder={isSearching ? "Ask a new question..." : "Search for career advice..."}
                  className={`block w-full px-6 pr-16 border-2 border-[#173C7A] focus:outline-none bg-white shadow-md text-gray-800 resize-none overflow-hidden leading-[24px] ${
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
            </motion.div>
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