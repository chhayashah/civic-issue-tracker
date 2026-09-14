"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const IssuesMap = dynamic(() => import("@/components/IssuesMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl bg-slate-100 dark:bg-gray-800">
      <span className="text-sm text-slate-400">Loading map…</span>
    </div>
  ),
});

type Issue = {
  id: string;
  title: string;
  category: string;
  latitude: number;
  longitude: number;
  status: string;
};

export default function HomeHero({
  stats,
  recentIssues,
}: {
  stats: { total: number; resolved: number; pending: number };
  recentIssues: Issue[];
}) {
  return (
    <div className="bg-[#FAFAF8] dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pt-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#2454A6]/20 bg-[#2454A6]/5 px-3 py-1 text-sm font-medium text-[#2454A6] dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2454A6] dark:bg-blue-400" />
              Live in your city
            </div>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-[#14181F] dark:text-white sm:text-5xl">
              The pothole on your street won't fix itself.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-[#5B6472] dark:text-gray-400">
              Pin the exact spot, snap a photo, and follow it until your
              municipal admin marks it resolved.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/report"
                className="rounded-lg bg-[#FF6B4A] px-6 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-[#f0593a]"
              >
                Report an issue
              </Link>
              <Link
                href="/issues"
                className="rounded-lg border border-slate-300 px-6 py-3 text-center font-semibold text-[#14181F] transition hover:bg-slate-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
              >
                Browse the map
              </Link>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-gray-700">
              <IssuesMap issues={recentIssues} />
            </div>
          </div>
        </div>
      </div>

      <div className="border-y border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-slate-200 px-6 dark:divide-gray-700">
          <div className="px-4 py-8 text-center sm:text-left">
            <div className="text-3xl font-bold tabular-nums text-[#14181F] dark:text-white sm:text-4xl">
              {stats.total}
            </div>
            <div className="mt-1 text-sm text-[#5B6472] dark:text-gray-400">
              Issues reported
            </div>
          </div>
          <div className="px-4 py-8 text-center sm:text-left">
            <div className="text-3xl font-bold tabular-nums text-[#FF6B4A] sm:text-4xl">
              {stats.pending}
            </div>
            <div className="mt-1 text-sm text-[#5B6472] dark:text-gray-400">
              Being worked on
            </div>
          </div>
          <div className="px-4 py-8 text-center sm:text-left">
            <div className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 sm:text-4xl">
              {stats.resolved}
            </div>
            <div className="mt-1 text-sm text-[#5B6472] dark:text-gray-400">
              Resolved
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-10 text-2xl font-bold text-[#14181F] dark:text-white">
          How it works
        </h2>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#2454A6]/10 text-lg dark:bg-blue-400/10">
              📍
            </div>
            <h3 className="mb-2 font-semibold text-[#14181F] dark:text-white">
              Drop a pin
            </h3>
            <p className="text-sm leading-relaxed text-[#5B6472] dark:text-gray-400">
              Click the exact location on the map and attach a photo so it's
              unmistakable where the problem is.
            </p>
          </div>
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#2454A6]/10 text-lg dark:bg-blue-400/10">
              👍
            </div>
            <h3 className="mb-2 font-semibold text-[#14181F] dark:text-white">
              Neighbors upvote
            </h3>
            <p className="text-sm leading-relaxed text-[#5B6472] dark:text-gray-400">
              The more people who've hit the same pothole, the higher it rises
              in priority.
            </p>
          </div>
          <div>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#2454A6]/10 text-lg dark:bg-blue-400/10">
              ✅
            </div>
            <h3 className="mb-2 font-semibold text-[#14181F] dark:text-white">
              Watch it close out
            </h3>
            <p className="text-sm leading-relaxed text-[#5B6472] dark:text-gray-400">
              Get notified the moment an admin moves your issue to In Review or
              Resolved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
