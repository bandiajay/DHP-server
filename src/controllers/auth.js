const User = require("../models/user");
const _ = require("lodash");
const { validationResult, body } = require("express-validator");
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const express_jwt = require("express-jwt")


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
    const privateKey = process.env.SEC_PASS || "dhp-gdp";
    const expiryDate = new Date().setHours(new Date().getHours() + 4);
    const token = jwt.sign({_id: user._id, expiry: Date.now()}, privateKey)
    const { _id, firstname, lastname, email, role } = user;
    return res.json({ token, user: { _id, firstname, email, role, lastname } });
  })

}

exports.signupUser = (req,res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Bad Payload'
    })
  };
  // check user existence
  const user =  new User(req.body);
  user.save((err, user) => {
    if(err) {
      return res.send("Failed during creating User" + err)
    }
       removeSensitiveUserData(user);
        return res.send(user)
    })
}


exports.isUserSignedIn = express_jwt({
  secret: process.env.SEC_PASS,algorithms: ['sha1', 'RS256', 'HS256']
});


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

