const http = require('http')
const mongo = require('./libs/mongo')

const PORT = process.env.PORT || 9888

async function onRequest(req, res)
{
    const url = req.url

    if(url === "/api/gacha")
    {
        let body = ''

        req.on('data', c => body += c)

        req.on('end', async () =>
        {
            const data = JSON.parse(body)
            const playerId = data.player_id
            const gachaId = data.gacha_id

            const result = await mongo.runGacha(playerId, gachaId)

            res.writeHead(200, { "Content-Type": "application/json" })
            res.end(JSON.stringify(result))
        })

        return
    }

    res.end("OK")
}

http.createServer(onRequest).listen(PORT)