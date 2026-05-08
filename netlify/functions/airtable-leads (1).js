// Netlify Function: POST /.netlify/functions/airtable-leads
// Required env vars:
//   AIRTABLE_API_KEY  – personal access token starting with pat...
//   AIRTABLE_BASE_ID  – base ID starting with app...
//   AIRTABLE_TABLE    – exact table name, defaults to "Leads"

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
  const table = process.env.AIRTABLE_TABLE || "Leads";

  // Debug: log what env vars we have (masked)
  console.log("ENV CHECK:", {
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 6) : "MISSING",
    hasBaseId: !!baseId,
    baseIdPrefix: baseId ? baseId.substring(0, 6) : "MISSING",
    table,
  });

  if (!apiKey || !baseId) {
    return json(500, { error: "Airtable env vars not configured", hasApiKey: !!apiKey, hasBaseId: !!baseId });
  }

  let payload;
  try { payload = JSON.parse(event.body || "{}"); }
  catch { return json(400, { error: "Invalid JSON" }); }

  const { name, email, phone, intent, budget, area, timing } = payload;
  if (!name || !email || !phone || !intent || !budget || !area || !timing) {
    return json(400, {
      error: "Missing required fields",
      received: { name: !!name, email: !!email, phone: !!phone, intent: !!intent, budget: !!budget, area: !!area, timing: !!timing }
    });
  }

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5);

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`;
  console.log("Calling Airtable URL:", url);

  let res, data;
  try {
    res = await fetch(url, {
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
            Time: timeStr,
          },
        }],
        typecast: true,
      }),
    });

    data = await res.json().catch(() => ({}));
  } catch (fetchErr) {
    console.error("Fetch threw:", fetchErr);
    return json(500, { error: "Network error calling Airtable", details: fetchErr.message });
  }

  console.log("Airtable response status:", res.status);
  console.log("Airtable response body:", JSON.stringify(data));

  if (!res.ok) {
    // Return the FULL Airtable error to the browser so you can see it
    return json(res.status, {
      error: "Airtable request failed",
      airtableStatus: res.status,
      airtableError: data?.error,
      airtableMessage: data?.error?.message || data?.message,
      details: data,
    });
  }

  return json(200, { ok: true, id: data?.records?.[0]?.id });
};
