import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
        },
        include: {
          cartItems: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    return cart;
  }

  async addToCart(userId: string, data: AddToCartDto) {
    // Get or create cart
    const cart = await this.getOrCreateCart(userId);

    // Verify product exists and has stock
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < data.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // Check if item already exists in cart with same size/color
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
        size: data.size,
        color: data.color,
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + data.quantity;
      
      if (product.stock < newQuantity) {
        throw new BadRequestException('Insufficient stock for requested quantity');
      }

      const updatedItem = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: true,
        },
      });

      return this.getOrCreateCart(userId);
    }

    // Add new item
    await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: data.productId,
        quantity: data.quantity,
        size: data.size,
        color: data.color,
      },
    });

    return this.getOrCreateCart(userId);
  }

  async updateCartItem(userId: string, cartItemId: string, data: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (cartItem.product.stock < data.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: data.quantity },
    });

    return this.getOrCreateCart(userId);
  }

  async removeFromCart(userId: string, cartItemId: string) {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return this.getOrCreateCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getOrCreateCart(userId);
  }

  async getCartSummary(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    let subtotal = 0;
    let itemCount = 0;

    for (const item of cart.cartItems) {
      subtotal += item.product.price * item.quantity;
      itemCount += item.quantity;
    }

    const tax = subtotal * 0.08; // 8% tax
    const shippingCost = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
    const total = subtotal + tax + shippingCost;

    return {
      cart,
      summary: {
        itemCount,
        subtotal,
        tax,
        shippingCost,
        total,
      },
    };
  }
}
