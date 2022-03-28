var mongoose = require("mongoose");


var transactionSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      maxlength: 32
    }
  },
  { timestamps: true }
);




module.exports = mongoose.model("Transaction", transactionSchema);
