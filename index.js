const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000;

// middleware js 
app.use(cors());
app.use(express());

// ___________MONGO START____________


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.SECRET_KEY}@cluster0.jhqznt9.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const OrderMenuProduct = client.db("OrderMenuProduct").collection("OrderMenuProduct");
        const Review_Resturant = client.db("Review_Resturant").collection("Review_Resturant");

        app.get('/products', async(req, res) => {

            const body = req.body;
            const result = await OrderMenuProduct.find(body).toArray()
            res.send(result)
        })
        app.get('/review', async(req, res) => {

            const body = req.body;
            const result = await Review_Resturant.find(body).toArray()
            res.send(result)
        })












        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



// ___________MONGO END____________


app.get('/', (req, res) => {
    res.send('Server side running')

})

app.listen(port, () => {
    console.log('server is rinning');
})