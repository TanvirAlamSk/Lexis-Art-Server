const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.7xhaxuz.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get("/", (req, res) => {
    res.send("server is running")
})

const verifyToken = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ massage: "Unauthorize Access" })
    }
    const token = header.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (error, decode) {
        if (error) {
            return res.status(403).send({ massage: "Forbidden Access" })
        }
        req.decoded = decode
        next()
    })
}

async function run() {
    try {
        const services = client.db("lexisart").collection("services");
        const projects = client.db("lexisart").collection("projects");
        const reviews = client.db("lexisart").collection("review");

        app.post("/jwt", async (req, res) => {
            const email = await req.body
            const userJwt = jwt.sign(email, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
            res.send({ userJwt })
        })

        app.get("/services", async (req, res) => {
            const query = {};
            const curser = services.find(query)
            const result = await curser.toArray()
            res.send(result)
        })
        app.get("/service/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) };
            const curser = await services.findOne(query)
            res.send(curser)
        })

        app.post("/services", async (req, res) => {
            const service = req.body
            const result = await services.insertOne(service)
            res.send(result)
        })

        app.get("/service/:id", async (req, res) => {
            const query = { _id: new ObjectId(req.params.id) }
            const curser = await services.findOne(query)
            res.send(curser)
        })

        app.get("/comments/:id", async (req, res) => {
            const id = req.params.id
            const query = { serviceId: id }
            const option = {
                sort: {
                    dateTime: 1
                },
            }
            const curser = reviews.find(query, option)
            const result = await curser.toArray()
            res.send(result)
        })

        app.post("/comments/:id", async (req, res) => {
            const id = req.params.id
            const newComment = req.body
            const result = await reviews.insertOne(req.body)
            res.send(result)
        })

        app.get("/myreview", verifyToken, async (req, res) => {
            const decoded = req.decoded
            if (decoded.email !== req.query.email) {
                res.status(401).send({ massage: "Unauthorized Access" })
            }
            const emailQuery = req.query.email
            const query = { email: emailQuery }
            const curser = reviews.find(query);
            const result = await curser.toArray()
            res.send(result)
        })

        app.get("/projects", async (req, res) => {
            const query = {};
            const curser = projects.find(query);
            const result = await curser.toArray(curser)
            res.send(result)
        })

    } finally {

    }
}


run().catch((error) => {
    if (error) {
        res.status(502).send("Bad Gateway")
    }
})



app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})