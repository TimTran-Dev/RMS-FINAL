import mongoose from "mongoose";
import bcrypt from "bcrypt-nodejs";

const { Schema } = mongoose;

const userSchema = new Schema({
  local: {
    email: String,
    password: String
  },
  photo: String,
  name: String,
  school: String
});

// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

export default mongoose.model("User", userSchema);
