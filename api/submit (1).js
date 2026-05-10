// Vercel Serverless Function: /api/submit
// Set these in Vercel Dashboard → Project → Settings → Environment Variables:
//   AIRTABLE_API_KEY  – your pat... token
//   AIRTABLE_BASE_ID  – your app... base ID
//   AIRTABLE_TABLE    – exact table name (default: "Leads")

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_TABLE || "Leads";

  if (!apiKey || !baseId) {
    return res.status(500).json({ error: "Missing env vars", hasApiKey: !!apiKey, hasBaseId: !!baseId });
  }

  const { name, email, phone, intent, budget, area, timing } = req.body || {};

  if (!name || !email || !phone || !intent || !budget || !area || !timing) {
    return res.status(400).json({ error: "Missing required fields" });
  }

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
          },
        }],
        typecast: true,
      }),
    }
  );

  const data = await airtableRes.json().catch(() => ({}));

  if (!airtableRes.ok) {
    console.error("Airtable error:", airtableRes.status, data);
    return res.status(airtableRes.status).json({
      error: "Airtable request failed",
      airtableStatus: airtableRes.status,
      airtableMessage: data?.error?.message || data?.message,
      details: data,
    });
  }

  return res.status(200).json({ ok: true, id: data?.records?.[0]?.id });
}
