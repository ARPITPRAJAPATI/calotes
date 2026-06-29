// Import mongoose utilities, Schema builder, model, and models caching registry from mongoose package
import mongoose, { Schema, model, models } from 'mongoose';

// Define the PromoCodeSchema detailing the specifications of valid shopping coupons
const PromoCodeSchema = new Schema(
  {
    // The coupon text input (e.g. VINTAGE10), forced to uppercase and stripped of whitespace
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    // Type of discount to deduct (percentage off subtotal or a flat currency subtraction value)
    discountType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
    // Numerical reduction value (e.g. 10 for 10% off or 500 for ₹500 off)
    discountValue: { type: Number, required: true },
    // Switch to quickly toggle code availability state
    isActive: { type: Boolean, default: true },
    // Minimum cart total value requirement for coupon application eligibility (e.g. order total must be > ₹2999)
    minOrderAmount: { type: Number, default: 0 },
  },
  // Automatically manage createdAt and updatedAt fields for tracking creation timestamps
  { timestamps: true }
);

// Cache compiled model instance or compile a new model matching 'PromoCode' key
const PromoCode = models.PromoCode || model('PromoCode', PromoCodeSchema);

// Export compiled PromoCode model
export default PromoCode;

