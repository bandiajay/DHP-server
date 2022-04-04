const driver = require('bigchaindb-driver');

const conn = new driver.Connection('https://198.209.246.80/api/v1/');


function getTransaction(id) {
    return conn.getTransaction(id)
}

function postTransaction(signedTx) {
    return conn.postTransactionCommit(signedTx)
 }

 function searchMetaData(publickey) {
     return  conn.searchMetadata(publickey);
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

module.exports =   {getTransaction, postTransaction, searchMetaData,  createTxObject, signTx}