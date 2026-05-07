import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Download, Send, Sparkles, Plus } from "lucide-react";
import logo from "../../imports/image.png";

interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: { role: string; company: string; period: string; bullets: string[] }[];
  education: { degree: string; school: string; period: string }[];
  skills: string[];
}

interface Message {
  role: "user" | "ai";
  text: string;
}

const initialResume: ResumeData = {
  name: "Alex Morgan",
  title: "Product Designer",
  email: "alex@example.com",
  phone: "(555) 123-4567",
  location: "San Francisco, CA",
  summary:
    "Product designer with 5+ years of experience crafting intuitive interfaces for SaaS products. Passionate about translating complex problems into elegant user experiences.",
  experience: [
    {
      role: "Senior Product Designer",
      company: "Northwind Labs",
      period: "2022 — Present",
      bullets: [
        "Led redesign of core dashboard, increasing engagement by 34%.",
        "Established design system used across 6 product teams.",
      ],
    },
    {
      role: "Product Designer",
      company: "Brightline",
      period: "2019 — 2022",
      bullets: [
        "Shipped onboarding flow that reduced churn by 18%.",
        "Partnered with research to define personas and journeys.",
      ],
    },
  ],
  education: [
    { degree: "B.A. in Design", school: "UC Berkeley", period: "2015 — 2019" },
  ],
  skills: ["Figma", "Prototyping", "User Research", "Design Systems", "React"],
};

interface Props {
  onClose: () => void;
}

export function ResumeBuilder({ onClose }: Props) {
  const [resume, setResume] = useState<ResumeData>(initialResume);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "I've drafted your resume. Click any section to edit it directly, or describe changes you'd like me to make.",
    },
  ]);
  const [prompt, setPrompt] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  const sendPrompt = () => {
    if (!prompt.trim()) return;
    const userMsg = prompt.trim();
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setPrompt("");

    setTimeout(() => {
      let aiResponse = "Updated your resume based on that.";
      const lower = userMsg.toLowerCase();
      if (lower.includes("summary")) {
        setResume((r) => ({
          ...r,
          summary:
            "Award-winning product designer with a track record of leading 0-to-1 launches and scaling design systems across high-growth SaaS organizations.",
        }));
        aiResponse = "Punched up the summary with stronger impact language.";
      } else if (lower.includes("skill")) {
        setResume((r) => ({
          ...r,
          skills: [...r.skills, "Motion Design", "Accessibility"],
        }));
        aiResponse = "Added Motion Design and Accessibility to your skills.";
      } else if (lower.includes("title") || lower.includes("senior")) {
        setResume((r) => ({ ...r, title: "Senior Product Designer" }));
        aiResponse = "Updated your title to Senior Product Designer.";
      } else {
        setResume((r) => ({
          ...r,
          summary: r.summary + " Open to remote opportunities.",
        }));
      }
      setMessages((m) => [...m, { role: "ai", text: aiResponse }]);
    }, 600);
  };

  const downloadResume = () => {
    const text = `${resume.name}\n${resume.title}\n${resume.email} • ${resume.phone} • ${resume.location}\n\nSUMMARY\n${resume.summary}\n\nEXPERIENCE\n${resume.experience
      .map(
        (e) =>
          `${e.role} — ${e.company} (${e.period})\n${e.bullets.map((b) => `  • ${b}`).join("\n")}`
      )
      .join("\n\n")}\n\nEDUCATION\n${resume.education
      .map((e) => `${e.degree} — ${e.school} (${e.period})`)
      .join("\n")}\n\nSKILLS\n${resume.skills.join(", ")}\n`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resume.name.replace(/\s+/g, "_")}_Resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const EditableText = ({
    value,
    onChange,
    fieldKey,
    multiline = false,
    className = "",
  }: {
    value: string;
    onChange: (v: string) => void;
    fieldKey: string;
    multiline?: boolean;
    className?: string;
  }) => {
    const isEditing = editingField === fieldKey;
    if (isEditing) {
      return multiline ? (
        <textarea
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditingField(null)}
          className={`w-full bg-[#306FB8]/5 border border-[#306FB8] rounded px-2 py-1 outline-none resize-none ${className}`}
          rows={3}
        />
      ) : (
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditingField(null)}
          onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
          className={`bg-[#306FB8]/5 border border-[#306FB8] rounded px-2 py-0.5 outline-none ${className}`}
        />
      );
    }
    return (
      <span
        onClick={() => setEditingField(fieldKey)}
        className={`cursor-pointer hover:bg-[#306FB8]/10 rounded px-1 -mx-1 transition-colors ${className}`}
      >
        {value}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-sm flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Header */}
      <div className="h-14 border-b border-[#173C7A]/10 flex items-center justify-between px-6 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded overflow-hidden relative">
            <img src={logo} alt="Archer Icon" className="h-8 max-w-none absolute top-0 left-0" />
          </div>
          <div>
            <h2 className="text-[#173C7A] font-semibold text-sm">Resume Builder</h2>
            <p className="text-xs text-gray-500">AI-powered resume editor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadResume}
            className="flex items-center gap-2 bg-[#306FB8] hover:bg-[#173C7A] text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <Download size={16} />
            Download
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-[#173C7A] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Left: prompt bar with responses above */}
        <div className="w-[420px] border-r border-[#173C7A]/10 flex flex-col bg-gray-50/40">
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-[#306FB8] text-white rounded-br-sm"
                        : "bg-white border border-[#173C7A]/10 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="p-4 border-t border-[#173C7A]/10 bg-white">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendPrompt();
                  }
                }}
                placeholder="Ask Archer to refine your resume..."
                className="w-full px-4 py-3 pr-12 border-2 border-[#173C7A]/20 focus:border-[#306FB8] focus:outline-none rounded-2xl resize-none text-sm h-[80px] bg-white"
              />
              <button
                onClick={sendPrompt}
                className="absolute bottom-2 right-2 w-9 h-9 bg-[#306FB8] hover:bg-[#173C7A] text-white rounded-full flex items-center justify-center transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {["Make summary stronger", "Add more skills", "Promote to senior"].map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-[#306FB8]/30 text-[#306FB8] hover:bg-[#306FB8]/5 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: resume preview */}
        <div className="flex-1 overflow-y-auto p-10 bg-gray-50/50 relative">
          {/* Dot grid background */}
          <div 
            className="absolute inset-0 z-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: "radial-gradient(#173C7A 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div
            ref={resumeRef}
            className="max-w-[700px] mx-auto bg-white shadow-2xl rounded-lg p-12 min-h-[900px] relative z-10 border border-[#173C7A]/5"
          >
            <div className="border-b-2 border-[#173C7A] pb-5 mb-6">
              <h1 className="text-3xl text-[#173C7A] font-semibold mb-1">
                <EditableText
                  value={resume.name}
                  fieldKey="name"
                  onChange={(v) => setResume({ ...resume, name: v })}
                />
              </h1>
              <p className="text-[#306FB8] mb-3">
                <EditableText
                  value={resume.title}
                  fieldKey="title"
                  onChange={(v) => setResume({ ...resume, title: v })}
                />
              </p>
              <div className="text-sm text-gray-600 flex flex-wrap gap-x-3 gap-y-1">
                <EditableText
                  value={resume.email}
                  fieldKey="email"
                  onChange={(v) => setResume({ ...resume, email: v })}
                />
                <span className="text-gray-300">•</span>
                <EditableText
                  value={resume.phone}
                  fieldKey="phone"
                  onChange={(v) => setResume({ ...resume, phone: v })}
                />
                <span className="text-gray-300">•</span>
                <EditableText
                  value={resume.location}
                  fieldKey="location"
                  onChange={(v) => setResume({ ...resume, location: v })}
                />
              </div>
            </div>

            <section className="mb-6">
              <h2 className="text-xs uppercase tracking-wider text-[#173C7A] font-semibold mb-2">
                Summary
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                <EditableText
                  value={resume.summary}
                  fieldKey="summary"
                  multiline
                  onChange={(v) => setResume({ ...resume, summary: v })}
                />
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xs uppercase tracking-wider text-[#173C7A] font-semibold mb-3">
                Experience
              </h2>
              <div className="space-y-4">
                {resume.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-medium text-gray-900">
                        <EditableText
                          value={exp.role}
                          fieldKey={`exp-role-${i}`}
                          onChange={(v) => {
                            const next = [...resume.experience];
                            next[i] = { ...next[i], role: v };
                            setResume({ ...resume, experience: next });
                          }}
                        />
                      </h3>
                      <span className="text-xs text-gray-500">
                        <EditableText
                          value={exp.period}
                          fieldKey={`exp-period-${i}`}
                          onChange={(v) => {
                            const next = [...resume.experience];
                            next[i] = { ...next[i], period: v };
                            setResume({ ...resume, experience: next });
                          }}
                        />
                      </span>
                    </div>
                    <p className="text-sm text-[#306FB8] mb-2">
                      <EditableText
                        value={exp.company}
                        fieldKey={`exp-company-${i}`}
                        onChange={(v) => {
                          const next = [...resume.experience];
                          next[i] = { ...next[i], company: v };
                          setResume({ ...resume, experience: next });
                        }}
                      />
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      {exp.bullets.map((b, j) => (
                        <li key={j}>
                          <EditableText
                            value={b}
                            fieldKey={`exp-bullet-${i}-${j}`}
                            multiline
                            onChange={(v) => {
                              const next = [...resume.experience];
                              const bullets = [...next[i].bullets];
                              bullets[j] = v;
                              next[i] = { ...next[i], bullets };
                              setResume({ ...resume, experience: next });
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-xs uppercase tracking-wider text-[#173C7A] font-semibold mb-2">
                Education
              </h2>
              {resume.education.map((ed, i) => (
                <div key={i} className="flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      <EditableText
                        value={ed.degree}
                        fieldKey={`ed-degree-${i}`}
                        onChange={(v) => {
                          const next = [...resume.education];
                          next[i] = { ...next[i], degree: v };
                          setResume({ ...resume, education: next });
                        }}
                      />
                    </span>
                    <span className="text-sm text-[#306FB8] ml-2">
                      <EditableText
                        value={ed.school}
                        fieldKey={`ed-school-${i}`}
                        onChange={(v) => {
                          const next = [...resume.education];
                          next[i] = { ...next[i], school: v };
                          setResume({ ...resume, education: next });
                        }}
                      />
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{ed.period}</span>
                </div>
              ))}
            </section>

            <section>
              <h2 className="text-xs uppercase tracking-wider text-[#173C7A] font-semibold mb-2">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((s, i) => (
                  <span
                    key={i}
                    onClick={() => {
                      const next = resume.skills.filter((_, j) => j !== i);
                      setResume({ ...resume, skills: next });
                    }}
                    className="text-xs px-3 py-1 rounded-full bg-[#306FB8]/10 text-[#306FB8] cursor-pointer hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Click to remove"
                  >
                    {s}
                  </span>
                ))}
                <button
                  onClick={() => {
                    const skill = window.prompt("Add a skill");
                    if (skill) setResume({ ...resume, skills: [...resume.skills, skill] });
                  }}
                  className="text-xs px-3 py-1 rounded-full border border-dashed border-[#306FB8]/40 text-[#306FB8] hover:bg-[#306FB8]/5 flex items-center gap-1 transition-colors"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
