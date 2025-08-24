
'use server'

import {db as prisma } from "@/app/lib/db"
import { verifyOTP } from "@/app/lib/otp"
  
export async function verifyOtpAction(phone:string,code:string) {
    
    const isValid = await verifyOTP(phone,code)

  if (!isValid) return { success: false, message: "کد نامعتبر یا منقضی است" };

  let user = await prisma.user.findUnique({where:{phoneNumber:phone}})

  if(!user){
    user = await prisma.user.create({
        data:{
            phoneNumber:phone,
            name:"کاربر جدید",
            isVerfied:true
        }
    })
  }
  return {success:true,error:false , data:user}

}


