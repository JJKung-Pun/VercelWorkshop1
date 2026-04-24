const rates = require('../json/gacha_rate.json')
const items = require('../json/items.json')
const rands = require('../libs/random')

// --------------------------------------------------------------------
function onRequestGacha(resp)
{
    resp.write( JSON.stringify(rands.drawGacha(rates, items)) )
}
// --------------------------------------------------------------------

module.exports = {
    onRequestGacha
}
