const http = require("http")
const mongo = require("./mongo")

const PORT = process.env.PORT || 9888

async function onRequest(req, res)
{
    const url = req.url

    // 🎰 GACHA API
    if(url === "/api/gacha")
    {
        let body = ""

        req.on("data", chunk => {
            body += chunk
        })

        req.on("end", async () => {
            try
            {
                const data = JSON.parse(body)

                const result = await mongo.runGacha(
                    data.player_id,
                    data.gacha_id
                )

                res.writeHead(200, {
                    "Content-Type": "application/json"
                })

                res.end(JSON.stringify(result))
            }
            catch(err)
            {
                res.writeHead(500, {
                    "Content-Type": "application/json"
                })

                res.end(JSON.stringify({
                    status: "error",
                    message: err.message
                }))
            }
        })

        return
    }

    res.end("API Running")
}

http.createServer(onRequest).listen(PORT)
console.log("Server running on " + PORT)