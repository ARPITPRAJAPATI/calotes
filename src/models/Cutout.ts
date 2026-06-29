// Import Schema builder, model compilation, and models cache directory from mongoose library
import { model, models, Schema } from 'mongoose';

/**
 * Stores the Cloudinary URL of an AI-extracted transparent cutout for a product.
 * Once a cutout is generated (by any user), it is stored here so all
 * subsequent users receive the cutout instantly (0ms AI processing).
 */
const CutoutSchema = new Schema(
  {
    // The specific Product identifier this cutout belongs to (typed as String for simple API index key lookups)
    productId: {
      type: String,
      required: true,
      unique: true, // One cutout record per unique product
      index: true,  // Indexed to ensure high-speed API retrieval matching
    },
    // The original product image URL used as the source for background extraction reference
    originalUrl: { type: String, required: true },
    // Cloudinary URL pointing to the transparent background PNG cutout asset
    cutoutUrl: { type: String, required: true },
  },
  // Automatically track creation and modification dates of cutouts
  { timestamps: true }
);

// Cache compiled model instance or compile a new model matching 'Cutout' key
const Cutout = models.Cutout || model('Cutout', CutoutSchema);

// Export compiled Cutout model
export default Cutout;

