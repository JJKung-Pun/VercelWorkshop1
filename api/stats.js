const items = require('../json/items.json')

function onStats(resp)
{
    resp.write( JSON.stringify(items) )
}
// --------------------------------------------------------------------

module.exports = {
    onStats
}