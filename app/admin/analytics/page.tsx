"use client";

import { useEffect, useState, useCallback } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BarChart2,
  MessageSquare,
  DollarSign,
  Users,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Send,
  TrendingUp,
  Zap,
} from "lucide-react";

interface AnalyticsData {
  period: { days: number; since: string };
  summary: {
    totalSessions: number;
    totalMessages: number;
    userMessages: number;
    avgMessagesPerSession: number;
  };
  tokens: {
    inputTokens: number;
    outputTokens: number;
    estimatedCostUSD: number;
  };
  messagesPerDay: Array<{ date: string; user: number; assistant: number }>;
  topKeywords: Array<{ word: string; count: number }>;
  feedback: { thumbsUp: number; thumbsDown: number; total: number };
  poorResponses: Array<{ messageContent: string; createdAt: string }>;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = false,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className={`mt-1 text-2xl font-semibold ${accent ? "text-accent" : "text-foreground"}`}>
            {value}
          </p>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={`rounded-lg p-2 ${accent ? "bg-accent/10" : "bg-secondary"}`}>
          <Icon className={`h-4 w-4 ${accent ? "text-accent" : "text-muted-foreground"}`} />
        </div>
      </div>
    </div>
  );
}

// Simple bar chart using divs (no chart library needed)
function MiniBarChart({ data }: { data: Array<{ date: string; user: number; assistant: number }> }) {
  const maxVal = Math.max(...data.map((d) => d.user + d.assistant), 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d) => {
        const total = d.user + d.assistant;
        const height = (total / maxVal) * 100;
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1" title={`${d.date}: ${total} messages`}>
            <div className="w-full flex flex-col justify-end" style={{ height: "88px" }}>
              <div
                className="w-full rounded-sm bg-primary/60 transition-all"
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground rotate-45 origin-left whitespace-nowrap">
              {d.date.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [nlQuery, setNlQuery] = useState("");
  const [nlAnswer, setNlAnswer] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/analytics?days=${days}`);
      if (res.status === 403) {
        setError("Access denied. Admin only.");
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      setError("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNlQuery = async () => {
    if (!nlQuery.trim()) return;
    setNlLoading(true);
    setNlAnswer("");
    try {
      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: nlQuery }),
      });
      const json = await res.json();
      setNlAnswer(json.answer ?? json.error ?? "No answer.");
    } catch {
      setNlAnswer("Failed to get answer.");
    } finally {
      setNlLoading(false);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-16 text-center md:px-6">
        <AlertCircle className="mx-auto mb-4 h-8 w-8 text-destructive" />
        <p className="text-foreground">{error}</p>
        <Link href="/admin" className="mt-4 inline-block text-sm text-primary underline">
          Back to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 md:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl tracking-tight text-foreground md:text-3xl">AI Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">LLM usage, conversation insights & cost monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
          >
            <option value={1}>Last 24h</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <Link
            href="/admin"
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Products
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Chat Sessions"
              value={data.summary.totalSessions}
              subtitle={`Last ${data.period.days} days`}
              icon={Users}
            />
            <StatCard
              title="Total Messages"
              value={data.summary.totalMessages}
              subtitle={`${data.summary.avgMessagesPerSession} avg / session`}
              icon={MessageSquare}
            />
            <StatCard
              title="API Cost"
              value={`$${data.tokens.estimatedCostUSD}`}
              subtitle={`${(data.tokens.inputTokens / 1000).toFixed(1)}K in · ${(data.tokens.outputTokens / 1000).toFixed(1)}K out tokens`}
              icon={DollarSign}
              accent={data.tokens.estimatedCostUSD > 1}
            />
            <StatCard
              title="Satisfaction"
              value={data.feedback.total > 0 ? `${Math.round((data.feedback.thumbsUp / data.feedback.total) * 100)}%` : "—"}
              subtitle={`${data.feedback.thumbsUp} 👍  ${data.feedback.thumbsDown} 👎`}
              icon={TrendingUp}
              accent
            />
          </div>

          {/* Charts row */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Messages per day */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Messages per Day</h2>
              </div>
              {data.messagesPerDay.length > 0 ? (
                <MiniBarChart data={data.messagesPerDay} />
              ) : (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              )}
            </div>

            {/* Top Keywords */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Top Customer Keywords</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.topKeywords.slice(0, 15).map((k) => (
                  <span
                    key={k.word}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-foreground"
                  >
                    {k.word}
                    <span className="text-muted-foreground">·{k.count}</span>
                  </span>
                ))}
                {data.topKeywords.length === 0 && (
                  <p className="text-sm text-muted-foreground">No messages yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Token & Cost Detail */}
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Token Usage Breakdown</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Input tokens</p>
                <p className="text-xl font-semibold text-foreground">{data.tokens.inputTokens.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">${((data.tokens.inputTokens / 1_000_000) * 3).toFixed(4)} @ $3/M</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Output tokens</p>
                <p className="text-xl font-semibold text-foreground">{data.tokens.outputTokens.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">${((data.tokens.outputTokens / 1_000_000) * 15).toFixed(4)} @ $15/M</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total estimated cost</p>
                <p className="text-xl font-semibold text-accent">${data.tokens.estimatedCostUSD}</p>
                <p className="text-xs text-muted-foreground">claude-sonnet-4-6 pricing</p>
              </div>
            </div>
          </div>

          {/* Feedback & Poor Responses */}
          {data.poorResponses.length > 0 && (
            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-destructive" />
                <h2 className="text-sm font-semibold text-foreground">Poorly Rated Responses</h2>
                <span className="ml-auto text-xs text-muted-foreground">Use these to improve your system prompt</span>
              </div>
              <div className="space-y-3">
                {data.poorResponses.map((r, i) => (
                  <div key={i} className="rounded-lg border border-border bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</p>
                    <p className="mt-1 text-sm text-foreground line-clamp-3">{r.messageContent}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NL Query */}
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Ask AI About Your Data</h2>
            </div>
            <div className="flex gap-2">
              <input
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNlQuery()}
                placeholder="e.g. What did customers ask about most this week?"
                className="min-w-0 flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
              />
              <button
                onClick={handleNlQuery}
                disabled={nlLoading || !nlQuery.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:shadow-glow disabled:opacity-40"
              >
                {nlLoading ? (
                  <span className="animate-pulse">Thinking...</span>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Ask
                  </>
                )}
              </button>
            </div>
            {nlAnswer && (
              <div className="mt-3 rounded-lg border border-border bg-secondary/50 p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">{nlAnswer}</p>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
