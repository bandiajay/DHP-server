var cors = require('cors')
const mongoose = require("mongoose");
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');

const authRoutes = require("./src/routes/auth")
const holderRoutes = require("./src/routes/holder");
const issuerRoutes = require("./src/routes/issuer");
const verifierRoutes = require("./src/routes/verifier");
const specfile = require("./api_spec.json");
const { connectToIPFS } = require('./src/util/ipfs');



const connectionString = "mongodb+srv://admin:admin@cluster0.uliun.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const port = process.env.PORT || 3000;

// mongodb connection
mongoose.connect(connectionString,{useNewUrlParser: true, useUnifiedTopology: true}); 

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:')); 
db.once("open", function(){
   console.log("🟢 Connection to DB succeeded");
   //intializeApp();
    app.listen(port, async() => {
        console.log("🟢 server is up and running at "+ port);
        connectToIPFS()
    })
});

// middlewares
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
app.use(cors())

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/issuer", issuerRoutes);
app.use("/api/holder", holderRoutes);
app.use("/api/verifier", verifierRoutes);


app.get("/", (req,res) => {
   return res.send(specfile)
})


// app.get("/reset", (req,res) => {
//     intializeApp();
//     return res.send("Success")
// })


process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});