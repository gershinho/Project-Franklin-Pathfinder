import { supabase } from "./supabaseClient";

export type AskResponse = {
  answer: string;
  // Optional; depends on your edge function implementation.
  sources?: Array<{
    id?: string;
    path?: string;
    title?: string;
    content?: string;
    score?: number;
  }>;
};

function formatSupabaseFunctionError(error: unknown): string {
  if (!(error && typeof error === "object")) {
    return String(error);
  }

  const anyErr = error as {
    name?: string;
    message?: string;
    context?: { status?: number; statusText?: string; body?: unknown };
  };

  const name = anyErr.name ? `[${anyErr.name}] ` : "";
  const message = anyErr.message ?? "Request failed";
  const status =
    typeof anyErr.context?.status === "number" ? ` (HTTP ${anyErr.context.status})` : "";
  const statusText = anyErr.context?.statusText ? ` ${anyErr.context.statusText}` : "";
  const body =
    anyErr.context?.body !== undefined
      ? `\nResponse body: ${
          typeof anyErr.context.body === "string"
            ? anyErr.context.body
            : JSON.stringify(anyErr.context.body, null, 2)
        }`
      : "";

  return `${name}${message}${status}${statusText}${body}`.trim();
}

export async function ask(query: string): Promise<AskResponse> {
  const { data, error } = await supabase.functions.invoke<AskResponse>("ask", {
    body: { query },
  });

  if (error) throw new Error(formatSupabaseFunctionError(error));
  if (!data?.answer) throw new Error("Edge function returned no answer.");
  return data;
}

