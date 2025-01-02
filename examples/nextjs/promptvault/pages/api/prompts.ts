import type { NextApiRequest, NextApiResponse } from "next";
import type { Prompt } from "../../interfaces";
import { clarabaseFetch } from "./token";

export default async function PromptHandler(
  req: NextApiRequest,
  res: NextApiResponse<Prompt | { error: string }>
) {
  const { query, method } = req;

  if (method === "GET") {
    try {
      const resp = await clarabaseFetch({
        resource: "prompts",
        options: { query: { page: "1", pageSize: "10" } },
      });
      if (resp.ok) {
        const data = await resp.json();
        return res.status(200).json(data);
      }
      console.error("Error fetching prompts", resp);
      return res.status(resp.status).json({ error: resp.statusText });
    } catch (e) {
      console.error("Error fetching prompts", e);
      return res.status(500).json({ error: "A server error occurred" });
    }
  }

  if (method === "POST") {
    try {
      const resp = await clarabaseFetch({
        resource: "prompts",
        options: { method: "POST", body: req.body },
      });
      if (resp.ok) {
        const item = await resp.json();
        return res.status(200).json(item);
      }
      console.error("Error creating prompts", await resp.text());
      return res.status(resp.status).json({ error: resp.statusText });
    } catch (err) {
      console.error("Error creating prompts", err);
      return res.status(500).json({ error: "A server error occurred" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${method} Not Allowed`);
}
