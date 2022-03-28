const driver = require('bigchaindb-driver');
var cors = require('cors')
const base58 = require('bs58');
const crypto = require('crypto');
const { Ed25519Sha256 } = require('crypto-conditions');
const mongoose = require("mongoose");
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
const { ReturnDocument } = require('mongodb');
const authRoutes = require("./src/routes/auth")
const holderRoutes = require("./src/routes/holder")
const issuerRoutes = require("./src/routes/issuer")
const verifierRoutes = require("./src/routes/verifier")
const User = require("./src/models/user");



const connectionString = "mongodb+srv://admin:admin@cluster0.uliun.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const port = process.env.PORT || 3000;
const conn = new driver.Connection('https://198.209.246.80/api/v1');


// mongodb connection
mongoose.connect(connectionString,{useNewUrlParser: true, useUnifiedTopology: true}); 

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:')); 
db.once("open", function(){
   console.log("Connection to DB succeeded");
   //intializeApp();
    app.listen(port, () => {
        console.log("server is up")
    })
});

// middlewares
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
app.use(cors())

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// routes
app.use("/api", authRoutes);
app.use("/api", issuerRoutes);
app.use("/api", holderRoutes);
app.use("/api", verifierRoutes);


app.get("/", (req,res) => {
   return res.json({
       "/api/signup": "Sign up as Holder, Verifer, Issuer"
   })
})

app.post('/create', (req, res) => {
    const fileHash = req.body.fileHash;
    const metaData = req.body.metaData;
    const senderPublicKey = req.body.senderPublicKey;
    const receiverUserId = req.body.receiverUserId;
    const senderUserID = req.body.senderUserID;

    User.findById(receiverUserId, async (err, user) => {
        let txObj = createTxObject({file: fileHash},metaData,senderPublicKey,user.publicKey);
        let signedTx = signTx(txObj, user.privateKey);
        console.log(signedTx);

        let createdTx = await postTransaction(signedTx);

        console.log("created tx", createdTx)
        user.transactions = [...user.transactions,createdTx.id];
        user.save(function (err) {
            if(err) { 
                console.error('ERROR!');
                res.send("Error")
            } else {
                console.log("Created transaction successfully");
                saveTxIdToIssuer(senderUserID, createdTx.id)
                return res.send(createdTx)
            }
        });
    })
});

app.get('/transaction/:id', (req, res) => {
    let txId = req.params.id;
    getTransaction(txId).then( tx => {
        console.log(tx.asset);
        return res.json(tx.asset)
    })
    .catch( err => {
        res.send(err)
    })
})


app.get("/search/:id", (req,res) => {
    let publicKey = req.params.id;
    conn.searchMetadata(publicKey).then( txs => {
        console.log(txs)
       return res.json(txs)
    })
    .catch(err => {
      return  res.send("Couldnt find any")
    })
})

app.post("/email", (req,res) => {
    console.log("request hit");
   let reqBody = JSON.parse( Object.keys(req.body)[0]);
   let responseObj = {email: reqBody.email};
   console.log(responseObj)
    return res.json(
       responseObj
    )
})

// app.get("/reset", (req,res) => {
//     intializeApp();
//     return res.send("Success")
// })


async function intializeApp() {
    // await User.deleteMany(); 

    const issuerKeypair = createKeyPair();
    const issuer  = new User({name: "CVS", userType: "ISSUER", publicKey: issuerKeypair.publicKey, privateKey: issuerKeypair.privateKey });

    const holderKeypair = createKeyPair();
    const holder  = new User({name: "patient", userType: "HOLDER", publicKey: holderKeypair.publicKey, privateKey: holderKeypair.privateKey });

    const verifierKeypair = createKeyPair();
    const verifier  = new User({name: "Airport Management", userType: "VERIFIER", publicKey: verifierKeypair.publicKey, privateKey: verifierKeypair.privateKey });

    issuer.save( function(err,doc) { 
        if(err) return console.error(err); 
        console.log("Issuer saved", doc) 
    });
    holder.save( function(err,doc) { 
      if(err) return console.error(err); 
      console.log("Holder saved", doc) 
    });
    verifier.save( function(err,doc) { 
      if(err) return console.error(err); 
      console.log("Verifier saved") 
    });
}



function createKeyPair() {
    return new driver.Ed25519Keypair()
}

function createTxObject(message, metaData, senderPublicKey, receiverPublicKey) {
    const tx = driver.Transaction.makeCreateTransaction(
        message,
        { metaData: metaData },
        [driver.Transaction.makeOutput(
            driver.Transaction.makeEd25519Condition(receiverPublicKey))],
            senderPublicKey);

        return tx;
}

function signTx(transaction, senderPrivateKey) {
    const txSigned = driver.Transaction.signTransaction(transaction, senderPrivateKey);
    return txSigned
}

function postTransaction(signedTx) {
   return conn.postTransactionCommit(signedTx)
}




function getTransaction(id) {
            return conn.getTransaction(id)
}

function saveTxIdToIssuer(userID, txId) {
    User.findById(userID, async (err, user) => {
        user.transactions = [...user.transactions,txId];
        user.save(function (err) {
            if(err) { 
                console.error('ERROR! while saving txID in iusser account');
            } else {
                console.log("saved transaction in issuer account successfully");
            }
        });
    })
}

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
  });