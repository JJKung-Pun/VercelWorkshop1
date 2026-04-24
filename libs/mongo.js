const { MongoClient, ObjectId } = require('mongodb')
const bcrypt = require('bcrypt')

// 🔥 ใส่ของคุณเอง
const db_url = "mongodb+srv://admin_db:uUWYsP5UyXH5dRJ6@cluster0.rxsbvdx.mongodb.net/gamdb?retryWrites=true&w=majority"

// -------- GET WEAPON --------
async function runMongo()
{
    const conn = await MongoClient.connect(db_url)
    const db = conn.db('gamdb')

    const data = await db.collection('weapon').find({}).toArray()

    await conn.close()
    return data
}

// -------- REGISTER --------
async function register(username, password)
{
    const conn = await MongoClient.connect(db_url)
    const db = conn.db('gamdb')

    const col = db.collection('player')

    const exist = await col.findOne({ username })
    if(exist){
        await conn.close()
        return { status: "error", message: "username exists" }
    }

    const hash = await bcrypt.hash(password, 10)

    const result = await col.insertOne({
        username,
        password: hash,
        money: 0,
        diamond: 0
    })

    await conn.close()

    return { status: "ok", player_id: result.insertedId.toString() }
}

// -------- LOGIN --------
async function login(username, password)
{
    const conn = await MongoClient.connect(db_url)
    const db = conn.db('gamdb')

    const user = await db.collection('player').findOne({ username })

    if(!user){
        await conn.close()
        return { status: "error", message: "user not found" }
    }

    const ok = await bcrypt.compare(password, user.password)

    await conn.close()

    if(!ok){
        return { status: "error", message: "wrong password" }
    }

    return {
        status: "ok",
        player_id: user._id.toString(),
        money: user.money,
        diamond: user.diamond
    }
}

// -------- UPDATE --------
async function updateCurrency(playerId, money, diamond)
{
    const conn = await MongoClient.connect(db_url)
    const db = conn.db('gamdb')

    await db.collection('player').updateOne(
        { _id: new ObjectId(playerId) },
        {
            $set: { money, diamond }
        }
    )

    await conn.close()

    return { status: "ok" }
}

module.exports = {
    runMongoTest: runMongo,
    register,
    login,
    updateCurrency
}