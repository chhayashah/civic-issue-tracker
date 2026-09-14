"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Issue = {
  id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
  upvotes: { id: string }[];
};

const statusColors: Record<string, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  IN_REVIEW: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  RESOLVED:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

export default function PublicProfilePage() {
  const params = useParams();
  const [data, setData] = useState<{
    user: { name: string; createdAt: string };
    stats: {
      totalIssues: number;
      resolvedCount: number;
      totalUpvotesReceived: number;
    };
    issues: Issue[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${params.id}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="p-6 text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="p-6 text-gray-500 dark:text-gray-400">User not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h1 className="mb-1 text-2xl font-bold text-gray-800 dark:text-white">
            {data.user.name}
          </h1>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Member since {new Date(data.user.createdAt).toLocaleDateString()}
          </p>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                {data.stats.totalIssues}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Issues Reported
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {data.stats.resolvedCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Resolved
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {data.stats.totalUpvotesReceived}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Upvotes Received
              </div>
            </div>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
          Reported Issues
        </h2>

        {data.issues.length === 0 ? (
          <p className="text-sm text-gray-400">No issues reported yet.</p>
        ) : (
          <div className="space-y-3">
            {data.issues.map((issue) => (
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    {issue.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {new Date(issue.createdAt).toLocaleDateString()} · 👍{" "}
                    {issue.upvotes.length}
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${statusColors[issue.status]}`}
                >
                  {issue.status.replace("_", " ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
