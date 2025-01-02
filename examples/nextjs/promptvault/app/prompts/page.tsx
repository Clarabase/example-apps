"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Prompt } from "../../interfaces";

export default function PromptsPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch("/api/prompts");
      if (!response.ok) throw new Error("Failed to fetch prompts");
      const data = await response.json();
      setPrompts(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (promptId: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;

    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete prompt");

      // Remove the deleted prompt from the state
      setPrompts(prompts.filter((prompt) => prompt.id !== promptId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prompts</h1>
        <Link
          href="/prompts/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Prompt
        </Link>
      </div>

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Title</th>
            <th className="py-2">Category</th>
            <th className="py-2">Content</th>
            <th className="py-2">Example Output</th>
            <th className="py-2">Tags</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {prompts.map((prompt, i) => (
            <tr key={prompt.id || i} className="border-t">
              <td className="py-2 px-4">
                <button onClick={() => router.push(`/prompts/${prompt.id}`)}>
                  {prompt.title}
                </button>
              </td>
              <td className="py-2 px-4">{prompt.category}</td>
              <td className="py-2 px-4">{prompt.content}</td>
              <td className="py-2 px-4">{prompt.example_output}</td>
              <td className="py-2 px-4">
                {prompt.tags?.join(", ") || "No tags"}
              </td>
              <td className="py-2 px-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/prompts/${prompt.id}/edit`)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(prompt.id!)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
