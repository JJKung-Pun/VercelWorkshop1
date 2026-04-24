const { MongoClient } = require('mongodb')
const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

// ---------------- Mongo Config ----------------
const db_protocol = `mongodb+srv://`,
      db_host     = `cluster0.rxsbvdx.mongodb.net`,
      db_port     = ``,
      db_path     = `/gamdb?retryWrites=true&w=majority`,
      db_url      = db_protocol + db_host + db_port + db_path

let authuser = {
    username: `admin_db`,
    password: `uUWYsP5UyXH5dRJ6`
}

let options = {
    auth: authuser,
    authMechanism: `SCRAM-SHA-1`
}

// ---------------- FUNCTION (ใช้ตัวเดียวจบ) ----------------
async function runMongo()
{
    const dbconn = await MongoClient.connect(db_url, options)
    const db = dbconn.db('gamdb')

    const collection = db.collection('weapon')
    const data = await collection.find({}).toArray()

    await dbconn.close()

    return data
}

// ---------------- UPDATE CURRENCY ----------------
async function updateCurrency(playerId, money, diamond)
{
    const dbconn = await MongoClient.connect(db_url, options)
    const db = dbconn.db('gamdb')

    const collection = db.collection('player')

    await collection.updateOne(
        { player_id: playerId },
        {
            $set: {
                money: money,
                diamond: diamond
            }
        },
        { upsert: true }
    )

    await dbconn.close()

    return { status: "ok" }
}

// ---------------- Export ----------------
module.exports = {
    runMongoTest: runMongo,
    updateCurrency: updateCurrency
}