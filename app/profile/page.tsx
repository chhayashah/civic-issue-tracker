"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Issue = {
  id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
  upvotes: { id: string }[];
  comments: { id: string }[];
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_REVIEW: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<{
    user: { name: string; email: string; role: string };
    stats: {
      totalIssues: number;
      resolvedCount: number;
      totalUpvotesReceived: number;
    };
    issues: Issue[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/login");
      return;
    }

    fetch("/api/profile")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [session, status]);

  if (status === "loading" || loading) {
    return <p className="p-6 text-gray-500">Loading...</p>;
  }

  if (!data) {
    return <p className="p-6 text-gray-500">Could not load profile.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-gray-800">
          {data.user.name}
        </h1>
        <p className="mb-4 text-sm text-gray-500">{data.user.email}</p>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-800">
              {data.stats.totalIssues}
            </div>
            <div className="text-xs text-gray-500">Issues Reported</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">
              {data.stats.resolvedCount}
            </div>
            <div className="text-xs text-gray-500">Resolved</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {data.stats.totalUpvotesReceived}
            </div>
            <div className="text-xs text-gray-500">Upvotes Received</div>
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-800">
        Your Reported Issues
      </h2>

      {data.issues.length === 0 ? (
        <p className="text-sm text-gray-400">
          You haven't reported any issues yet.{" "}
          <Link href="/report" className="text-blue-600 hover:underline">
            Report one now
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-3">
          {data.issues.map((issue) => (
            <Link
              key={issue.id}
              href={`/issues/${issue.id}`}
              className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm hover:bg-gray-50"
            >
              <div>
                <h3 className="font-medium text-gray-800">{issue.title}</h3>
                <p className="text-xs text-gray-400">
                  {new Date(issue.createdAt).toLocaleDateString()} · 👍{" "}
                  {issue.upvotes.length} · 💬 {issue.comments.length}
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
  );
}
