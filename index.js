// server.js
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_ADMIN}:${process.env.DB_PASS}@cluster0.jr1qtie.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Reference database & collection
    const database = client.db("parcelDB");
    const parcelsCollection = database.collection("parcels");

    // === GET API ===
    app.get("/parcels", async (req, res) => {
      const parcels = await parcelsCollection.find().toArray();
      res.send(parcels);
    });
    // === GET parcels (all or by user email), sorted by latest ===
    app.get("/parcels", async (req, res) => {
      const userEmail = req.query.email;

      const query = userEmail ? { user_email: userEmail } : {};
      const options = {
        sort: {
          created_at: -1,
        }, // newest first
      };

      const parcels = await parcelsCollection.find(query, options).toArray();
      res.send(parcels);
    });

    // === POST API ===
    app.post("/parcels", async (req, res) => {
      const parcel = req.body;
      console.log("New Parcel:", parcel);

      const result = await parcelsCollection.insertOne(parcel);
      res.send(result);
    });
    // === DELETE a parcel by ID ===
    app.delete("/parcels/:id", async (req, res) => {
      const id = req.params.id;

      try {
        const query = { _id: new ObjectId(id) };
        const result = await parcelsCollection.deleteOne(query);
        res.send(result);
      } catch (err) {
        console.error("Failed to delete parcel:", err);
        res.status(500).send({ error: "Failed to delete parcel" });
      }
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


// Simple root route
app.get("/", (req, res) => {
  res.send("Parcel server is running");
});

// Start server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
