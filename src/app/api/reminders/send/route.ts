import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/reminders/send - Send reminders to suppliers
export async function POST(request: NextRequest) {
    try {
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

        // Find suppliers who need reminders
        const suppliers = await prisma.supplier.findMany({
            where: {
                reminderFrequency: 'daily',
                reminderTime: currentTimeString
            },
            include: {
                products: true
            }
        });

        const remindersSent = [];

        for (const supplier of suppliers) {
            // Check if supplier has products that need updating
            const outdatedProducts = supplier.products.filter(product => {
                if (!product.lastUpdatedBySupplier) return true;

                const daysSinceUpdate = Math.floor(
                    (currentTime.getTime() - new Date(product.lastUpdatedBySupplier).getTime()) / (1000 * 60 * 60 * 24)
                );
                return daysSinceUpdate > 1;
            });

            if (outdatedProducts.length > 0) {
                // Send reminder (implement your notification logic here)
                await sendReminderNotification(supplier, outdatedProducts);

                // Update last reminder sent time
                await prisma.supplier.update({
                    where: { id: supplier.id },
                    data: { lastReminderSent: currentTime }
                });

                remindersSent.push({
                    supplierId: supplier.id,
                    supplierName: supplier.name,
                    outdatedProductsCount: outdatedProducts.length
                });
            }
        }

        return NextResponse.json({
            message: `Sent ${remindersSent.length} reminders`,
            remindersSent
        });
    } catch (error) {
        console.error('Error sending reminders:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendReminderNotification(supplier: any, products: any[]) {
    // Implement your notification logic here
    // This could be email, SMS, push notification, etc.
    console.log(`Sending reminder to ${supplier.name} for ${products.length} products`);

    // Example: Log the reminder (replace with actual notification service)
    const productTitles = products.map(p => p.title).join(', ');
    console.log(`Products needing update: ${productTitles}`);

    // You can integrate with services like:
    // - Nodemailer for email
    // - Twilio for SMS
    // - Firebase for push notifications
    // - Slack/Discord webhooks
}

