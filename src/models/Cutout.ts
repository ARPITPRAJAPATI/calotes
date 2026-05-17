import { model, models, Schema } from 'mongoose';

/**
 * Stores the Cloudinary URL of an AI-extracted transparent cutout for a product.
 * Once a cutout is generated (by any user), it is stored here so all
 * subsequent users receive the cutout instantly (0ms AI processing).
 */
const CutoutSchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // Original product image URL (for reference)
    originalUrl: { type: String, required: true },
    // Cloudinary URL of the AI-extracted transparent PNG
    cutoutUrl: { type: String, required: true },
  },
  { timestamps: true }
);

const Cutout = models.Cutout || model('Cutout', CutoutSchema);
export default Cutout;
