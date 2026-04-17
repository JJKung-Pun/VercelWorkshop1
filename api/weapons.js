const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;

module.exports = async (req, res) => {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();

    const db = client.db('gamdb');
    const weapons = await db.collection('weapon').find({}).toArray();

    await client.close();

    res.status(200).json(weapons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};