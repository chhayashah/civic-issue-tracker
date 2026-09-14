"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LeaderboardEntry = {
  id: string;
  name: string;
  issuesReported: number;
  upvotesReceived: number;
  score: number;
};

const medals = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data.leaderboard || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
          Top Contributors
        </h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Ranked by issues reported and community upvotes received.
        </p>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : leaderboard.length === 0 ? (
          <p className="text-sm text-gray-400">
            No contributors yet. Be the first to report an issue!
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
            {leaderboard.map((entry, index) => (
              <Link
                key={entry.id}
                href={`/users/${entry.id}`}
                className="flex items-center justify-between border-b p-4 last:border-none hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 text-center text-lg font-bold text-gray-400">
                    {medals[index] || `#${index + 1}`}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {entry.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {entry.issuesReported} issues · {entry.upvotesReceived}{" "}
                      upvotes
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {entry.score}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
