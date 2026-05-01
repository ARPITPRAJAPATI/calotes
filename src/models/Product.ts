import mongoose, { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    compareAtPrice: {
      type: Number,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: {
      type: String,
      default: 'Vintage',
    },
    condition: {
      type: String,
      enum: ['Excellent', 'Great', 'Good', 'Fair'],
      default: 'Great',
    },
    sizes: [
      {
        type: String,
      },
    ],
    sku: {
      type: String,
      unique: true,
    },
    stock: {
      type: Number,
      default: 1, // Vintage items are often one-offs
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    measurements: {
      pitToPit: String,
      length: String,
      waist: String,
    },
    tags: [String],
  },
  { timestamps: true }
);

const Product = models.Product || model('Product', ProductSchema);

export default Product;
