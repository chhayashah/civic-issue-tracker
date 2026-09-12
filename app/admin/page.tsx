"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Issue = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  createdBy: { name: string };
  upvotes: { id: string }[];
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_REVIEW: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    // Auth check: sirf ADMIN hi is page ko access kar sake
    if (status === "loading") return;

    if (!session?.user || session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchIssues();
  }, [session, status]);

  const fetchIssues = () => {
    fetch("/api/issues")
      .then((res) => res.json())
      .then((data) => {
        setIssues(data.issues || []);
        setLoading(false);
      });
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    setUpdatingId(issueId);

    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchIssues();
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (status === "loading" || loading) {
    return <p className="p-6 text-gray-500">Loading...</p>;
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    return null; // redirect already ho raha hoga useEffect mein
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Admin Panel</h1>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Reported By</th>
              <th className="p-3">Upvotes</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.id} className="border-b last:border-none">
                <td className="p-3 font-medium text-gray-800">{issue.title}</td>
                <td className="p-3 text-gray-600">{issue.category}</td>
                <td className="p-3 text-gray-600">{issue.createdBy.name}</td>
                <td className="p-3 text-gray-600">{issue.upvotes.length}</td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${statusColors[issue.status]}`}
                  >
                    {issue.status.replace("_", " ")}
                  </span>
                </td>
                <td className="p-3">
                  <select
                    value={issue.status}
                    onChange={(e) =>
                      handleStatusChange(issue.id, e.target.value)
                    }
                    disabled={updatingId === issue.id}
                    className="rounded border border-gray-300 p-1 text-sm disabled:opacity-50"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
