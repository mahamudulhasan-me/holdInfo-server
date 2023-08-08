const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const { default: axios } = require("axios");
const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.beeiwwt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", async (req, res) => {
  res.send("HoldInfo is Running");
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    // create db
    const holdInfoDB = client.db("holdInfoDB");

    // create collection
    const cryptoCollection = holdInfoDB.collection("crypto");

    app.get("/fetch-and-store", async (req, res) => {
      const response = await axios.get(`https://api.wazirx.com/api/v2/tickers`);
      const data = response.data;
      const dataArray = Object.values(data);
      // Extract the top 10 tickers from the dataArray
      const top10Tickers = dataArray.slice(0, 10);

      await cryptoCollection.deleteMany({});
      await cryptoCollection.insertMany(top10Tickers);
      res.send(top10Tickers);
    });

    app.get("/get-data/:cryptoName", async (req, res) => {
      const cryptoName = req.params.cryptoName;

      const data = await cryptoCollection
        .find({ base_unit: cryptoName })
        .toArray();
      res.send(data);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
