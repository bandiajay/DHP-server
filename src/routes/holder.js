const express =require("express");
const { body } = require("express-validator");
const { isUserSignedIn, isSessionValid, isHolder, getUserById } = require("../controllers/auth");

const { getTransactionById, getAllTransactions, getTxById } = require("../controllers/holder");
const router = express.Router();

router.param("userId", getUserById);


router.get('/transaction/:txId/:userId', isUserSignedIn, isSessionValid, isHolder , getTransactionById);


router.get("/search/all/:userId", isUserSignedIn, isSessionValid, isHolder ,getAllTransactions);

module.exports = router;