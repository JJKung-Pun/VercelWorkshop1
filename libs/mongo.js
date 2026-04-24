const { MongoClient } = require('mongodb')
const dns = require('dns')
dns.setServers(['8.8.8.8', '1.1.1.1'])

// ---------------- Mongo Config ----------------
const db_protocol = `mongodb+srv://`,
      db_host     = `cluster0.rxsbvdx.mongodb.net`,   // 👈 จากของนาย
      db_port     = ``,
      db_path     = `/gamdb?retryWrites=true&w=majority&appName=Cluster0`, // 👈 ใส่ DB ตรงนี้
      db_url      = db_protocol + db_host + db_port + db_path

let authuser = {
    username: `admin_db`,              // 👈 จากของนาย
    password: `uUWYsP5UyXH5dRJ6`       // 👈 จากของนาย
}

let options = {
    auth: authuser,
    authMechanism: `SCRAM-SHA-1`
}

// ---------------- Function ----------------
async function getWeapons()
{
    const dbconn = await MongoClient.connect(db_url, options)
    const db = dbconn.db('gamdb')

    console.log('Connected to MongoDB')

    const collection = db.collection('weapon')
    const data = await collection.find({}).toArray()

    await dbconn.close()

    return data
}

// ---------------- Export ----------------
module.exports = {
    getWeapons: getWeapons
}