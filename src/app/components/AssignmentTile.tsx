import { ExternalLink, FileSpreadsheet, FileText, FormInput, Presentation } from "lucide-react";
import { getAssignmentTitle, isAssignmentUrl } from "@/lib/assignmentLinks";

function AssignmentIcon({ url, size = 24 }: { url: string; size?: number }) {
  try {
    const path = new URL(url).pathname;
    if (path.includes("/spreadsheets/")) return <FileSpreadsheet size={size} />;
    if (path.includes("/presentation/")) return <Presentation size={size} />;
    if (path.includes("/forms/")) return <FormInput size={size} />;
  } catch {
    // fall through
  }
  return <FileText size={size} />;
}

type Props = {
  url: string;
  title?: string;
  index?: number;
  variant?: "tile" | "inline";
};

export function AssignmentTile({
  url,
  title,
  index = 0,
  variant = "tile",
}: Props) {
  if (!isAssignmentUrl(url)) return null;

  const label =
    title && title.length < 48 && !title.startsWith("http")
      ? title
      : getAssignmentTitle(url, index);

  if (variant === "inline") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2.5 rounded-xl border border-[#306FB8]/20 bg-gradient-to-br from-white to-[#306FB8]/6 px-3 py-2.5 my-1 shadow-sm transition-all hover:border-[#306FB8]/40 hover:shadow-md hover:-translate-y-px align-middle"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#306FB8]/10 text-[#306FB8] group-hover:bg-[#306FB8]/15">
          <AssignmentIcon url={url} size={18} />
        </span>
        <span className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-[#173C7A] leading-tight">
            {label}
          </span>
          <span className="text-[10px] text-[#306FB8]/70">Open in Google Drive</span>
        </span>
        <ExternalLink
          size={14}
          className="shrink-0 text-[#306FB8]/50 group-hover:text-[#306FB8]"
        />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open ${label}`}
      className="group flex h-28 w-28 flex-col items-center justify-center rounded-xl border border-[#306FB8]/20 bg-gradient-to-br from-white via-white to-[#306FB8]/8 p-3 shadow-sm transition-all hover:border-[#306FB8]/45 hover:shadow-md hover:-translate-y-0.5"
    >
      <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-[#306FB8]/10 text-[#306FB8] transition-colors group-hover:bg-[#306FB8]/15">
        <AssignmentIcon url={url} />
      </span>
      <span className="line-clamp-2 text-center text-[11px] font-semibold leading-tight text-[#173C7A]">
        {label}
      </span>
      <ExternalLink
        size={11}
        className="mt-1.5 text-[#306FB8]/40 opacity-0 transition-opacity group-hover:opacity-100"
      />
    </a>
  );
}
