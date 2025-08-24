// src\scripts\start_cleanup.ts
// D:\prject\sitenew\src\scripts\start-cleanup.ts
import { db as prisma } from '../app/lib/db'; // مسیر نسبی
import cron from 'node-cron';

async function cleanExpiredOtps() {
    try {
        console.log('Starting cleanup of expired OTPs at', new Date().toISOString());

        const deleted = await prisma.oTP.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });

        console.log(`Cleaned up ${deleted.count} expired OTPs at ${new Date().toISOString()}.`);
    } catch (error) {
        console.error('Error cleaning up expired OTPs:', error);
    }
}

// زمانಮ

// زمان‌بندی برای اجرا هر ۵ دقیقه
cron.schedule('*/5 * * * *', async () => {
    console.log('Running scheduled OTP cleanup at', new Date().toISOString());
    await cleanExpiredOtps();
});

// اجرای فوری برای تست
cleanExpiredOtps();

// نگه داشتن فرآیند در حال اجرا
console.log('OTP cleanup service started at', new Date().toISOString());
// برای اجرای دائمی در سرور، می‌توانید از ابزارهایی مثل pm2 استفاده کنید:
// pm2 start src/scripts/start_cleanup.ts --interpreter=ts-node