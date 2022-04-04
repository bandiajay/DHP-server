const { getTransaction, searchMetaData } = require("../util/bigchaindb");

const TransactionNModel = require("../models/transaction");


exports.getTransactionById = (req, res) => {
    let txId = req.params.txId;
    getTransaction(txId).then( tx => {
        console.log(tx.asset);
        return res.json(tx.asset)
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

