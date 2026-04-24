const http = require('http')
const mongo = require('./mongo')

// ---------------- PORT ----------------
const PORT = process.env.PORT || 9888

// ---------------- MAIN HANDLER ----------------
async function onClientRequest(req, resp)
{
    const pathname = req.url.split('?')[0]

    try
    {
        // 🔹 GET weapons
        if(req.method === 'GET' && pathname === '/api/weapons')
        {
            const data = await mongo.runMongo()

            resp.writeHead(200, { 'Content-Type': 'application/json' })
            return resp.end(JSON.stringify(data))
        }

        // 🔹 UPDATE currency (money / diamond manual)
        else if(req.method === 'POST' && pathname === '/api/update-currency')
        {
            let body = ''

            req.on('data', chunk => {
                body += chunk
            })

            req.on('end', async () => {
                const data = JSON.parse(body)

                const result = await mongo.updateCurrency(
                    data.player_id,
                    data.money,
                    data.diamond
                )

                resp.writeHead(200, { 'Content-Type': 'application/json' })
                resp.end(JSON.stringify(result))
            })

            return
        }

        // 🔥 MAIN GACHA API (IMPORTANT)
        else if(req.method === 'POST' && pathname === '/api/gacha')
        {
            let body = ''

            req.on('data', chunk => {
                body += chunk
            })

            req.on('end', async () => {
                const data = JSON.parse(body)

                const result = await mongo.runGacha(
                    data.player_id,
                    data.gacha_id,
                    data.currency   // 💰 money / 💎 diamond
                )

                resp.writeHead(200, { 'Content-Type': 'application/json' })
                resp.end(JSON.stringify(result))
            })

            return
        }

        // 🔹 DEFAULT
        else
        {
            resp.writeHead(200, { 'Content-Type': 'application/json' })
            resp.end(JSON.stringify({ message: 'API running' }))
        }
    }
    catch(err)
    {
        resp.writeHead(500, { 'Content-Type': 'application/json' })
        resp.end(JSON.stringify({ error: err.message }))
    }
}

// ---------------- START SERVER ----------------
const server = http.createServer(onClientRequest)

server.listen(PORT, () => {
    console.log("Server running on port " + PORT)
})