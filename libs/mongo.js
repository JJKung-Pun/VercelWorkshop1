const { MongoClient } = require("mongodb")

const url = "mongodb+srv://cluster0.rxsbvdx.mongodb.net/gamdb?retryWrites=true&w=majority"

const auth = {
    username: "admin_db",
    password: "uUWYsP5UyXH5dRJ6"
}

const options = {
    auth: auth,
    authMechanism: "SCRAM-SHA-1"
}

let client = null

async function getDB()
{
    if(!client)
    {
        client = await MongoClient.connect(url, options)
    }
    return client.db("gamdb")
}

// 🎰 MAIN GACHA SYSTEM
async function runGacha(playerId, gachaId)
{
    const db = await getDB()

    const players = db.collection("player")
    const poolCol = db.collection("gacha_weapon")
    const weaponCol = db.collection("weapon")

    // 👤 check player
    const player = await players.findOne({ player_id: playerId })

    if(!player)
    {
        return { status: "fail", message: "player not found" }
    }

    const cost = 100
    const money = Number(player.money)

    if(money < cost)
    {
        return { status: "fail", message: "not enough money" }
    }

    // 💸 หักเงิน
    await players.updateOne(
        { player_id: playerId },
        { $inc: { money: -cost } }
    )

    // 🎲 pool กาชา
    const pool = await poolCol.find({ gacha_id: gachaId }).toArray()

    if(pool.length === 0)
    {
        return { status: "fail", message: "no gacha data" }
    }

    // 🎯 random weight
    let total = 0
    for(const w of pool)
        total += Number(w.drop_rate)

    let r = Math.random() * total
    let sum = 0
    let selected = pool[0]

    for(const w of pool)
    {
        sum += Number(w.drop_rate)
        if(r <= sum)
        {
            selected = w
            break
        }
    }

    // 🔫 weapon info
    const weapon = await weaponCol.findOne({
        weapon_id: selected.weapon_id
    })

    if(!weapon)
    {
        return { status: "fail", message: "weapon not found" }
    }

    // 📦 save inventory
    await db.collection("player_weapon").insertOne({
        player_id: playerId,
        weapon_id: selected.weapon_id
    })

    return {
        status: "ok",
        weapon: weapon.weapon_name,
        weapon_id: weapon.weapon_id,
        money_left: money - cost
    }
}

module.exports = {
    runGacha
}