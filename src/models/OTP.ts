import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  name: string;
  password: string;
  createdAt: Date;
}

const OTPSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // Document automatically expires after 10 mins
    },
  },
  { timestamps: true }
);

OTPSchema.index({ email: 1, otp: 1 });

export default mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);
