"use client";

import { useCompletion } from "@ai-sdk/react";
import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState("");
  const { complete, completion, isLoading } = useCompletion({
    api: "/api/haiku",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await complete(topic);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          Haiku Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="topic"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Enter a topic for your haiku:
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., cherry blossoms, ocean waves..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating..." : "Generate Haiku"}
          </button>
        </form>

        {completion && (
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Your Haiku:
            </h2>
            <p className="text-lg whitespace-pre-line text-gray-800 dark:text-white font-serif text-center">
              {completion}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
