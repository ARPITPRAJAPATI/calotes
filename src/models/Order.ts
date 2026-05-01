import mongoose, { Schema, model, models } from 'mongoose';

const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: String,
  price: Number,
  quantity: Number,
  size: String,
  image: String,
});

const ShippingAddressSchema = new Schema({
  fullName: String,
  street: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  phone: String,
});

const OrderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: ShippingAddressSchema,
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
  },
  { timestamps: true }
);

const Order = models.Order || model('Order', OrderSchema);

export default Order;
