export interface HimemConfig {
  apiKey: string;
  apiUrl: string;
  project: string;
}

export interface HimemStatus {
  plan?: string;
  email?: string;
  himem_version?: string;
  features?: { search?: boolean; threads?: boolean };
}

export interface HimemThread {
  id: string;
  topic: string;
  status: "open" | "resolved";
  opened?: string;
  updated?: string;
  notes?: string[];
  resolved_note?: string;
}

export interface HimemThreadsResult {
  threads?: HimemThread[];
  resolved_count?: number;
  error?: string;
}

export interface HimemLoadContextResult {
  context?: string;
  history?: Array<{ role: string; content?: string }>;
  error?: string;
}

export class HimemClient {
  constructor(private readonly config: HimemConfig) {}

  get project(): string {
    return this.config.project;
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  private url(path: string): string {
    return `${this.config.apiUrl.replace(/\/$/, "")}${path}`;
  }

  async status(): Promise<HimemStatus> {
    const res = await fetch(this.url("/status"), { headers: this.headers() });
    return (await res.json()) as HimemStatus;
  }

  async loadContext(days = 7): Promise<HimemLoadContextResult> {
    const project = encodeURIComponent(this.config.project);
    const res = await fetch(
      this.url(`/context/load?project=${project}&days=${days}`),
      { headers: this.headers() }
    );
    return (await res.json()) as HimemLoadContextResult;
  }

  async getThreads(): Promise<HimemThreadsResult> {
    const project = encodeURIComponent(this.config.project);
    const res = await fetch(this.url(`/threads?project=${project}`), {
      headers: this.headers(),
    });
    return (await res.json()) as HimemThreadsResult;
  }

  async saveSession(
    messages: Array<{ role: string; content: string }>
  ): Promise<{ success?: boolean; error?: string; skipped?: boolean }> {
    const res = await fetch(this.url("/session/save"), {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({
        project: this.config.project,
        messages,
      }),
    });
    return (await res.json()) as {
      success?: boolean;
      error?: string;
      skipped?: boolean;
    };
  }

  formatContextSummary(result: HimemLoadContextResult): string {
    let output = "";

    if (result.context) {
      output += `PROJECT CONTEXT:\n${result.context}\n\n`;
    }

    if (result.history?.length) {
      output += `RECENT HISTORY (${result.history.length} messages):\n`;
      output += result.history
        .slice(-10)
        .map(
          (m) =>
            `${m.role.toUpperCase()}: ${(m.content ?? "").substring(0, 200)}`
        )
        .join("\n");
    }

    if (!output) {
      output = `No context found for project: ${this.config.project}`;
    }

    return output;
  }

  formatThreadsSummary(result: HimemThreadsResult): string {
    if (result.error) {
      return `Error loading threads: ${result.error}`;
    }

    const threads = result.threads ?? [];
    if (!threads.length) {
      return `No threads for project: ${this.config.project}`;
    }

    const open = threads.filter((t) => t.status === "open");
    const resolved = threads.filter((t) => t.status === "resolved").slice(0, 5);

    let output = `THREADS — ${this.config.project}\n`;
    output += `${open.length} open · ${result.resolved_count ?? 0} resolved\n\n`;

    if (open.length) {
      output += "OPEN:\n";
      for (const t of open) {
        output += `• [${t.id}] ${t.topic}\n`;
      }
    }

    if (resolved.length) {
      output += "\nRECENTLY RESOLVED:\n";
      for (const t of resolved) {
        output += `• ~~${t.topic}~~\n`;
      }
    }

    return output;
  }
}
