// src/lib/sms.ts
export async function sendSMS(phone: string, message: string) {
  // --- Dev Mode ---
  console.log(`📲 [DEV SMS] به ${phone} پیامک ارسال شد: ${message}`);

  // --- وقتی سامانه RayganSMS گرفتی ---
  /*
  const res = await fetch("https://raygansms.com/SendMessageWithPost.ashx", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      Username: process.env.RAYGAN_USERNAME!,
      Password: process.env.RAYGAN_PASSWORD!,
      PhoneNumber: process.env.RAYGAN_NUMBER!,
      MessageBody: message,
      RecNumber: phone,
      Smsclass: "1",
    }),
  });
  const data = await res.text();
  console.log("RayganSMS response:", data);
  */
}
