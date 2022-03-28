var mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
const crypto = require("crypto");


var userSchema = new mongoose.Schema(
    {
        dhp_id: {
            type: String,
            required: true,
            trim: true,
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

        first_name: {
            type: String,
            required: true,

            trim: true,
        },
        last_name: {
            type: String,
            required: true,
            trim: true,
        },
        middle_name: {
            type: String,

            trim: true,
        },

        phone_number: {
            type: String,

            trim: true,
        },
        verification_id: {
            type: String,
            required: true,
            trim: true
        },
        verification_type: {
            type: String,
            required: true,
            trim: true
        },
        verification_issued_country: {
            type: String,
            required: true,
            trim: true
        },

        verification_issued_date: {
            type: String,
            required: true,
            trim: true
        },
        verification_issued_date: {
            type: String,
            required: true,
            trim: true
        },
        gender: {
            type: Boolean,
            required: true

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
            type: Array,
            default: ["USER"],
        },
        salt: String,
        encryptedPassword: {
            type: String,
            required: true
        },
        active: {
            type: Boolean,
            default: false
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
