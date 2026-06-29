// Import mongoose utilities, Schema builder, model, and models caching registry from mongoose package
import mongoose, { Schema, model, models } from 'mongoose';

// Define the CategorySchema configuration detailing product categorization tags
const CategorySchema = new Schema(
  {
    // Display name of the category (e.g. Outerwear, Denim, Accessories)
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true, // Prevents duplicate category name records
    },
    // URL-friendly lowercase string segment representing the category in listing query parameters
    slug: {
      type: String,
      required: true,
      unique: true, // Ensures index integrity
    },
    // Brief details describing what type of archive garments belong in this category
    description: String,
    // Header banner or thumbnail image URL for category pages
    image: String,
    // Self-referencing schema key allowing hierarchical nested categorization
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category', // Map relationship back to same Category model collection
      default: null,    // Null defaults mean this is a root category (no parent)
    },
  },
  // Automatically manage createdAt and updatedAt timestamps for category auditing
  { timestamps: true }
);

// Cache compiled model instance or compile a new model matching 'Category' key
const Category = models.Category || model('Category', CategorySchema);

// Export compiled Category model
export default Category;

