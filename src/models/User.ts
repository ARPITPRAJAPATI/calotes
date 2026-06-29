// Import mongoose utilities, Schema builder, model, and models caching registry from mongoose package
import mongoose, { Schema, model, models } from 'mongoose';

// Define a subdocument schema for storing user shipping address history
const AddressSchema = new Schema({
  street: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  isDefault: { type: Boolean, default: false }, // Boolean flag checking if this is the primary checkout address
});

// Define the root User Schema capturing customer and administrative credentials
const UserSchema = new Schema(
  {
    // The user's full name
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    // Unique contact email address, enforced in lowercase for matching consistency
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required'],
      lowercase: true, // Forces input to lower-case (prevents "User@Email.com" vs "user@email.com" duplicates)
    },
    // Encrypted password string. Optional because users signing in via Google OAuth will not have passwords.
    password: {
      type: String,
      select: false, // Ensures password is excluded from standard find queries unless explicitly requested using select("+password")
    },
    // Access permission level determining administrative capabilities
    role: {
      type: String,
      enum: ['customer', 'admin'], // Restricts role values to valid access settings
      default: 'customer',
    },
    // URL pointing to the user's custom profile avatar image
    avatar: {
      type: String,
      default: '',
    },
    // Telephone number
    phone: {
      type: String,
      default: '',
    },
    // List of saved shipping addresses utilizing the AddressSchema subdocument
    addresses: [AddressSchema],
    
    // List of saved product references (separate from client-side wishlist context, for future server-side syncing)
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product', // Links relationship to Product collection
      },
    ],
    
    // NextAuth integration property tracking email verification timestamps (required by adapter specs)
    emailVerified: {
      type: Date,
      default: null,
    },
    // NextAuth integration property tracking OAuth provider profile picture URLs
    image: {
      type: String,
    },
  },
  // Automatically manage createdAt and updatedAt timestamps for users
  { timestamps: true }
);

// Retrieve cached User model or compile a new model instance if it hasn't been compiled
const User = models.User || model('User', UserSchema);

// Export compiled User model
export default User;

