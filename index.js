const driver = require('bigchaindb-driver');
var cors = require('cors')
const base58 = require('bs58');
const crypto = require('crypto');
const { Ed25519Sha256 } = require('crypto-conditions');
const mongoose = require("mongoose");
var express = require('express');
var app = express();
app.use(cors())
var cookieParser = require('cookie-parser');
const { ReturnDocument } = require('mongodb');


const connectionString = "mongodb+srv://admin:admin@cluster0.uliun.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const port = process.env.PORT || 3000;
const conn = new driver.Connection('https://test.ipdb.io/api/v1/');


mongoose.connect(connectionString,{useNewUrlParser: true, useUnifiedTopology: true}); 

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:')); 
db.once("open", function(){
   console.log("Connection to DB succeeded");
   intializeApp();
    app.listen(port, () => {
        console.log("server is up")
    })
});


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req,res) => {
   return res.json({
        "api": {
            "create": "/create",
            "get_transaction_details": "/transaction",
            "issuer": "/issuer",
            "holder": "/holder",
            "verifier": "/verifer"
        }
    })
})

app.post('/create', (req, res) => {
    const fileHash = req.body.fileHash;
    const metaData = req.body.metaData;
    const userID = req.body.userID;


    User.findById(userID, async (err, user) => {
        let txObj = createTxObject({file: fileHash},metaData,user.publicKey);
        let signedTx = signTx(txObj, user.privateKey);

        let createdTx = await postTransaction(signedTx);
        user.transactions = [createdTx.id];
        user.save(function (err) {
            if(err) { 
                console.error('ERROR!');
                res.send("Error")
            } else {
                console.log("Created transaction successfully");
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

app.get('/issuer', (req,res) => {
    User.findOne({userType: "ISSUER"}, (err, user) => {
        if(err) {
          return  res.send("No user")
        } else {
            user.privateKey = undefined;
            return res.send(user)
        }
    })
})

app.get('/holder', (req,res) => {
    User.findOne({userType: "HOLDER"}, (err, user) => {
        if(err) {
          return  res.send("No user")
        } else {
            user.privateKey = undefined;
            return res.send(user)
        }
    })
})

app.get('/verifier', (req,res) => {
    User.findOne({userType: "VERIFIER"}, (err, user) => {
        if(err) {
          return  res.send("No user")
        } else {
            user.privateKey = undefined;
            return res.send(user)
        }
    })
})


async function intializeApp() {
    await User.deleteMany(); 

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
      console.log("Holder saved") 
    });
    verifier.save( function(err,doc) { 
      if(err) return console.error(err); 
      console.log("Verifier saved") 
    });
}



function createKeyPair() {
    return new driver.Ed25519Keypair()
}

function createTxObject(message, metaData, senderPublicKey) {
    const tx = driver.Transaction.makeCreateTransaction(
        message,
        { metaData: metaData },
        [driver.Transaction.makeOutput(
            driver.Transaction.makeEd25519Condition(senderPublicKey))],
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


const userSchema = mongoose.Schema({ 
    name: String,
    userType: String,
    publicKey: String,
    privateKey: String,
    transactions: []
   })

const User = mongoose.model("User", 
userSchema);


function getTransaction(id) {
            return conn.getTransaction(id)
}