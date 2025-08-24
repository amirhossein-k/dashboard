'use server'
import { db as prisma } from '@/app/lib/db'; // مسیر نسبی

export async function cleanExpiredOtps() {
    try {
        const deleted = await prisma.oTP.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        return { success: true, message: `Deleted ${deleted.count} expired OTPs` };
    } catch (error) {
        console.error('Error cleaning up expired OTPs:', error);
        throw new Error('Failed to clean up expired OTPs');
    }
}