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

    console.log('Connected to MongoDB')

    const collection = db.collection('weapon')

    // ❌ ลบ insert ของอาจารย์ออก (ไม่งั้นพังบน Vercel)
    // ✅ ใช้ find อย่างเดียว
    const data = await collection.find({}).toArray()

    await dbconn.close()

    return data   // 🔥 สำคัญ: ต้อง return
}

// ---------------- Export ----------------
module.exports = {
    runMongoTest: runMongo
}