var mongoose = require("mongoose");


var transactionSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: String,
      required: true,
    },
    issuer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    holder_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    info: {
    }
  },
  { timestamps: true }
);




module.exports = mongoose.model("Transaction", transactionSchema);
