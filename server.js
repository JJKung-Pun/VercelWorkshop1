const http = require('http')
const api_gacha = require('./api/gacha')
const api_stats = require('./api/stats')
// ---------------------------------------------------------------
const PORT = process.env.PORT || 9888
// ---------------------------------------------------------------
function onClientRequest(req,resp)
{
    const pathname = req.url.split('?')[0]

    resp.writeHead(200, { 'Content-Type' : 'application/json' })

    if(req.method === 'POST' && pathname === '/api/gacha/open'){
        api_gacha.onRequestGacha(resp)
    }
    if(req.method === 'POST' && pathname === '/api/stats'){
        api_stats.onStats(resp)
    }else{
        resp.write(JSON.stringify( { message: 'Hello Vercel 2310511105008' } ))
    }

    resp.end()
}
// ---------------------------------------------------------------
const server = http.createServer( onClientRequest )
server.listen(PORT)
console.log('running on '+PORT)
