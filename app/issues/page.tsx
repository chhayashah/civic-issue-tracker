"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const IssuesMap = dynamic(() => import("@/components/IssuesMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center rounded bg-gray-100">
      Map load ho raha hai...
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
  upvotes: { id: string }[];
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
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/issues")
      .then((res) => res.json())
      .then((data) => {
        setIssues(data.issues || []);
        setLoading(false);
      });
  }, []);

  const filteredIssues =
    categoryFilter === "ALL"
      ? issues
      : issues.filter((issue) => issue.category === categoryFilter);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Reported Issues</h1>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded border border-gray-300 p-2"
        >
          <option value="ALL">Sab Categories</option>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Map view */}
      <div className="mb-8">
        <IssuesMap issues={filteredIssues} />
      </div>

      {/* List view */}
      {loading ? (
        <p className="text-gray-500">Loading issues...</p>
      ) : filteredIssues.length === 0 ? (
        <p className="text-gray-500">Koi issue nahi mila.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIssues.map((issue) => (
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
              <h3 className="mb-1 font-semibold text-gray-800">
                {issue.title}
              </h3>
              <p className="mb-2 text-sm text-gray-600 line-clamp-2">
                {issue.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>By {issue.createdBy.name}</span>
                <span>👍 {issue.upvotes.length}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
