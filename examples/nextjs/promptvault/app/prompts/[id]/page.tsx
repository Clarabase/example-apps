"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { Prompt } from "../../../interfaces";

export default function PromptPage() {
  const params = useParams();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async () => {
    try {
      const response = await fetch(`/api/prompts/${params?.id}`);
      if (!response.ok) throw new Error("Failed to fetch prompt");
      const data = await response.json();
      setPrompt(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!prompt) return <div>Prompt not found</div>;

  return (
    <div className="max-w-4xl mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">{prompt.title}</h1>
      <div className="space-y-4">
        <p>
          <strong>Category:</strong> {prompt.category}
        </p>
        <p>
          <strong>Content:</strong> {prompt.content}
        </p>
        <p>
          <strong>Example Output:</strong> {prompt.example_output}
        </p>
        <p>
          <strong>Tags:</strong> {prompt.tags?.join(", ") || "No tags"}
        </p>
      </div>
    </div>
  );
}
