const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
    // myOrders collection
    const myOrdersCollection = client.db("carSelling").collection("myOrders");
    // add product userReport collection
    const reportCollection = client.db("carSelling").collection("userReport");
    // add product advertised collection
    const advertisedCollection = client
      .db("carSelling")
      .collection("advertised");
    const paymentsCollection = client.db("carSelling").collection("payments");

    app.get("/mypro", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const productall = await productsCollection.find(query).toArray();
      res.send(productall);
    });

    /* 
 app.get("/myProducts", async (req, res) => {
        const email = req.query.email;
        const query = { email: email };
        const myProduct = await productsCollection.find(query).toArray();
        res.send(myProduct);
      });


*/

    app.get("/adver", async (req, res) => {
      const query = { sold: "available" };
      const result = await advertisedCollection.find(query).toArray();
      res.send(result);
    });

    // carCategories get
    app.get("/carCategories", async (req, res) => {
      const query = {};
      const allCar = await categoriesCollection.find(query).toArray();
      res.send(allCar);
    });

    // check user is it verified
    app.get("/checkEmail", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // post to db all report
    app.post("/allReport", async (req, res) => {
      const repo = req.body;
      const result = await reportCollection.insertOne(repo);
      res.send(result);
    });

    // get all repoted item
    app.get("/reportproduct", async (req, res) => {
      const query = {};
      const result = await reportCollection.find(query).toArray();
      res.send(result);
    });

    // delete from reported db
    app.delete("/reports/:id", async (req, res) => {
      const id = req.params.id;
      const query = { reportID: id };
      const result = await reportCollection.deleteOne(query);
      res.send(result);
    });

    // delete from product db
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
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
      const query = {
        categoryId: req.params.id,
        sold: "available",
      };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    /*  app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const query = {
                appointmentDate: booking.appointmentDate,
                email: booking.email,
                treatment: booking.treatment
            }

            const alreadyBooked = await bookingsCollection.find(query).toArray();
      
       */

    //  send add products to db
    app.post("/allProducts", async (req, res) => {
      const products = req.body;
      const result = await productsCollection.insertOne(products);
      res.send(result);
    });

    // send user information to db
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // get allSellers information to db
    app.get("/allSellers", async (req, res) => {
      const query = { role: "seller" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    // get allUsers information to db
    app.get("/allUsers", async (req, res) => {
      const query = { role: "user" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    // delete all user
    app.delete("/sellersDelete/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });

    // delete myproduct user
    app.delete("/myProductDelete/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(filter);
      res.send(result);
    });

    // verified seller verify to verified
    app.put("/verifiedStatus/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          verify: true,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // get allAdmin information to db
    app.get("/allAdmin", async (req, res) => {
      const query = { role: "admin" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    // admin check is it admin or not
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role == "admin" });
    });

    // sellers check is it seller or not
    app.get("/users/sellers/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.role == "seller" });
    });

    // user check is it user or not
    app.get("/users/simpleusers/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isSimpleuser: user?.role == "user" });
    });

    // send myOrders to db
    app.post("/myOrders", async (req, res) => {
      const myOrder = req.body;
      const result = await myOrdersCollection.insertOne(myOrder);
      res.send(result);
    });

    // get from myOrders db
    app.get("/myAllOrders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const myOrders = await myOrdersCollection.find(query).toArray();
      res.send(myOrders);

      //   get all product use query use
      // app.get("/myProducts", async (req, res) => {
      //   const email = req.query.email;
      //   const query = { email: email };
      //   const myProduct = await productsCollection.find(query).toArray();
      //   res.send(myProduct);
      // });

      //  advertise item sent db
      app.post("/advertised", async (req, res) => {
        const advertise = req.body;
        const result = await advertisedCollection.insertOne(advertise);
        res.send(result);
      });

      //   get only available advertise item
      // app.get("/advertisedItem", async (req, res) => {
      //   const query = { sold: "available" };
      //   const result = await advertisedCollection.find(query).toArray();
      //   res.send(result);
      // });

      //   get my all other using id
      app.get("/myAllOrders/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await myOrdersCollection.findOne(query);
        res.send(result);
      });

      //   stripe implement
      app.post("/create-payment-intent", async (req, res) => {
        const booking = req.body;
        const price = booking.price;
        const amount = price * 100;

        const paymentIntent = await stripe.paymentIntents.create({
          currency: "usd",
          amount: amount,
          payment_method_types: ["card"],
        });
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      });

      //   send payments data and update pay now button to paid
      app.post("/ProductPayments", async (req, res) => {
        const payment = req.body;
        const result = await paymentsCollection.insertOne(payment);

        const id = payment.bookingId;
        const filter = { _id: ObjectId(id) };
        const updatedDoc = {
          $set: {
            paid: true,
            transactionId: payment.transactionId,
          },
        };
        const updateResult = await myOrdersCollection.updateOne(
          filter,
          updatedDoc
        );

        res.send(result);
      });

      app.put("/advertiseId/:id", async (req, res) => {
        const id = req.params.id;
        // console.log(id);
        const filter = { serviceId: id };
        const options = { upsert: true };
        const updatedDoc = {
          $set: {
            sold: "unavailable",
          },
        };
        const result = await advertisedCollection.updateOne(
          filter,
          updatedDoc,
          options
        );
        res.send(result);
      });

      app.put("/alProductsId/:id", async (req, res) => {
        const id = req.params.id;
        // console.log(id);
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updatedDoc = {
          $set: {
            sold: "unavailable",
          },
        };
        const result = await productsCollection.updateOne(
          filter,
          updatedDoc,
          options
        );
        res.send(result);
      });

      // app.put("/advertiseId/:id", async (req, res) => {
      //   const bookid = req.params.id;
      //   // console.log(bookid);
      //   const fillter = { _id: ObjectId(bookid) };
      //   const updateUser = req.body;
      //   console.log(updateUser);
      //   // const options = { upsert: true };
      //   // const updateDoc = {
      //   //   $set: {
      //   //     sold: unavailable,
      //   //   },
      //   // };
      //   // const updateResults = await advertisedCollection.updateOne(
      //   //   fillter,
      //   //   updateDoc,
      //   //   options
      //   // );
      //   // res.send(updateResults);
      // });
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
