const http = require('http')
const mongo = require('./mongo')

// ---------------------------------------------------------------
const PORT = process.env.PORT || 9888
// ---------------------------------------------------------------
async function onClientRequest(req, resp)
{
    const pathname = req.url.split('?')[0]

    try
    {
        if(req.method === 'GET' && pathname === '/api/weapons'){
            const data = await mongo.getWeapons()

            resp.writeHead(200, { 'Content-Type': 'application/json' })
            resp.write(JSON.stringify(data))
        }
        else{
            resp.writeHead(200, { 'Content-Type': 'application/json' })
            resp.write(JSON.stringify({ message: 'Hello Vercel class' }))
        }
    }
    catch(err)
    {
        resp.writeHead(500, { 'Content-Type': 'application/json' })
        resp.write(JSON.stringify({ error: err.message }))
    }

    resp.end()
}
// ---------------------------------------------------------------
const server = http.createServer(onClientRequest)
server.listen(PORT)
console.log('running on ' + PORT)