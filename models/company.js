var mongoose = require("mongoose");

var companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    logoAddress: {
        type: String,
        required: true
    },
    templateType: {
        type: Number
    },
    address: {
      type: String,
      required: true
    },
    paidToEmail: {
      type: String,
      required: true
    },
    paidToNo: {
        type: String,
        required: true
    },
    handler: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);