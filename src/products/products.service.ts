import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '../../generated/prisma/client';
import { PaginationDto } from 'src/common/dtos';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit{
  private readonly logger = new Logger('ProductsService'); 

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }
  
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    })
  }

  async findAll(paginationDto: PaginationDto) {
    const {limit, page} = paginationDto;
    
    const totalPages = await this.product.count({
      where: {available: true}
    });
    const lastPage = Math.ceil(totalPages / limit) || 1;

    return {
      data: await this.product.findMany({
        take: limit,
        skip: limit * (page - 1),
        where: {available: true}
      }),
      meta: {
        total: totalPages,
        page,
        lastPage
      }
    }
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: {
        id, available: true
      }
    })

    if(!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);
    const {id:__, ...data} = updateProductDto
    
    return this.product.update({
      where: {id},
      data: data
    })
    
  }

  async remove(id: number) {

    await this.findOne(id)
    return this.product.update({
      where: {id},
      data: {available: false}
    })
  }
}
