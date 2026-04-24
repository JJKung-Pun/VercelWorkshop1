const http = require('http')
const mongo = require('./libs/mongo')

const PORT = process.env.PORT || 9888

async function onClientRequest(req, resp) {
    const pathname = req.url.split('?')[0]

    try {
        // ---------------- WEAPONS ----------------
        if (req.method === 'GET' && pathname === '/api/weapons') {
            const db = await mongo.getDB()
            const data = await db.collection("weapon").find({}).toArray()

            resp.writeHead(200, { 'Content-Type': 'application/json' })
            resp.end(JSON.stringify(data))
            return
        }

        // ---------------- PLAYER ----------------
        else if (req.method === 'GET' && pathname === '/api/player') {
            const urlParams = new URLSearchParams(req.url.split('?')[1]);
            const playerId = parseInt(urlParams.get('playerId'));

            const db = await mongo.getDB();
            const player = await db.collection("player").findOne({ player_id: playerId });

            if (!player) {
                resp.writeHead(404, { 'Content-Type': 'application/json' });
                resp.end(JSON.stringify({ status: "fail", message: "no player" }));
                return;
            }

            resp.writeHead(200, { 'Content-Type': 'application/json' });
            resp.end(JSON.stringify({
                player_id: player.player_id,
                money: player.money,
                diamond: player.diamond
            }));
            return;
        }

        // ---------------- GACHA ----------------
        else if (req.method === 'POST' && pathname === '/api/gacha') {
            let body = ''
            req.on('data', chunk => body += chunk)

            req.on('end', async () => {
                try {
                    const data = JSON.parse(body || "{}")

                    const result = await mongo.runGacha(
                        parseInt(data.playerId),
                        parseInt(data.gachaId)
                    )

                    resp.writeHead(200, { 'Content-Type': 'application/json' })
                    resp.end(JSON.stringify(result))
                } catch (err) {
                    resp.writeHead(400, { 'Content-Type': 'application/json' })
                    resp.end(JSON.stringify({ error: "invalid json" }))
                }
            })
            return
        }

        // ---------------- UPDATE CURRENCY ----------------
        else if (req.method === 'POST' && pathname === '/api/updateCurrency') {
            let body = ''
            req.on('data', chunk => body += chunk)

            req.on('end', async () => {
                try {
                    const data = JSON.parse(body || "{}")
                    const playerId = parseInt(data.playerId)
                    const money = parseInt(data.money)
                    const diamond = parseInt(data.diamond)

                    const db = await mongo.getDB()
                    await db.collection("player").updateOne(
                        { player_id: playerId },
                        { $inc: { money: money, diamond: diamond } },
                        { upsert: true }
                    )

                    resp.writeHead(200, { 'Content-Type': 'application/json' })
                    resp.end(JSON.stringify({
                        status: "ok",
                        message: "Currency updated",
                        playerId,
                        money,
                        diamond
                    }))
                } catch (err) {
                    resp.writeHead(400, { 'Content-Type': 'application/json' })
                    resp.end(JSON.stringify({ error: "invalid json" }))
                }
            })
            return
        }

        // ---------------- DEFAULT ----------------
        else {
            resp.writeHead(200, { 'Content-Type': 'application/json' })
            resp.end(JSON.stringify({ message: 'API running' }))
            return
        }
    } catch (err) {
        resp.writeHead(500, { 'Content-Type': 'application/json' })
        resp.end(JSON.stringify({ error: err.message }))
        return
    }
}

http.createServer(onClientRequest).listen(PORT)
console.log('running on ' + PORT)
