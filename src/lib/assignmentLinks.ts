const DRIVE_HOSTS = /^(?:docs|drive)\.google\.com$/i;

export function isAssignmentUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return DRIVE_HOSTS.test(parsed.hostname);
  } catch {
    return false;
  }
}

export function getAssignmentTitle(url: string, index = 0): string {
  try {
    const path = new URL(url).pathname;
    if (path.includes("/document/")) return "Document";
    if (path.includes("/spreadsheets/")) return "Spreadsheet";
    if (path.includes("/presentation/")) return "Slides";
    if (path.includes("/forms/")) return "Form";
    if (path.includes("/file/")) return "Assignment";
  } catch {
    // fall through
  }
  return index > 0 ? `Assignment ${index + 1}` : "Assignment";
}

export function extractAssignmentUrls(text: string): string[] {
  const pattern =
    /https?:\/\/(?:docs\.google\.com|drive\.google\.com)[^\s)>\]"']+/gi;
  const matches = text.match(pattern) ?? [];
  return [...new Set(matches.map((url) => url.replace(/[.,;:!?]+$/, "")))];
}
