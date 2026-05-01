import mongoose, { Schema, model, models } from 'mongoose';

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    image: String,
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
  },
  { timestamps: true }
);

const Category = models.Category || model('Category', CategorySchema);

export default Category;
