// src\app\(site)\(protected)\dashboard\addproduct\page.tsx
'use client';
import Bmv from '@/components/bmv/Bmv';
import React from 'react'

export default function AddProductPage() {


  return ( 
    <div className="w-full">
      <section style={{ marginTop: '20px' }}>
        <h2>انتخاب برند / مدل / رنگ</h2>
        <Bmv
          onChange={({ brandId, modelId, variantId }) => {
            console.log('انتخاب شده‌ها:', { brandId, modelId, variantId });
          }}
          add={true}
        />
      </section>
    </div>
  )
  
}

