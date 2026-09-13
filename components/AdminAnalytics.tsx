"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type AnalyticsData = {
  categoryData: { name: string; value: number }[];
  statusData: { name: string; value: number }[];
  monthlyData: { month: string; count: number }[];
  totalIssues: number;
};

const CATEGORY_COLORS: Record<string, string> = {
  POTHOLE: "#EF4444",
  STREETLIGHT: "#F59E0B",
  GARBAGE: "#84CC16",
  WATERLOGGING: "#3B82F6",
  OTHER: "#8B5CF6",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  IN_REVIEW: "#3B82F6",
  RESOLVED: "#10B981",
};

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-400">Loading analytics...</p>;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Category breakdown - Pie chart */}
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-800">Issues by Category</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data.categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {data.categoryData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={CATEGORY_COLORS[entry.name] || "#94A3B8"}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Status breakdown - Pie chart */}
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-800">Issues by Status</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data.statusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {data.statusData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={STATUS_COLORS[entry.name] || "#94A3B8"}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly trend - Bar chart */}
      <div className="rounded-lg bg-white p-5 shadow-sm lg:col-span-2">
        <h3 className="mb-4 font-semibold text-gray-800">Issues Reported Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#2454A6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}