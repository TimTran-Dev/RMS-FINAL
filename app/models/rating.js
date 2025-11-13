import mongoose from "mongoose";

const { Schema } = mongoose;

const ratingSchema = new Schema({
  schoolId: { type: Schema.Types.ObjectId },
  userId: { type: Schema.Types.ObjectId },
  rating: { type: Number }
});

export default mongoose.model("Rating", ratingSchema);
