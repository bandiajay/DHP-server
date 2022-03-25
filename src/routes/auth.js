const express =require("express");
const { body } = require("express-validator");
const router = express.Router();

const {signupUser, getUserById, signin, signout, isUserSignedIn, isSessionValid, isUserAdmin, activateUser, deActivateUser} = require("../controllers/auth")

router.param('userId', getUserById);

router.post('/user/signup',body('email').isEmail(), body('password').isLength({min: 5, max: 32}),body('firstname').isLength({min:5}),signupUser);
router.post( '/signin', body('email').isEmail(), body('password').isLength({min: 5, max: 32}),signin);
router.post( '/signout', signout);
router.post('/activate/:userId',isUserSignedIn, isSessionValid, isUserAdmin, activateUser);
router.post('/deactivate/:userId',isUserSignedIn, isSessionValid, isUserAdmin, deActivateUser);

module.exports = router;
