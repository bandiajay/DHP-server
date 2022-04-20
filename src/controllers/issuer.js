
const User = require('../models/user');
const TransactionNModel = require("../models/transaction");

const { postTransaction, signTx, createTxObject } = require('../util/bigchaindb');
const { addDataToIpfs } = require('../util/ipfs');
const formidable = require("formidable")
const fs = require('fs');

exports.searchPatient = (req, res) => {
    return res.json(req.patient);
}

exports.newPatientReq = async (req, res ) => {
    const issuer = req.profile;
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.log(err)
            return res.send("failed while parsing form")
        }
        const testInfo = JSON.parse(fields.metaData);
        const patientDHPId = fields.holderDHPId;
        const file = files.file;
        let obj = {};
        obj.content = fs.readFileSync(file.filepath);
        obj.contentType = file.type;
        console.log("sedning file to ipfs ...")
        const fileHash = await addDataToIpfs(obj).catch(
            err => {
                return res.send("failed while saving file")
            }
        )
   
    User.find({dhp_id: patientDHPId})
    .exec( async (err, results) => {
        if(err || results.length == 0) {
            return res.status(400).json({
                error: "No patient found with DHP Id " + patientDHPId
            })
        } 
       const holder = results[0];
       const metaData = holder.public_key;
        let txObj = createTxObject({file: fileHash},metaData,issuer.public_key,holder.public_key);
        console.log(txObj)
        let signedTx = signTx(txObj, issuer.private_key);
        console.log("signed tx: "+ signedTx);
        let createdTx = await postTransaction(signedTx).catch( err => {
            console.log("error while commiting transaction ", err);
             return res.status(500).json({
                error: "Something went wrong. Please try agian."
            })
        });
        console.log("tx commited");

        const transaction = new TransactionNModel({transaction_id: createdTx.id, issuer_id: issuer._id, holder_id: holder._id});
        transaction.info = {...testInfo}
        transaction.save( (err, tx) => {
            if(err) {
                return res.status(500).json({
                    error: "Something went wrong. Please try agian."
                })
            }
            return res.json(tx)
        })

     })
    })
}




 
