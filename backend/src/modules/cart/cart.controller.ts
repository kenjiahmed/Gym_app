import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  async getCart(@Request() req) {
    return this.cartService.getOrCreateCart(req.user.userId);
  }

  @Get('summary')
  async getCartSummary(@Request() req) {
    return this.cartService.getCartSummary(req.user.userId);
  }

  @Post('add')
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, addToCartDto);
  }

  @Put('items/:id')
  async updateCartItem(
    @Request() req,
    @Param('id') cartItemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(req.user.userId, cartItemId, updateCartItemDto);
  }

  @Delete('items/:id')
  async removeFromCart(@Request() req, @Param('id') cartItemId: string) {
    return this.cartService.removeFromCart(req.user.userId, cartItemId);
  }

  @Delete('clear')
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.userId);
  }
}
