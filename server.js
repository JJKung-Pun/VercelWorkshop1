const { MongoClient } = require('mongodb');
const http = require('http');

const PORT = process.env.PORT || 9888;
const MONGO_URI = process.env.MONGO_URI;

// ---------------- Mongo ----------------
async function getWeapons() {
  const client = await MongoClient.connect(MONGO_URI);
  const db = client.db('gamdb');

  const data = await db.collection('weapon').find().toArray();

  await client.close();
  return data;
}

// ---------------- Server ----------------
async function onClientRequest(req, resp) {
  const pathname = req.url.split('?')[0];

  try {
    // 🔹 GET weapons
    if (req.method === 'GET' && pathname === '/api/weapons') {
      const data = await getWeapons();

      resp.writeHead(200, { 'Content-Type': 'application/json' });
      return resp.end(JSON.stringify(data));
    }

    // 🔹 default
    resp.writeHead(200, { 'Content-Type': 'application/json' });
    resp.end(JSON.stringify({ message: 'API running' }));

  } catch (err) {
    resp.writeHead(500, { 'Content-Type': 'application/json' });
    resp.end(JSON.stringify({ error: err.message }));
  }
}

const server = http.createServer(onClientRequest);
server.listen(PORT, () => {
  console.log('running on ' + PORT);
});