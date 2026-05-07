import { motion } from "motion/react";
import { X, Download, FileText, Image as ImageIcon } from "lucide-react";

interface Props {
  file: { id: string; name: string; type: string };
  onClose: () => void;
}

export function FileViewer({ file, onClose }: Props) {
  const handleDownload = () => {
    const text = file.type === "document" 
      ? "Interview Preparation Guide\n\n1. Tell me about yourself.\n2. Describe a challenging project.\n\nGood luck!" 
      : "Simulated Image Content";
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[70] bg-[#173C7A]/20 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[#173C7A]/10 relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-16 border-b border-[#173C7A]/10 flex items-center justify-between px-6 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-[#306FB8]/10 p-2 rounded-lg text-[#306FB8]">
              {file.type === "image" ? <ImageIcon size={20} /> : <FileText size={20} />}
            </div>
            <h2 className="text-[#173C7A] font-semibold">{file.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-[#306FB8] hover:bg-[#173C7A] text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 text-[#173C7A] transition-colors ml-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-10 bg-gray-100/30">
          {file.type === "document" ? (
            <div className="max-w-2xl mx-auto bg-white p-12 shadow-sm rounded-lg border border-gray-100">
              <h1 className="text-2xl font-bold text-[#173C7A] mb-6">Interview Preparation Guide</h1>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Common Questions</h3>
              <ul className="list-disc pl-5 space-y-4 text-gray-600 mb-8">
                <li>
                  <strong className="text-gray-800">Tell me about yourself.</strong>
                  <p className="mt-1 text-sm">Focus on your recent experience and align it with the role.</p>
                </li>
                <li>
                  <strong className="text-gray-800">Describe a challenging project.</strong>
                  <p className="mt-1 text-sm">Use the STAR method (Situation, Task, Action, Result) to frame your answer.</p>
                </li>
              </ul>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Company Research Notes</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                The company recently launched their new AI product line. Emphasize your experience with scaling systems and collaborating with cross-functional teams.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto bg-white p-4 shadow-sm rounded-lg border border-gray-100 flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-400">
                <ImageIcon size={64} className="mx-auto mb-4 opacity-50" />
                <p>Career Roadmap Visualization Preview</p>
                <div className="mt-8 flex gap-4 opacity-50 pointer-events-none justify-center">
                  <div className="w-32 h-20 bg-[#306FB8]/20 rounded-lg"></div>
                  <div className="w-32 h-20 bg-[#306FB8]/20 rounded-lg"></div>
                  <div className="w-32 h-20 bg-[#306FB8]/20 rounded-lg"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}