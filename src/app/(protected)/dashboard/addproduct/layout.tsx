
import React from 'react'

export default async function AddProductLayout({
  children
}: {
  children: React.ReactNode
}) {
  // چون layout یک Server Component هست، می‌تونی اینجا Server Action رو صدا بزنی
//   const brands = await GetBrands() // Server Action → Prisma

  return (
    <div>
      {/* پاس دادن دیتا به Bmv که Client Component هست */}
      {children}
    </div>
  )
}
