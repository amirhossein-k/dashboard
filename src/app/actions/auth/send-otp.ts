'use server'

import { generateOTP } from "@/app/lib/otp"
import { sendSMS } from "@/app/lib/sms"
import { actionsGetRes } from "@/types";


export async function sendOtpAction(phone: string): Promise<actionsGetRes<null>> {


  const code = await generateOTP(phone)

  await sendSMS(phone, `کد ورود شما: ${code}`); // الان فقط console.log میشه

  return { data: null, success: true, message: "کد ارسال شد", error: false }


}
