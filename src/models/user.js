var mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
const crypto = require("crypto");


var userSchema = new mongoose.Schema(
    {
        dhp_id: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },

        public_key: {
            type: String,
            required: true,
            trim: true,
        },
        private_key: {
            type: String,
            required: true,
            trim: true,
        },

        organization_name: {
            type: String,
            required: false
        },

        first_name: {
            type: String,
            required: false,
            trim: true,
        },
        last_name: {
            type: String,
            required: false,
            trim: true,
        },
        middle_name: {
            type: String,
            required: false,
            trim: false,
        },

        phone_number: {
            type: String,
            required: true,
            trim: true,
        },
        verification_id: {
            type: String,
            required: false,
            trim: true
        },
        verification_type: {
            type: String,
            required: false,
            trim: true
        },
        verification_issued_country: {
            type: String,
            required: false,
            trim: true
        },

        verification_issued_date: {
            type: String,
            required: false,
            trim: true
        },
        gender: {
            type: String,
            required: false
        },
        terms_condition: {
            type: Boolean,
            required: true
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        },

        role: {
            type: String,
            default: "",
        },
        salt: String,
        encryptedPassword: {
            type: String,
            required: true
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

userSchema.virtual("password")
    .set(function (password) {
        this._password = password;
        this.salt = uuidv4();
        this.encryptedPassword = this.securePassword(password);
    })
    .get(function () {
        return this._password;
    });

userSchema.methods = {
    securePassword: function (pass) {
        if (pass == "") {
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
    authenticate: function (pass) {
        return this.securePassword(pass) === this.encryptedPassword
    }
}

module.exports = mongoose.model("User", userSchema);
