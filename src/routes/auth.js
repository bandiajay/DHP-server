const express =require("express");
const { body } = require("express-validator");
const router = express.Router();

const {signupUser, getUserById, signin} = require("../controllers/auth")

router.param('userId', getUserById);

router.post('/issuer/signup',body('email').isEmail(), body('password').isLength({min: 5, max: 32}),body('firstname').isLength({min:5}),signupUser);
router.post('/holder/signup',body('email').isEmail(), body('password').isLength({min: 5, max: 32}),body('firstname').isLength({min:5}),signupUser);
router.post('/verifier/signup',body('email').isEmail(), body('password').isLength({min: 5, max: 32}),body('firstname').isLength({min:5}),signupUser);
router.post( '/signin', body('email').isEmail(), body('password').isLength({min: 5, max: 32}),signin);


module.exports = router;
