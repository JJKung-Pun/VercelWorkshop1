const { MongoClient } = require('mongodb')

// ---------------- DB CONFIG ----------------
const db_protocol = `mongodb+srv://`,
      db_host     = `cluster0.rxsbvdx.mongodb.net`,
      db_path     = `/gamdb?retryWrites=true&w=majority`,
      db_url      = db_protocol + db_host + db_path

let authuser = {
    username: `admin_db`,
    password: `uUWYsP5UyXH5dRJ6`
}

let options = {
    auth: authuser,
    authMechanism: `SCRAM-SHA-1`
}

// ---------------- CONNECT ----------------
async function getDB()
{
    const client = await MongoClient.connect(db_url, options)
    return client.db('gamdb')
}

// ---------------- GET WEAPONS ----------------
async function runMongo()
{
    const db = await getDB()
    const data = await db.collection('weapon').find({}).toArray()
    return data
}

// ---------------- UPDATE CURRENCY ----------------
async function updateCurrency(playerId, money, diamond)
{
    const db = await getDB()

    await db.collection('player').updateOne(
        { player_id: playerId },
        {
            $set: {
                money: money,
                diamond: diamond
            }
        },
        { upsert: true }
    )

    return { status: "ok" }
}

// ---------------- 🎰 GACHA SYSTEM (MONEY + DIAMOND) ----------------
async function runGacha(playerId, gachaId, currency)
{
    const db = await getDB()

    const players = db.collection("player")
    const poolCol = db.collection("gacha_weapon")
    const weaponCol = db.collection("weapon")

    const player = await players.findOne({ player_id: playerId })

    if(!player)
        return { status: "fail", message: "player not found" }

    const cost = 100

    // 💰 ใช้เงินแบบเลือกได้
    if(currency === "diamond")
    {
        if(player.diamond < cost)
            return { status: "fail", message: "not enough diamond" }

        await players.updateOne(
            { player_id: playerId },
            { $inc: { diamond: -cost } }
        )
    }
    else
    {
        if(player.money < cost)
            return { status: "fail", message: "not enough money" }

        await players.updateOne(
            { player_id: playerId },
            { $inc: { money: -cost } }
        )
    }

    // 🎲 pool gacha
    const pool = await poolCol.find({ gacha_id: gachaId }).toArray()

    if(pool.length === 0)
        return { status: "fail", message: "no gacha data" }

    let total = 0
    pool.forEach(w => total += w.drop_rate)

    let r = Math.random() * total
    let sum = 0
    let selected = pool[0]

    for(let w of pool)
    {
        sum += w.drop_rate
        if(r <= sum)
        {
            selected = w
            break
        }
    }

    // 🧾 get weapon
    const weapon = await weaponCol.findOne({ weapon_id: selected.weapon_id })

    // 💾 save inventory
    await db.collection("player_weapon").insertOne({
        player_id: playerId,
        weapon_id: selected.weapon_id
    })

    return {
        status: "ok",
        weapon: weapon.weapon_name,
        weapon_id: weapon.weapon_id,
        money_left: currency === "money" ? player.money - cost : player.money,
        diamond_left: currency === "diamond" ? player.diamond - cost : player.diamond
    }
}

// ---------------- EXPORT ----------------
module.exports = {
    runMongo,
    updateCurrency,
    runGacha
}