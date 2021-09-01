var mongoose = require("mongoose");

var productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    price: {
        type: String,
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);