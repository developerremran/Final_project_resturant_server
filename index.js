const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');

// middleware js 
app.use(cors());
app.use(express.json());

// verify check by tooken create 

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' });
    }
    // bearer token
    const token = authorization.split(' ')[1];

    jwt.verify(token, process.env.JWT_TOOKEN_ACCSESS, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}


// ___________MONGO START____________


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const CartCollection = client.db("Cart_Item").collection("Cart_Item");
        const userCollection = client.db("Cart_Item").collection("user_Info");

        // Warning: use verifyJWT before using verifyAdmin
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email }
            const user = await userCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ error: true, message: 'forbidden message' });
            }
            next();
        }




        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.JWT_TOOKEN_ACCSESS, { expiresIn: '2h' });
            res.send(token);
        })

        //  user collection 
        app.post('/users', async (req, res) => {
            const user = req.body;

            const query = { email: user.email }
            const exitingUser = await userCollection.findOne(query);
            if (exitingUser) {
                return res.send(exitingUser)
            }
            const result = await userCollection.insertOne(user)
            res.send(result)

        })

        app.get('/users', verifyJWT, verifyAdmin, async (req, res) => {
            const user = req.body;
            const result = await userCollection.find(user).toArray()
            res.send(result)
        })

        // security layer: verifyJWT
        // email same
        // check admin
        app.get('/users/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;

            if (req.decoded.email !== email) {
                res.send({ admin: false })
            }

            const query = { email: email }
            const user = await userCollection.findOne(query);
            const result = { admin: user?.role === 'admin' }
            res.send(result);
        })



        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;

            const filter = { _id: new ObjectId(id) }

            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })


        app.get('/products', async (req, res) => {

            const body = req.body;
            const result = await OrderMenuProduct.find(body).toArray()
            res.send(result)
        })
        app.get('/review', async (req, res) => {

            const body = req.body;
            // console.log(body);
            const result = await Review_Resturant.find(body).toArray()
            res.send(result)
        })

        app.get('/cart', verifyJWT, async (req, res) => {

            const email = req.query.email;

            //  TODO : pROBLEM


            // if (!email) {
            //     res.send([])
            // };

            // const decodedEmail = req.decoded.email;
            // if (email !==decodedEmail) {
            //     return res.status(403).send({ error: true, message: 'Forbidden access' })
            // }

            const query = { email: email }
            const result = await CartCollection.find(query).toArray();
            res.send(result)
        })

        app.post('/cart', async (req, res) => {
            const item = req.body;

            const result = await CartCollection.insertOne(item)
            res.send(result)
        })

        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await CartCollection.deleteOne(query)
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