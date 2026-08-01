import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  email?: string;
  phone?: string;
  otp: string;         // Hashed OTP (never store plaintext OTP)
  name?: string;
  // SECURITY: 'password' field has been intentionally removed.
  // The OTP collection is a temporary transient store — storing plaintext passwords
  // here even briefly violates PCI-DSS and creates an unnecessary credential exposure
  // window. The calling code must hash passwords BEFORE creating an OTP record,
  // or use a separate flow that does not pass raw passwords through this collection.
  createdAt: Date;
}

const OTPSchema: Schema = new Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    // The OTP value stored here should be hashed (e.g. bcrypt) before insertion.
    // Never store the raw OTP in plaintext — treat it like a password.
    otp: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    // 'password' field removed — see interface comment above
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // Document automatically expires after 10 minutes (TTL index)
    },
  },
  { timestamps: true }
);

OTPSchema.index({ email: 1, otp: 1 });
OTPSchema.index({ phone: 1, otp: 1 });

export default mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);


