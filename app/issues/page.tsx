"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import Link from "next/link";

const IssuesMap = dynamic(() => import("@/components/IssuesMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center rounded bg-gray-100">
      Loading map...
    </div>
  ),
});

type Issue = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  status: string;
  createdAt: string;
  createdBy: { name: string };
  upvotes: { id: string; userId: string }[];
};

const categoryLabels: Record<string, string> = {
  POTHOLE: "Pothole",
  STREETLIGHT: "Street Light",
  GARBAGE: "Garbage",
  WATERLOGGING: "Water Logging",
  OTHER: "Other",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_REVIEW: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
};

export default function IssuesPage() {
  const { data: session } = useSession();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [upvotingIds, setUpvotingIds] = useState<Set<string>>(new Set());

  const fetchIssues = () => {
    fetch("/api/issues")
      .then((res) => res.json())
      .then((data) => {
        setIssues(data.issues || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleUpvote = async (issueId: string) => {
    if (!session?.user) {
      alert("Please log in to upvote");
      return;
    }

    if (upvotingIds.has(issueId)) return;

    setUpvotingIds((prev) => new Set(prev).add(issueId));

    try {
      const res = await fetch(`/api/issues/${issueId}/upvote`, {
        method: "POST",
      });

      if (res.ok) {
        fetchIssues();
      }
    } finally {
      setUpvotingIds((prev) => {
        const next = new Set(prev);
        next.delete(issueId);
        return next;
      });
    }
  };

  const filteredIssues = issues
    .filter((issue) =>
      categoryFilter === "ALL" ? true : issue.category === categoryFilter,
    )
    .filter((issue) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        issue.title.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query)
      );
    });

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Reported Issues</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 rounded border border-gray-300 p-2"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded border border-gray-300 p-2"
        >
          <option value="ALL">All Categories</option>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-8">
        <IssuesMap issues={filteredIssues} />
      </div>

      {loading ? (
        <p className="text-gray-500">Loading issues...</p>
      ) : filteredIssues.length === 0 ? (
        <p className="text-gray-500">No issues found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIssues.map((issue) => {
            const hasUpvoted = issue.upvotes.some(
              (u) => u.userId === session?.user?.id,
            );
            const isUpvoting = upvotingIds.has(issue.id);

            return (
              <div key={issue.id} className="rounded-lg bg-white p-4 shadow-sm">
                {issue.imageUrl && (
                  <img
                    src={issue.imageUrl}
                    alt={issue.title}
                    className="mb-3 h-40 w-full rounded object-cover"
                  />
                )}
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                    {categoryLabels[issue.category]}
                  </span>
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${statusColors[issue.status]}`}
                  >
                    {issue.status.replace("_", " ")}
                  </span>
                </div>

                <Link href={`/issues/${issue.id}`}>
                  <h3 className="mb-1 font-semibold text-gray-800 hover:text-blue-600 hover:underline">
                    {issue.title}
                  </h3>
                </Link>

                <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                  {issue.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>By {issue.createdBy.name}</span>
                  <button
                    onClick={() => handleUpvote(issue.id)}
                    disabled={isUpvoting}
                    className={`flex items-center gap-1 rounded px-2 py-1 font-medium transition disabled:opacity-50 ${
                      hasUpvoted
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    👍 {issue.upvotes.length}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
