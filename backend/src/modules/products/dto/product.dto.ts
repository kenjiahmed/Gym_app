export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  gender: string;
  brand?: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured?: boolean;
  tags?: string[];
}

export class UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  gender?: string;
  brand?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  stock?: number;
  featured?: boolean;
  tags?: string[];
}

export class ProductFilterDto {
  category?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  search?: string;
}
