"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded bg-gray-100">
      Loading map...
    </div>
  ),
});

type NearbyIssue = {
  id: string;
  title: string;
  status: string;
};

export default function ReportIssuePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "POTHOLE",
  });
  const [image, setImage] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [nearbyIssues, setNearbyIssues] = useState<NearbyIssue[]>([]);
  const [checkingNearby, setCheckingNearby] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Jab bhi location ya category change ho, nearby duplicates check karo
  useEffect(() => {
    if (!location) return;

    setCheckingNearby(true);
    const timer = setTimeout(() => {
      fetch(
        `/api/issues/nearby?lat=${location.lat}&lng=${location.lng}&category=${formData.category}`,
      )
        .then((res) => res.json())
        .then((data) => {
          setNearbyIssues(data.nearby || []);
          setCheckingNearby(false);
        });
    }, 400); // debounce: user ke rukne ka wait karo

    return () => clearTimeout(timer);
  }, [location, formData.category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!location) {
      setError("Please click on the map to select a location");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";

      if (image) {
        const imgFormData = new FormData();
        imgFormData.append("file", image);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: imgFormData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "Image upload failed");
        }

        imageUrl = uploadData.url;
      }

      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrl,
          latitude: location.lat,
          longitude: location.lng,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create issue");
      }

      router.push("/issues");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        Report a New Issue
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-lg bg-white p-6 shadow-sm"
      >
        {error && (
          <p className="rounded bg-red-100 p-2 text-sm text-red-600">{error}</p>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 p-2"
            placeholder="e.g. Large pothole on MG Road"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 p-2"
            rows={4}
            placeholder="Describe the issue in detail"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 p-2"
          >
            <option value="POTHOLE">Pothole</option>
            <option value="STREETLIGHT">Street Light</option>
            <option value="GARBAGE">Garbage</option>
            <option value="WATERLOGGING">Water Logging</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Photo (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Location (click on the map)
          </label>
          <LocationPicker onSelect={(lat, lng) => setLocation({ lat, lng })} />
          {location && (
            <p className="mt-1 text-xs text-gray-500">
              Selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Duplicate warning */}
        {checkingNearby && (
          <p className="text-xs text-gray-400">
            Checking for similar nearby issues...
          </p>
        )}

        {!checkingNearby && nearbyIssues.length > 0 && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
            <p className="mb-2 text-sm font-medium text-amber-800">
              ⚠️ {nearbyIssues.length} similar issue
              {nearbyIssues.length > 1 ? "s" : ""} already reported nearby:
            </p>
            <ul className="space-y-1">
              {nearbyIssues.map((n) => (
                <li key={n.id} className="text-sm">
                  <Link
                    href={`/issues/${n.id}`}
                    target="_blank"
                    className="text-amber-900 underline hover:text-amber-700"
                  >
                    {n.title}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-amber-700">
              Consider upvoting the existing issue instead of creating a
              duplicate.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Issue"}
        </button>
      </form>
    </div>
  );
}
