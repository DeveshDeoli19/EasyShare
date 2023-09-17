const mongoose = require("mongoose")

const File = new mongoose.Schema({
  path: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  password: String,
  uniqueKey:{
    type : Number,
    required: true,
    unique:true
  }
})

module.exports = mongoose.model("File", File)
