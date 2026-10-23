import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: ProductFilterDto = {}) {
    const where: any = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.gender) {
      where.gender = filters.gender;
    }

    if (filters.featured !== undefined) {
      where.featured = filters.featured;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { hasSome: [filters.search] } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { rating: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return products;
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async findFeatured() {
    return this.prisma.product.findMany({
      where: { featured: true },
      take: 8,
      orderBy: { rating: 'desc' },
    });
  }

  async findByCategory(category: string) {
    return this.prisma.product.findMany({
      where: { category },
      orderBy: { rating: 'desc' },
    });
  }

  async findByGender(gender: string) {
    return this.prisma.product.findMany({
      where: { gender },
      orderBy: [
        { featured: 'desc' },
        { rating: 'desc' },
      ],
    });
  }

  async create(data: CreateProductDto) {
    return this.prisma.product.create({
      data,
    });
  }

  async update(id: string, data: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async updateStock(id: string, quantity: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: { stock: product.stock + quantity },
    });
  }
}
