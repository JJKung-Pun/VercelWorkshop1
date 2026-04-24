const { MongoClient } = require('mongodb')

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

let client

async function getDB() {
    if (!client) {
        client = await MongoClient.connect(db_url, options)
    }
    return client.db('gamdb')
}

async function runGacha(playerId, gachaId) {
    try {
        const db = await getDB()
        const player = await db.collection("player").findOne({ player_id: playerId })
        if (!player) return { status: "fail", message: "no player" }

        // ✅ กำหนดค่า cost และ currency ตาม gachaId
        const chestConfigs = {
            1: { currency: "money", cost: 1000 },   // กล่องเงิน
            2: { currency: "diamond", cost: 100 },  // กล่องเพชร
            3: { currency: "diamond", cost: 150 },
            4: { currency: "diamond", cost: 200 },
            5: { currency: "diamond", cost: 300 }
        }

        const config = chestConfigs[gachaId]
        if (!config) return { status: "fail", message: "invalid gachaId" }

        const currency = config.currency
        const cost = config.cost

        if (player[currency] < cost)
            return { status: "fail", message: "not enough " + currency }

        await db.collection("player").updateOne(
            { player_id: playerId },
            { $inc: { [currency]: -cost } }
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
            money_left: player.money - (currency === "money" ? cost : 0),
            diamond_left: player.diamond - (currency === "diamond" ? cost : 0)
        }
    } catch (err) {
        return { status: "fail", message: err.message }
    }
}

module.exports = { getDB, runGacha }
