const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const axios = require('axios')
const redis = require('redis')
const REDIS_PORT = process.env.REDIS_PORT || 6379
const client = redis.createClient(REDIS_PORT)
client.on('connect', () => console.log(`Redis is connected on port ${REDIS_PORT}`))
client.on("error", (error) => console.error(error))
var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

app.get('/users', (req, res) => {
  try {
    const username = "Bret"
    client.get(username, async (err, cache_data) => {
      if (cache_data) {
        return res.status(200).send({
          message: `Retrieved ${username}'s data from the cache`,
          users: JSON.parse(cache_data)
        })
      } else {
        const api = await axios.get(`https://jsonplaceholder.typicode.com/users/?username=${username}`)
        client.setex(username, 1440, JSON.stringify(api.data))
        return res.status(200).send({
          message: `Retrieved ${username}'s data from the server`,
          users: api.data
        })
      }
    })
  } catch (error) {
    console.log(error)
  }
})

require("./app/routes/turorial.routes")(app);

// set port, listen for requests
const PORT = process.env.NODE_DOCKER_PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
