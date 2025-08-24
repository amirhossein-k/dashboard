'use client'

import { actionsGetRes } from '@/types'
import { Brand, Model, Variant } from '@prisma/client'
import React, { useEffect, useState } from 'react'

interface AddBmvProps {
    brands: actionsGetRes<Brand[]>
    models: actionsGetRes<Model[]>
    variants: actionsGetRes<Variant[]>
    onChange?: (selection: {
        brandId: string | null;
       
    }) => void;
}

const AddBmv = ({ brands, models, variants, onChange }: AddBmvProps) => {
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null)


    // وقتی هر انتخاب تغییر کرد، callback والد را صدا بزن
    useEffect(() => {
        onChange?.({
            brandId: selectedBrand,
            
        })
    }, [selectedBrand, onChange]
    )
    console.log(models, 'models')
    console.log(brands, 'brands')
    const add = () => {
        console.log('object')

    }
    return (
        <div className="container mx-auto p-4" dir='rtl'>

            {/* فرم اضافه کردن برند */}
            <form action={add} className="mb-6">
                <label>نام برند:</label>
                <input type="text" name="name" className="border p-2" required />
                <button type="submit" className="bg-blue-500 text-white p-2">اضافه کردن برند</button>
            </form>
            {/* فرم اضافه کردن مدل */}
            <form action={add} className='mb-6'>
                <label htmlFor="" >برند</label>
                <select name="brandId" className='border p-2'>
                    {brands.data.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                </select>
                <label>نام مدل:</label>
                <input type="text" name='name' className='border p-2' required />
                <button type='submit' className='bg-blue-500 text-white p-2'>اضافه کردن مدل</button>
            </form>
            {/* فرم اضافه کردن رنگ و موجودی */}
            <form action={add} className="mb-6">
                <label htmlFor="" >برند</label>
                <select name="brandId" className='border p-2'
                    value={selectedBrand || ''}
                    onChange={(e) => {
                        setSelectedBrand(e.target.value || null);
                        
                    }}
                >
                    {brands.data.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                </select>
                <label>مدل:</label>
                <select name="modelId" className="border p-2">
                    {models.data.map((model) => (
                        <option key={model.id} value={model.id}>{model.name} ({model.name})</option>
                    ))}
                </select>
                <label>موجودی:</label>
                <input type="number" name="inventory" className="border p-2" required />
                <label>رنگ:</label>
                <input type="text" name="color" className="border p-2" required />
                <button type="submit" className="bg-blue-500 text-white p-2">اضافه کردن رنگ و موجودی</button>
            </form>
        </div>
    )
}

export default AddBmv
