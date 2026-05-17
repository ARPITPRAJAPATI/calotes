import mongoose, { Schema, model, models } from 'mongoose';

const PromoCodeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
    discountValue: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    minOrderAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const PromoCode = models.PromoCode || model('PromoCode', PromoCodeSchema);

export default PromoCode;
