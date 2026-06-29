// Import mongoose, Schema builder, model, and models caching registry from mongoose library
import mongoose, { Schema, model, models } from 'mongoose';

// Define the ProductSchema configuration mapping the properties of items in the store
const ProductSchema = new Schema(
  {
    // The descriptive name of the item
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true, // Automatically strip leading/trailing white spaces from name inputs
    },
    // URL-friendly version of the name, used as a unique slug identifier in path routing
    slug: {
      type: String,
      required: true,
      unique: true, // Prevent duplicate slugs in DB to ensure correct details fetching
    },
    // Comprehensive text detailing product story, measurements context, or aesthetic
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    // Active selling price in INR
    price: {
      type: Number, // Mongoose schema defines as Number
      required: [true, 'Price is required'],
    },
    // Strikethrough/comparison pricing for items placed on sales promotions
    compareAtPrice: {
      type: Number,
    },
    // Array of Cloudinary image hosting URLs. At least one image is required.
    images: [
      {
        type: String,
        required: true,
      },
    ],
    // DB reference linking to the associated Category schema model
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category', // Maps relationship to 'Category' database collection
      required: true,
    },
    // Label/Manufacturer brand name (e.g. Levi's, Nike, Carhartt)
    brand: {
      type: String,
      default: 'Vintage',
    },
    // Pre-loved condition level assessing fabric wear and patina grade
    condition: {
      type: String,
      enum: ['Excellent', 'Great', 'Good', 'Fair'], // Enforced enum choice options
      default: 'Great',
    },
    // List of size label options (e.g. S, M, L, XL, OS)
    sizes: [
      {
        type: String,
      },
    ],
    // Unique stock-keeping identifier barcode tracking code
    sku: {
      type: String,
      unique: true,
    },
    // Amount of pieces in warehouse stock
    stock: {
      type: Number,
      default: 1, // Default is 1 because authentic vintage streetwear listings are usually one-of-one
    },
    // Boolean switch to highlight items in editorial showcases on home page
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Specific item physical dimensions (vital for pre-owned sizing guides)
    measurements: {
      pitToPit: String, // Distance in inches across chest seam
      length: String,   // Vertical height in inches from back neck hem to waist
      waist: String,    // Waist circumference in inches (mainly for denim bottoms)
    },
    // Descriptive taxonomy tags for filtering search indexing queries (e.g. streetwear, y2k)
    tags: [String],
  },
  // Automatically manage createdAt and updatedAt timestamp timestamps in MongoDB documents
  { timestamps: true }
);

// Cache the model or compilation if model is already registered in Mongoose memory (prevents compilation duplication on hot-reload)
const Product = models.Product || model('Product', ProductSchema);

// Export compiled Product model
export default Product;

