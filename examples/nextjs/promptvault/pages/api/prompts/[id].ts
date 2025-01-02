import type { NextApiRequest, NextApiResponse } from "next";
import type { Prompt } from "../../../interfaces";
import { clarabaseFetch } from "../token";

export default async function PromptHandler(
  req: NextApiRequest,
  res: NextApiResponse<Prompt | { error: string }>
) {
  const { query, method } = req;
  const { id } = query;

  if (!id) {
    return res.status(400).json({ error: "Missing id" });
  }

  if (method === "GET") {
    try {
      const resp = await clarabaseFetch<Prompt>({
        resource: "prompts",
        options: { method: "GET", params: { id: id as string } },
        retryCount: 0,
      });
      if (resp.ok) {
        const data = await resp.json();
        return res.status(200).json(data);
      }
      console.error("Error fetching prompts", resp);
      return res.status(resp.status).json({ error: "An error occurred" });
    } catch (e) {
      return res.status(500).json({ error: "A server error occurred" });
    }
  }

  if (method === "PUT") {
    try {
      const resp = await clarabaseFetch({
        resource: "prompts",
        options: {
          method: "PUT",
          params: { id: id as string },
          body: req.body,
        },
      });
      if (resp.ok) {
        const data = await resp.json();
        return res.status(201).json(data);
      }
      console.error("Error updating prompts", resp);
      return res.status(resp.status).json({ error: resp.statusText });
    } catch (e) {
      return res.status(500).json({ error: "A server error occurred" });
    }
  }

  if (method === "DELETE") {
    try {
      const resp = await clarabaseFetch({
        resource: "prompts",
        options: {
          method: "DELETE",
          params: { id: id as string },
        },
      });
      if (resp.ok) {
        return res.status(201);
      }
      console.error("Error deleting prompts", resp);
      return res.status(resp.status).json({ error: resp.statusText });
    } catch (e) {
      return res.status(500).json({ error: "A server error occurred" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end(`Method ${method} Not Allowed`);
}
