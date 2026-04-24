const { MongoClient } = require('mongodb')

// ---------------- DB CONFIG ----------------
const db_protocol = `mongodb+srv://`,
      db_host = `cluster0.rxsbvdx.mongodb.net`,
      db_path = `/gamdb?retryWrites=true&w=majority`,
      db_url = db_protocol + db_host + db_path

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

// ---------------- 🎰 GACHA (ของอาจารย์) ----------------
async function runGacha(playerId, gachaId)
{
    const db = await getDB()

    const player = await db.collection("player").findOne({ player_id: playerId })

    if (!player)
        return { status: "fail", message: "no player" }

    const cost = 100

    // 💰 หักเงิน
    if (player.money < cost)
        return { status: "fail", message: "not enough money" }

    await db.collection("player").updateOne(
        { player_id: playerId },
        { $inc: { money: -cost } }
    )

    // 🎲 pool
    const pool = await db.collection("gacha_weapon")
        .find({ gacha_id: gachaId }).toArray()

    let total = 0
    pool.forEach(w => total += w.drop_rate)

    let r = Math.random() * total
    let sum = 0
    let selected = pool[0]

    for (let w of pool)
    {
        sum += w.drop_rate
        if (r <= sum)
        {
            selected = w
            break
        }
    }

    // 🧾 weapon
    const weapon = await db.collection("weapon")
        .findOne({ weapon_id: selected.weapon_id })

    // 💾 save
    await db.collection("player_weapon").insertOne({
        player_id: playerId,
        weapon_id: selected.weapon_id
    })

    return {
        status: "ok",
        weapon_id: selected.weapon_id,
        weapon_name: weapon.weapon_name,
        money_left: player.money - cost
    }
}

module.exports = {
    getDB,
    runGacha
}