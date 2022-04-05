const ipfs =require('ipfs-http-client');
const axios = require("axios")
let client;

async function connectToIPFS() {
    client = await ipfs.create('https://ipfs.infura.io:5001/api/v0');
    console.log("🟢 connected to IPFS network")
}

async function addDataToIpfs(data) {
    try {
        const { path } = await client.add(data);
        return path;
    } catch (error) {
        throw error;
    }

}

 function getDataFromIPFS(hash) {
    const url = `https://ipfs.infura.io/ipfs/${hash}`;
    return  axios.get(url);
}


module.exports = { addDataToIpfs, getDataFromIPFS, connectToIPFS}
