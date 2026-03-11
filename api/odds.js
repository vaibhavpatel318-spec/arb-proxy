export default async function handler(req, res) {
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

  // Special case: usage check
  if (sport === 'usage') {
    try {
      const response = await fetch(`https://api.the-odds-api.com/v4/sports/?apiKey=${apiKey}`);
      const remaining = response.headers.get('x-requests-remaining');
      const used = response.headers.get('x-requests-used');
      if (remaining) res.setHeader('x-requests-remaining', remaining);
      if (used) res.setHeader('x-requests-used', used);
      return res.status(200).json({});
    } catch(err) {
      return res.status(500).json({ error: 'Failed to fetch usage' });
    }
  }

  const books = bookmakers || 'fanduel,draftkings,caesars,fanatics';
  const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=us&markets=h2h&bookmakers=${books}&oddsFormat=american`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const remaining = response.headers.get('x-requests-remaining');
    if (remaining) res.setHeader('x-requests-remaining', remaining);

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch odds', details: err.message });
  }
}
