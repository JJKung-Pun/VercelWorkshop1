const mongo = require('../libs/mongo')

module.exports = async (req, res) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: "POST only" })
        }

        // 🔥 กัน body undefined (สำคัญมาก)
        const body = typeof req.body === "string"
            ? JSON.parse(req.body)
            : req.body

        const playerId = body?.playerId
        const gachaId = body?.gachaId

        if (!playerId || !gachaId) {
            return res.status(400).json({ error: "missing data" })
        }

        const result = await mongo.runGacha(playerId, gachaId)

        return res.status(200).json(result)

    } catch (err) {
        console.error("GACHA ERROR:", err)
        return res.status(500).json({
            error: err.message,
            stack: err.stack
        })
    }
}