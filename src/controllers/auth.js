const User = require("../models/user");
const _ = require("lodash");
const { validationResult, body } = require("express-validator");
const { v4: uuidv4, v4 } = require('uuid');
const jwt = require('jsonwebtoken');
const express_jwt = require("express-jwt")
const driver = require('bigchaindb-driver');
const crypto = require("crypto");
const { profile } = require("console");

exports.getUserById = (req, res, next, id) => {
    User.findById(id)
    .exec((err, user) => {
        if (err) {
            return res.status(400).json({
                error: "User not found"
            });
        }
        removeSensitiveUserData(user);
        req.profile = user;
        next();
    });
}

exports.getUserByDHPId = (req,res,next,id) => {

  User.find({dhp_id: id})
  .exec( (err, results) => {
    if (err || results.length == 0) {
      return res.status(400).json({
          error: "User not found"
      });
    }
    let user = results[0]
    let {first_name, last_name, phone_number,email,dhp_id,_id } = user;
    req.patient = {first_name, last_name, phone_number,email,dhp_id,_id};
    next();
  })
}





exports.signin = (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Bad Payload'
    })
  };
  const {email, password} = req.body;
  User.findOne({email})
  .exec((err, user) => {
    if(err || !user) {
      return res.status(400).json({
        error: 'Couldnt not found user ',
        cause: err
      })
    }

    if(!user.authenticate(password)) {
      return res.status(401).json({
        error: 'invalid password'
      })
    }
    const privateKey = process.env.SEC_PASS ;
    const expiryDate = new Date().setHours(new Date().getHours() + 4);
    const token = jwt.sign({_id: user._id, expiry: Date.now()}, privateKey)
    const { _id, first_name, last_name, email, role, dhp_id, organization_name } = user;
    console.log(user)
    return res.json({ token, user: { _id, first_name, last_name, email, role,organization_name , dhp_id } });
  })

}

exports.signupUser = (req,res) => {
  const errors = validationResult(req);
  // if(!errors.isEmpty()) {
  //   return res.status(400).json({
  //     error: 'Bad Payload'
  //   })
  // };
  if(!req.body.phone_number)
  req.body =JSON.parse(Object.keys(req.body)[0]);
  const payload = {...req.body};

  // generate public, private key
  updatePayloadWithKeypair(payload);

  // generate DHP ID
  payload["dhp_id"] = generateDHPId();

  const user =  new User(payload);
  user.save((err, user) => {
    if(err) {
      console.log("failed creating user", err)
      return res.send("Failed during creating User" + err)
    }
       removeSensitiveUserData(user);
       console.log("user saved to DB: ",user)
        return res.send(user)
    })
}


exports.isUserSignedIn = express_jwt({
  secret: process.env.SEC_PASS,algorithms: ['sha1', 'RS256', 'HS256']
});

exports.isIssuer = (req,res, next ) => {
  if(req.profile.role === "ISSUER") {
    next()
  } else {
    return res.status(401).json({
      error: "UnAuthorized, user has no permission"
  });
  }
}

exports.isHolder = (req,res, next ) => {
  if(req.profile.role === "HOLDER") {
    next()
  } else {
    return res.status(401).json({
      error: "UnAuthorized, user has no permission"
  });
  }
}

exports.isVerifier = (req,res, next ) => {
  if(req.profile.role === "VERIFIER") {
    next()
  } else {
    return res.status(401).json({
      error: "UnAuthorized, user has no permission"
  });
  }
}



exports.isSessionValid = (req, res, next) => {
  let isValid = req.user._id && req.profile._id && (req.user._id == req.profile._id);
  if(!isValid) {
    return res.status(401).json({
      error: "Auth error"
    })
  }
  next();
}

const removeSensitiveUserData = (user) => {
  user.encryptedPassword = undefined;
  user.salt = undefined;
  user.createdAt = undefined;
  user.updatedAt = undefined;
  user.private_key = undefined;
  user.public_key = undefined;
}

function updatePayloadWithKeypair(payload) {
  let issuerKeypair = new driver.Ed25519Keypair();
  payload["private_key"] = issuerKeypair.privateKey;
  payload["public_key"] = issuerKeypair.publicKey;
}

function generateDHPId() {
  let id = uuidv4().split("-")[0];
  return `DHP-${id}`;
}



  exports.activateUser = (req,res) => {
    User.findOneAndUpdate(
      {_id: req.body.customerId}, {$set: {active: true}}, { new: true },
      (err, user) => {
        if(err) {
          return res.send("Not updated")
        } 
        return res.send("Successfully updated")
      }
    )
  }

