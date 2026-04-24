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

        // ---------------- GACHA ----------------
        else if (req.method === 'POST' && pathname === '/api/gacha') {
            let body = ''
            req.on('data', chunk => body += chunk)

            req.on('end', async () => {
                try {
                    const data = JSON.parse(body || "{}")

                    const result = await mongo.runGacha(
                        data.playerId,
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
