async function runGacha(playerId, gachaId)
{
    const client = await MongoClient.connect(db_url, options)
    const db = client.db("gamdb")

    const player = db.collection("player")
    const weapons = db.collection("gacha_weapon")

    // 1. get player
    const p = await player.findOne({ player_id: playerId })

    const cost = 100

    if(p.money < cost)
    {
        return { status: "fail", message: "not enough money" }
    }

    // 2. deduct money
    await player.updateOne(
        { player_id: playerId },
        { $inc: { money: -cost } }
    )

    // 3. random weapon
    const pool = await weapons.find({ gacha_id: gachaId }).toArray()

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

    // 4. save inventory
    await db.collection("player_weapon").insertOne({
        player_id: playerId,
        weapon_id: selected.weapon_id
    })

    const weapon = await db.collection("weapon").findOne({ weapon_id: selected.weapon_id })

    client.close()

    return {
        status: "ok",
        weapon: weapon.weapon_name,
        weapon_id: weapon.weapon_id
    }
}