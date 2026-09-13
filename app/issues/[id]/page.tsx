"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import Link from "next/link";

const IssuesMap = dynamic(() => import("@/components/IssuesMap"), {
  ssr: false,
});

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string };
};

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
  userId: string;
  upvotes: { id: string; userId: string }[];
  comments: Comment[];
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

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchIssue = () => {
    fetch(`/api/issues/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setIssue(data.issue);
        if (data.issue) {
          setEditForm({
            title: data.issue.title,
            description: data.issue.description,
            category: data.issue.category,
          });
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchIssue();
  }, [params.id]);

  const isOwner = issue && session?.user && issue.userId === session.user.id;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      alert("Please log in to comment");
      return;
    }

    if (!commentText.trim()) return;

    setPosting(true);

    try {
      const res = await fetch(`/api/issues/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText }),
      });

      if (res.ok) {
        setCommentText("");
        fetchIssue();
      }
    } finally {
      setPosting(false);
    }
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/issues/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setIsEditing(false);
        fetchIssue();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this issue? This cannot be undone.",
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/issues/${params.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/issues");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-gray-500">Loading...</p>;
  }

  if (!issue) {
    return <p className="p-6 text-gray-500">Issue not found.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link
        href="/issues"
        className="mb-4 inline-block text-sm text-blue-600 hover:underline"
      >
        ← Back to all issues
      </Link>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        {issue.imageUrl && (
          <img
            src={issue.imageUrl}
            alt={issue.title}
            className="mb-4 h-64 w-full rounded object-cover"
          />
        )}

        <div className="mb-3 flex items-center justify-between">
          <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
            {categoryLabels[issue.category]}
          </span>
          <span
            className={`rounded px-2 py-1 text-xs font-medium ${statusColors[issue.status]}`}
          >
            {issue.status.replace("_", " ")}
          </span>
        </div>

        {isEditing ? (
          <div className="mb-4 space-y-3">
            <input
              type="text"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              className="w-full rounded border border-gray-300 p-2 text-lg font-bold"
            />
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              rows={3}
              className="w-full rounded border border-gray-300 p-2"
            />
            <select
              value={editForm.category}
              onChange={(e) =>
                setEditForm({ ...editForm, category: e.target.value })
              }
              className="w-full rounded border border-gray-300 p-2"
            >
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="mb-2 text-2xl font-bold text-gray-800">
              {issue.title}
            </h1>
            <p className="mb-4 text-gray-600">{issue.description}</p>
          </>
        )}

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Reported by {issue.createdBy.name} · 👍 {issue.upvotes.length}{" "}
            upvotes
          </p>

          {isOwner && !isEditing && (
            <div className="flex gap-3 text-sm">
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-600 hover:underline disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>

        <div className="mb-6">
          <IssuesMap issues={[issue]} />
        </div>

        <div className="border-t pt-4">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Comments ({issue.comments.length})
          </h2>

          <form onSubmit={handleCommentSubmit} className="mb-6 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                session?.user ? "Write a comment..." : "Log in to comment"
              }
              disabled={!session?.user}
              className="flex-1 rounded border border-gray-300 p-2 disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={!session?.user || posting}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </form>

          {issue.comments.length === 0 ? (
            <p className="text-sm text-gray-400">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-3">
              {issue.comments.map((comment) => (
                <div key={comment.id} className="rounded bg-gray-50 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">
                      {comment.user.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
