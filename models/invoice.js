var mongoose = require("mongoose");

var invoiceSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // orderId: {
    //   type: String,
    //   required: true
    // },
    amount: {
        type: Number,
        required: true
    },
    isPaid: {
        type: Boolean
    },
    paidToEmail: {
        type: String,
        required: true
    },
    paidToNo: {
        type: String,
        required: true
    },
    clientAddress: {
      type: String,
      required: true
    },
    invoiceAddress: {
        type: String,
        required: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);