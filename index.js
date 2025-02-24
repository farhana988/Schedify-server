require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const morgan = require("morgan");

const port = process.env.PORT || 5000;
const app = express();

app.use(cors());

app.use(express.json());

app.use(morgan("dev"));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ljf3d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // ----------------------------------------------    all created db   ---------------------------------

    const db = client.db("schedify");
    const userCollection = db.collection("users");
    const taskCollection = db.collection("task");



    // ----------------------------------------------    task   apis   ---------------------------------

    // create a task
    app.post("/tasks", async (req, res) => {
      const taskInfo = req.body;
      const result = await taskCollection.insertOne(taskInfo);
      res.send(result);
    });

    // get all tasks by a specific user

    app.get("/tasks", async (req, res) => {
      const { email } = req.query;
      const result = await taskCollection
        .find({ "user.email": email })
        .toArray();
      res.send(result);
    });

    // update a task status
    app.patch("/tasks/:id", async (req, res) => {
      const { id } = req.params;
      const { category } = req.body;
      const result = await taskCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            category,
          },
        }
      );
      res.send(result);
    });

    // delete a task

    app.delete("/tasks/:id", async (req, res) => {
      const { id } = req.params;
      const result = await taskCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });




    // ----------------------------------------------    user   apis   ---------------------------------

    app.post("/user", async (req, res) => {
      const query = req.body;
      const result = await userCollection.insertOne(query);
      res.send(result);
    });




    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from schedify Server..");
});

app.listen(port, () => {
  console.log(`schedify is running on port ${port}`);
});
