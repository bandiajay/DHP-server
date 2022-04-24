const express =require("express");
const { body } = require("express-validator");
const router = express.Router();
const { getUserById, isUserSignedIn, isSessionValid, getUserByDHPId, isVerifier } = require("../controllers/auth");
const { getTransactionById, getIPFSURL } = require("../controllers/holder");


router.param("userId", getUserById);
router.get('/transaction/:txId/:userId', isUserSignedIn, isSessionValid , getTransactionById);

router.get('/mtransaction/:txId/:userId', isUserSignedIn, isSessionValid, isVerifier , getIPFSURL);

module.exports = router;