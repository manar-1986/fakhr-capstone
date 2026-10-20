import mongoose, { Schema, Document } from "mongoose";
import { USER_ROLES } from "../config/constants";

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  role: string;
  authVersion: number;
  isDisabled: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.PARENT,
    },
    authVersion: { type: Number, default: 0, min: 0 },
    isDisabled: { type: Boolean, default: false },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
