// Vercel Serverless Function: /api/airtable-leads
// Required env vars (Vercel dashboard → Settings → Environment Variables):
//   AIRTABLE_API_KEY  – e.g. patXXXXXXXXXXXX
//   AIRTABLE_BASE_ID  – e.g. appXXXXXXXXXXXX
//   AIRTABLE_TABLE    – defaults to "Leads"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, cors);
    return res.end();
  }
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE || "Leads";

  if (!apiKey || !baseId) {
    res.writeHead(500, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify({ error: "Airtable env vars not configured" }));
  }

  let payload;
  try {
    // Vercel parses body automatically for JSON content-type
    payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    res.writeHead(400, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify({ error: "Invalid JSON" }));
  }

  const { name, email, phone, intent, budget, area, timing } = payload || {};
  if (!name || !email || !phone || !intent || !budget || !area || !timing) {
    res.writeHead(400, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify({ error: "Missing required fields" }));
  }

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  const airtableRes = await fetch(
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [{
          fields: {
            Name: name,
            Email: email,
            Phone: phone,
            Type: intent,
            Budget: budget,
            Area: area,
            Timing: timing,
            Date: dateStr,
          },
        }],
        typecast: true,
      }),
    }
  );

  const data = await airtableRes.json().catch(() => ({}));
  if (!airtableRes.ok) {
    console.error("Airtable error", airtableRes.status, data);
    res.writeHead(airtableRes.status, { "Content-Type": "application/json", ...cors });
    return res.end(JSON.stringify({ error: "Airtable request failed", details: data }));
  }

  res.writeHead(200, { "Content-Type": "application/json", ...cors });
  return res.end(JSON.stringify({ ok: true, id: data?.records?.[0]?.id }));
}
