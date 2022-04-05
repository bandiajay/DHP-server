const express =require("express");
const { body } = require("express-validator");
const router = express.Router();

const {signupUser, getUserById, signin} = require("../controllers/auth")

router.param('userId', getUserById);

router.post('/signup',body('email').isEmail(), body('password').isLength({min: 5, max: 32}),signupUser);
router.post( '/signin', body('email').isEmail(), body('password').isLength({min: 5, max: 32}),signin);


module.exports = router;
