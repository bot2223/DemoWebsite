// Netlify Function: POST /.netlify/functions/airtable-leads
// Required env vars (Site settings → Environment variables):
//   AIRTABLE_API_KEY  – e.g. patXXXXXXXXXXXX
//   AIRTABLE_BASE_ID  – e.g. appXXXXXXXXXXXX
//   AIRTABLE_TABLE    – optional, defaults to "Leads"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (status, body) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json", ...cors },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table  = process.env.AIRTABLE_TABLE || "Leads";
  if (!apiKey || !baseId) return json(500, { error: "Airtable env vars not configured" });

  let p;
  try { p = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "Invalid JSON" }); }
  const { name, email, phone, intent, budget, area, timing } = p;
  if (!name || !email || !phone || !intent || !budget || !area || !timing)
    return json(400, { error: "Missing required fields" });

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5);

  const r = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      records: [{ fields: {
        Name: name, Email: email, Phone: phone, Type: intent,
        Budget: budget, Area: area, Timing: timing, Date: date, Time: time,
      }}],
      typecast: true,
    }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) { console.error("Airtable", r.status, data); return json(r.status, { error: "Airtable failed", details: data }); }
  return json(200, { ok: true, id: data?.records?.[0]?.id });
};
