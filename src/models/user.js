var mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
const crypto = require("crypto");


var userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    lastname: {
      type: String,
      maxlength: 32,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
   
    role: {
      type: Array,
      default: ["USER"],
    },
    salt: String,
    encryptedPassword: {
      type: String,
      required:true
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

userSchema.virtual("password")
.set(function(password) {
  this._password  = password;
  this.salt = uuidv4();
  this.encryptedPassword = this.securePassword(password);
})
.get(function() {
  return this._password;
});

userSchema.methods = {
  securePassword: function(pass) {
    if(pass == "") {
      return "";
    }
    try {
      return crypto.createHmac("sha256", this.salt)
      .update(pass)
      .digest("hex")
    } catch (error) {
      return "";
    }
  },
  authenticate: function(pass) {
    return this.securePassword(pass) === this.encryptedPassword
  }
}

module.exports = mongoose.model("User", userSchema);
