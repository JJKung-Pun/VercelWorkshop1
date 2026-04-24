const http = require('http')
const mongo = require('./mongo')

const PORT = process.env.PORT || 9888

async function onClientRequest(req, res)
{
    const path = req.url.split('?')[0]

    res.setHeader('Content-Type', 'application/json')

    try
    {
        // 🎰 GACHA API
        if (req.method === 'POST' && path === '/api/gacha')
        {
            let body = ""

            req.on('data', chunk => body += chunk)

            req.on('end', async () =>
            {
                const data = JSON.parse(body)

                const result = await mongo.runGacha(
                    data.playerId,
                    data.gachaId
                )

                res.end(JSON.stringify(result))
            })

            return
        }

        res.end(JSON.stringify({ status: "running" }))
    }
    catch (err)
    {
        res.statusCode = 500
        res.end(JSON.stringify({ error: err.message }))
    }
}

http.createServer(onClientRequest).listen(PORT)

console.log("server running")