const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.khpqtwr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    // DB collection
    // category collection
    const categoriesCollection = client
      .db("carSelling")
      .collection("categories");
    //   all product collection
    const productsCollection = client.db("carSelling").collection("products");
    // user collection
    const usersCollection = client.db("carSelling").collection("users");

    // carCategories get
    app.get("/carCategories", async (req, res) => {
      const query = {};
      const allCar = await categoriesCollection.find(query).toArray();
      res.send(allCar);
    });

    // //   // carCategories get using id
    // app.get("/carCategories/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: ObjectId(id) };
    //   const allCar = await categoriesCollection.find(query).toArray();
    //   res.send(allCar);
    // });

    // carCategories get by category id
    app.get("/allProducts/:id", async (req, res) => {
      const query = { categoryId: parseInt(req.params.id) };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Car selling server in running");
});

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
