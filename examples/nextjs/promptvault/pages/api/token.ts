const CLARABASE_CLIENT_ID = process.env.CLARABASE_CLIENT_ID;
const CLARABASE_CLIENT_SECRET = process.env.CLARABASE_CLIENT_SECRET;
const CLARABASE_BASE_URL = process.env.CLARABASE_BASE_URL;

let ACCESS_TOKEN: string | null = null;

export default async function loginToClarabase(forceRefresh = false) {
  if (ACCESS_TOKEN && !forceRefresh) {
    return ACCESS_TOKEN;
  }

  const tokenResp = await fetch(`${CLARABASE_BASE_URL}/v1/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: CLARABASE_CLIENT_ID,
      client_secret: CLARABASE_CLIENT_SECRET,
    }),
  });
  const tokenRespJson = await tokenResp.json();
  ACCESS_TOKEN = tokenRespJson.access_token;
  if (!ACCESS_TOKEN) {
    throw new Error("Unauthorized");
  }

  return ACCESS_TOKEN;
}

export async function clarabaseFetch<T>({
  resource,
  options,
  retryCount = 0,
}: {
  resource: string;
  options: RequestInit & {
    params?: { id?: string };
    query?: Record<string, string>;
  };
  retryCount?: number;
}): Promise<Response> {
  try {
    const token = await loginToClarabase();
    const { id } = options.params ?? {};
    const queryString = options.query
      ? "?" + new URLSearchParams(options.query).toString()
      : "";
    const response = await fetch(
      `${CLARABASE_BASE_URL}/v1/api/${resource}${id ? `/${id}` : ""}${
        queryString ? `${queryString}` : ""
      }`,
      {
        ...(options ?? {}),
        ...(options.body ? { body: JSON.stringify(options.body) } : {}),
        headers: {
          ...(options.headers ?? {}),
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok && response.status === 401 && retryCount < 3) {
      await loginToClarabase();
      return clarabaseFetch({
        resource,
        options,
        retryCount: retryCount + 1,
      });
    }
    return response;
  } catch (e) {
    console.error(`Error fetching ${resource}`, e);
    throw e;
  }
}
