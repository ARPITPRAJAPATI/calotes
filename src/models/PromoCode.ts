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

    // ── Usage Enforcement Fields ───────────────────────────────────────────────
    // Maximum total uses across all users (0 = unlimited)
    usageLimit: { type: Number, default: 0 },
    // Running count of how many times this code has been successfully used.
    // Must be incremented atomically with findOneAndUpdate + $inc to prevent race conditions.
    usageCount: { type: Number, default: 0 },
    // Maximum uses per individual user account (undefined = unlimited per user)
    perUserLimit: { type: Number, default: 1 },
    // Array of user ObjectIds that have redeemed this code (used for per-user limit enforcement)
    usedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // Optional expiry date — code is invalid after this timestamp
    expiresAt: { type: Date, default: null },
  },
  // Automatically manage createdAt and updatedAt fields for tracking creation timestamps
  { timestamps: true }
);

// Index for fast lookup by active status + expiry for the validate endpoint
PromoCodeSchema.index({ code: 1, isActive: 1 });

// Cache compiled model instance or compile a new model matching 'PromoCode' key
const PromoCode = models.PromoCode || model('PromoCode', PromoCodeSchema);

// Export compiled PromoCode model
export default PromoCode;


