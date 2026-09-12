"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
      <Link href="/" className="text-xl font-bold text-gray-800">
        🏙️ Civic Tracker
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-600 hover:text-gray-900">
          Home
        </Link>
        <Link href="/issues" className="text-gray-600 hover:text-gray-900">
          Browse Issues
        </Link>

        {status === "loading" && (
          <span className="text-sm text-gray-400">Loading...</span>
        )}

        {status === "authenticated" && (
          <>
            <Link
              href="/report"
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Report Issue
            </Link>

            {session.user.role === "ADMIN" && (
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                Admin Panel
              </Link>
            )}

            <span className="text-sm text-gray-600">
              Hi, {session.user.name}
            </span>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>
          </>
        )}

        {status === "unauthenticated" && (
          <>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
