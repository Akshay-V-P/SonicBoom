const mongoose = require('mongoose')
const wishlistSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  items: {
    type: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
        variantId: { type: mongoose.Schema.Types.ObjectId },
        quantity: { type: Number, required: true },
      },
    ],
    default: [],
  },
}, {
    timestamps:true
});


module.exports = mongoose.model("wishlist", wishlistSchema)