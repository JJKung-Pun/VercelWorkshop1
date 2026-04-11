const { MongoClient } = require('mongodb');
const http = require('http');

const PORT = process.env.PORT || 9888;
const MONGO_URI = process.env.MONGO_URI;

async function getWeapons() {
  const client = await MongoClient.connect(MONGO_URI);
  const db = client.db('gamdb'); // ใช้ชื่อ database ที่คุณสร้างใน Compass
  const weapons = await db.collection('weapon').find().toArray();
  client.close();
  return weapons;
}

function onClientRequest(req, resp) {
  const pathname = req.url.split('?')[0];
  resp.writeHead(200, { 'Content-Type': 'application/json' });

  if (req.method === 'GET' && pathname === '/api/weapons') {
    getWeapons().then(data => {
      resp.write(JSON.stringify(data));
      resp.end();
    });
  } else {
    resp.write(JSON.stringify({ message: 'Hello Vercel API' }));
    resp.end();
  }
}

const server = http.createServer(onClientRequest);
server.listen(PORT);
console.log('running on ' + PORT);