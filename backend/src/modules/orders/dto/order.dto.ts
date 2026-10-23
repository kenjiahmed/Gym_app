export class CreateOrderDto {
  userId: string;
  items: OrderItemDto[];
  shippingAddress: ShippingAddressDto;
  notes?: string;
}

export class CreateOrderFromCartDto {
  shippingAddress: ShippingAddressDto;
  notes?: string;
}

export class OrderItemDto {
  productId: string;
  quantity: number;
  size: string;
  color: string;
}

export class ShippingAddressDto {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export class UpdateOrderStatusDto {
  status: string;
  trackingNumber?: string;
}
