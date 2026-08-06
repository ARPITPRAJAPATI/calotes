// Import mongoose utilities, Schema builder, model, and models caching registry from mongoose library
import mongoose, { Schema, model, models } from 'mongoose';
import './User';
import './Product';

// Define a schema for individual items added to a specific checkout purchase order
const OrderItemSchema = new Schema({
  // ObjectId referencing the specific Product collection document
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product', // Establish relationship mapping to Product model
    required: true,
  },
  name: String,     // Snapshot name of the item at checkout (protects history if product name updates)
  price: Number,    // Snapshot purchase price
  quantity: Number, // Number of items ordered
  size: String,     // Selected garment size (e.g. S, M, L, OS)
  image: String,    // Primary image thumbnail URL
});

// Define the details schema configuration for the order shipping location
const ShippingAddressSchema = new Schema({
  fullName: String,
  street: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  phone: String,
});

// Define the root Order Schema capturing payment status, customer, and shipping details
const OrderSchema = new Schema(
  {
    // Reference mapping the customer user record who placed this order
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Maps relationship to User database collection
      required: true,
    },
    // Array list containing one or more ordered garment items
    items: [OrderItemSchema],
    // The final computed order cost total in INR
    totalAmount: {
      type: Number,
      required: true,
    },
    // Address detail record utilizing the ShippingAddressSchema subdocument
    shippingAddress: ShippingAddressSchema,
    // Status tracking phase of payment resolution
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Partial Paid', 'Failed', 'Refunded'], // Enforce status values
      default: 'Pending', // Defaults to Pending until Razorpay webhook/signature verification resolves
    },
    // Payment mode chosen (Full Online vs Partial COD)
    paymentMethod: {
      type: String,
      enum: ['Full Online', 'Partial COD'],
      default: 'Full Online',
    },
    // Actual amount paid online via Razorpay (INR)
    paidAmount: {
      type: Number,
      default: 0,
    },
    // Remaining balance due on delivery (Cash/UPI to courier)
    codAmountDue: {
      type: Number,
      default: 0,
    },
    // COD handling fee charged (INR)
    codFee: {
      type: Number,
      default: 0,
    },
    // Logistics fulfillment tracking phase
    orderStatus: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'], // Enforce status values
      default: 'Processing',
    },
    // Razorpay transaction identifiers (vital for payment dispute resolution and analytics)
    razorpayOrderId: {
      type: String, // The Order ID created via Razorpay Backend API
    },
    razorpayPaymentId: {
      type: String, // The Payment ID returned on successful signature verification
    },
    razorpaySignature: {
      type: String, // HMAC-SHA256 signature validating source authenticity of payment completion
    },
  },
  // Automatically track createdAt and updatedAt timestamps for order management
  { timestamps: true }
);

// Cache compiled model instance or compile a new model matching 'Order' key
const Order = models.Order || model('Order', OrderSchema);

// Export compiled Order model
export default Order;

