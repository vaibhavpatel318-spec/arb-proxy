export default async function handler(req, res) {
  // Allow requests from anywhere (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { sport, apiKey, bookmakers } = req.query;

  if (!sport || !apiKey) {
    return res.status(400).json({ error: 'Missing sport or apiKey' });
  }

  const books = bookmakers || 'fanduel,draftkings,caesars,fanatics';
  const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=us&markets=h2h&bookmakers=${books}&oddsFormat=american`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Forward remaining requests header so app can track quota
    const remaining = response.headers.get('x-requests-remaining');
    if (remaining) res.setHeader('x-requests-remaining', remaining);

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch odds', details: err.message });
  }
}
