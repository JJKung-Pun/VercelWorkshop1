// mongo.js
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

let client   // เก็บ client reuse

// ---------------- CONNECT ----------------
async function getDB() {
    if (!client) {
        client = await MongoClient.connect(db_url, options)
    }
    return client.db('gamdb')
}

// ---------------- 🎰 GACHA ----------------
async function runGacha(playerId, gachaId) {
    try {
        const db = await getDB()

        const player = await db.collection("player").findOne({ player_id: playerId })
        if (!player) return { status: "fail", message: "no player" }

        const cost = 100
        if (player.money < cost) return { status: "fail", message: "not enough money" }

        await db.collection("player").updateOne(
            { player_id: playerId },
            { $inc: { money: -cost } }
        )

        const pool = await db.collection("gacha_weapon")
            .find({ gacha_id: gachaId }).toArray()

        let total = pool.reduce((sum, w) => sum + w.drop_rate, 0)
        let r = Math.random() * total
        let sum = 0
        let selected = pool[0]

        for (let w of pool) {
            sum += w.drop_rate
            if (r <= sum) {
                selected = w
                break
            }
        }

        const weapon = await db.collection("weapon")
            .findOne({ weapon_id: selected.weapon_id })

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
    } catch (err) {
        return { status: "fail", message: err.message }
    }
}

module.exports = { getDB, runGacha }
