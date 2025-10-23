import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT /api/product/[id]/update-by-supplier - Update product by supplier
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { price, count, supplierId } = body;
        const { id } = params;

        if (!supplierId) {
            return NextResponse.json(
                { error: 'Supplier ID is required' },
                { status: 400 }
            );
        }

        // Verify that the product belongs to the supplier
        const existingProduct = await prisma.product.findFirst({
            where: {
                id,
                supplierId
            }
        });

        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Product not found or not owned by supplier' },
                { status: 404 }
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
            lastUpdatedBySupplier: new Date()
        };

        if (price !== undefined) updateData.price = parseFloat(price);
        if (count !== undefined) updateData.count = parseFloat(count);

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: updateData,
            include: {
                supplier: true,
                productImage: true,
                categoryList: true
            }
        });

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product by supplier:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

