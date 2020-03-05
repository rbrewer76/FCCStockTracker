const mongoose = require("mongoose")

const likeSchema = new mongoose.Schema({
  stock: {
    required: true,
    type: String, 
    trim: true,
    min: 3,
    max: 5,
    uppercase: true
  },
  likes: {
    required: true,    
    type: Number,
    default: 0
  },
  ips: [String]
})

const Like = mongoose.model("like", likeSchema)

module.exports = Like