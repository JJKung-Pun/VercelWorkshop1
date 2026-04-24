const { MongoClient } = require('mongodb')
const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

const db_protocol = `mongodb+srv://`
const db_host = `cluster0.rxsbvdx.mongodb.net`
const db_path = `/gamdb?retryWrites=true&w=majority`

const db_url = db_protocol + db_host + db_path

let options = {
    auth: {
        username: "admin_db",
        password: "uUWYsP5UyXH5dRJ6"
    },
    authMechanism: "SCRAM-SHA-1"
}

// -------- WEAPONS --------
async function runMongo()
{
    const conn = await MongoClient.connect(db_url, options)
    const db = conn.db('gamdb')

    const data = await db.collection('weapon').find({}).toArray()

    await conn.close()
    return data
}

// -------- UPDATE CURRENCY --------
async function updateCurrency(playerId, money, diamond)
{
    const conn = await MongoClient.connect(db_url, options)
    const db = conn.db('gamdb')

    await db.collection('player').updateOne(
        { player_id: playerId },
        {
            $set: {
                money,
                diamond
            }
        },
        { upsert: true }
    )

    await conn.close()

    return { status: "ok" }
}

module.exports = {
    runMongoTest: runMongo,
    updateCurrency
}