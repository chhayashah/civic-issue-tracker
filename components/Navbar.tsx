"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";

type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  link: string | null;
};

export default function Navbar() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = () => {
    if (!session?.user) return;
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [session?.user]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      await fetch(`/api/notifications/${notif.id}/read`, { method: "PATCH" });
      fetchNotifications();
    }
    setShowDropdown(false);
  };

  return (
    <nav className="flex items-center justify-between bg-white px-6 py-4 shadow-sm dark:bg-gray-800">
      <Link
        href="/"
        className="text-xl font-bold text-gray-800 dark:text-white"
      >
        🏙️ Civic Tracker
      </Link>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          Home
        </Link>
        <Link
          href="/issues"
          className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          Browse Issues
        </Link>
        <Link
          href="/leaderboard"
          className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          Leaderboard
        </Link>

        <ThemeToggle />

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
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Admin Panel
              </Link>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
                  <div className="border-b p-3 font-semibold text-gray-800 dark:border-gray-700 dark:text-white">
                    Notifications
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-gray-400">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <Link
                          key={notif.id}
                          href={notif.link || "#"}
                          onClick={() => handleNotificationClick(notif)}
                          className={`block border-b p-3 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${
                            !notif.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          }`}
                        >
                          <p className="text-gray-700 dark:text-gray-200">
                            {notif.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/profile"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Profile
            </Link>

            <span className="text-sm text-gray-600 dark:text-gray-300">
              Hi, {session.user.name}
            </span>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-red-600 hover:underline dark:text-red-400"
            >
              Logout
            </button>
          </>
        )}

        {status === "unauthenticated" && (
          <>
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
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
