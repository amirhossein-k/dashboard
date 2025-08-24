
import {db as prisma} from '@/app/lib/db'
import bcrypt from 'bcryptjs'


export async function generateOTP(phone:string) {
    

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = await bcrypt.hash(code,10)

  await prisma.oTP.create({
    data:{
        phone,
        codeHash:hash,
        expiresAt:new Date(Date.now() + 2*60*1000) //2 دقیقه اعتبار
    }
  })

  return code

}

export async function verifyOTP(phone:string,code:string) {

    const otpRecord = await prisma.oTP.findFirst({
        where:{phone},
        orderBy:{createdAt:"desc"}
    })

    if(!otpRecord) return false
    if(otpRecord.expiresAt < new Date()) return false

    return await bcrypt.compare(code,otpRecord.codeHash)

}