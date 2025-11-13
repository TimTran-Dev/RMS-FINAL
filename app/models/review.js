import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewSchema = new Schema({
  reviewerEmail: { type: String, required: true },
  pros_review: { type: String, required: true },
  cons_review: { type: String, required: true },
  rating: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId },
  schoolId: { type: Schema.Types.ObjectId }
});

export default mongoose.model("Review", reviewSchema);
