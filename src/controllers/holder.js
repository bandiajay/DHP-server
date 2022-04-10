const { getTransaction, searchMetaData } = require("../util/bigchaindb");

const TransactionNModel = require("../models/transaction");
const { getDataFromIPFS } = require("../util/ipfs");


exports.getTransactionById = (req, res) => {
    let txId = req.params.txId;
    getTransaction(txId).then( tx => {
        console.log(tx.asset);
        getDataFromIPFS(tx.asset.data.file)
        .then(
            response => {
                console.log(response)
                return res.send(response.data)
            }
        )
        .catch( error => {
            console.log(error)
            return res.status(500).json({message: "Something went wrong while fetching file"})
        })
       
    })
    .catch( err => {
        res.send(err)
    })
}

exports.getAllTransactions = (req,res) => {
    // let publicKey = req.profile.public_key;
    // searchMetaData(publicKey).then( txs => {
    //     console.log(txs)
    //    return res.json(txs)
    // })
    // .catch(err => {
    //   return  res.send("Couldnt find any")
    // })

    TransactionNModel.find({holder_id: req.profile._id})
    .exec((err, results) => {
        if(err || results.length == 0) {
            return res.json({
                message: "No Records found"
            })
        }
        results = results.map( r => {
            delete r['issuer_id'];
            return r;
        });
        return res.json(results)
    })
}

