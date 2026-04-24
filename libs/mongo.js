const { MongoClient } = require('mongodb')
const bcrypt = require('bcrypt')
const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

// ---------------- CONFIG ----------------
const db_url = `mongodb+srv://admin_db:uUWYsP5UyXH5dRJ6@cluster0.rxsbvdx.mongodb.net/gamdb?retryWrites=true&w=majority`

// ---------------- GET WEAPONS ----------------
async function runMongo()
{
    const dbconn = await MongoClient.connect(db_url)
    const db = dbconn.db('gamdb')

    const data = await db.collection('weapon').find({}).toArray()

    await dbconn.close()
    return data
}

// ---------------- REGISTER ----------------
async function register(username, password)
{
    const dbconn = await MongoClient.connect(db_url)
    const db = dbconn.db('gamdb')

    const collection = db.collection('player')

    const existing = await collection.findOne({ username: username })
    if(existing){
        await dbconn.close()
        return { status: "error", message: "username exists" }
    }

    const hash = await bcrypt.hash(password, 10)

    const result = await collection.insertOne({
        username: username,
        password: hash,
        money: 0,
        diamond: 0
    })

    await dbconn.close()

    return { status: "ok", player_id: result.insertedId }
}

// ---------------- LOGIN ----------------
async function login(username, password)
{
    const dbconn = await MongoClient.connect(db_url)
    const db = dbconn.db('gamdb')

    const user = await db.collection('player').findOne({ username: username })

    if(!user){
        await dbconn.close()
        return { status: "error", message: "user not found" }
    }

    const match = await bcrypt.compare(password, user.password)

    await dbconn.close()

    if(!match){
        return { status: "error", message: "wrong password" }
    }

    return {
        status: "ok",
        player_id: user._id.toString(),
        money: user.money,
        diamond: user.diamond
    }
}

// ---------------- UPDATE CURRENCY ----------------
async function updateCurrency(playerId, money, diamond)
{
    const dbconn = await MongoClient.connect(db_url)
    const db = dbconn.db('gamdb')

    await db.collection('player').updateOne(
        { _id: new require('mongodb').ObjectId(playerId) },
        {
            $set: {
                money: money,
                diamond: diamond
            }
        }
    )

    await dbconn.close()

    return { status: "ok" }
}

// ---------------- EXPORT ----------------
module.exports = {
    runMongoTest: runMongo,
    register,
    login,
    updateCurrency
}