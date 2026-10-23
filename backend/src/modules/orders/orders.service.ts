import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import Stripe from 'stripe';

@Injectable()
export class OrdersService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2026-01-28.clover',
    });
  }

  async createOrder(data: CreateOrderDto) {
    // Calculate totals
    let subtotal = 0;
    const itemsWithPrices = [];

    for (const item of data.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      itemsWithPrices.push({
        ...item,
        price: product.price,
      });
    }

    const tax = subtotal * 0.08; // 8% tax
    const shippingCost = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
    const total = subtotal + tax + shippingCost;

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order in database
    const order = await this.prisma.order.create({
      data: {
        userId: data.userId,
        orderNumber,
        status: 'pending',
        subtotal,
        tax,
        shippingCost,
        total,
        shippingAddress: data.shippingAddress as any, // Cast to any for JSON field
        notes: data.notes,
        orderItems: {
          create: itemsWithPrices.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return order;
  }

  async createOrderFromCart(userId: string, shippingAddress: any) {
    // Get user's cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    // Convert cart items to order items format
    const items = cart.cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));

    // Create the order
    const order = await this.createOrder({
      userId,
      items,
      shippingAddress,
    });

    // Clear the cart
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return order;
  }

  async createPaymentIntent(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Create Stripe payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });

    // Update order with payment intent ID
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentIntentId: paymentIntent.id,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async handlePaymentSuccess(paymentIntentId: string) {
    const order = await this.prisma.order.findFirst({
      where: { paymentIntentId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Update order status
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'paid',
        paymentStatus: 'succeeded',
      },
    });

    // Reduce stock for each item
    for (const item of order.orderItems) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return order;
  }

  async findUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, data: UpdateOrderStatusDto) {
    return this.prisma.order.update({
      where: { id },
      data: {
        status: data.status,
        trackingNumber: data.trackingNumber,
      },
    });
  }
}
