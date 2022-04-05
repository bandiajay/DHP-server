const express =require("express");
const { body } = require("express-validator");
const { getUserById, isUserSignedIn, isSessionValid, getUserByDHPId, isIssuer } = require("../controllers/auth");
const { searchPatient, newPatientReq } = require("../controllers/issuer");
const router = express.Router();

router.param("userId", getUserById);
router.param("patientId", getUserByDHPId);

router.post("/intake/:userId", isUserSignedIn, isSessionValid, isIssuer, newPatientReq);
router.get("/search/:patientId/:userId", isUserSignedIn, isSessionValid,isIssuer, searchPatient);

module.exports = router;