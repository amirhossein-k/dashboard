'use client';

import { GetBrands, GetModels, GetVariants } from '@/app/actions/bmv/bmv';
import { actionsGetRes } from '@/types';
import type { Brand, Model, Variant } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import AddBmv from './AddBmv';

interface BmvProps {
  onChange?: (selection: {
    brandId: string | null;
    modelId: string | null;
    variantId: string | null;
  }) => void;
  add: boolean
}

export default function Bmv({ onChange, add }: BmvProps) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  // بارگذاری برندها
  const { data: brands, isLoading: isLoadingBrands, error: brandsError } = useQuery<
    actionsGetRes<Brand[]>
  >({
    queryKey: ['brands'],
    queryFn: GetBrands,
    staleTime: 5 * 60 * 1000,
  });

  // بارگذاری مدل‌ها (وابسته به برند)
  const { data: models, isLoading: isLoadingModels, error: modelsError } = useQuery<
    actionsGetRes<Model[]>
  >({
    queryKey: ['models', selectedBrand],
    queryFn: () => GetModels(selectedBrand!),
    enabled: !!selectedBrand,
    staleTime: 5 * 60 * 1000,
  });

  // بارگذاری واریانت‌ها (وابسته به مدل)
  const { data: variants, isLoading: isLoadingVariants, error: variantsError } = useQuery<
    actionsGetRes<Variant[]>
  >({
    queryKey: ['variants', selectedModel],
    queryFn: () => GetVariants(selectedModel!),
    enabled: !!selectedModel,
    staleTime: 5 * 60 * 1000,
  });

  // لاگ برای دیباگ
  console.log('Brands:', brands);
  console.log('Models:', models);
  console.log('Variants:', variants);
  console.log('Selected:', { selectedBrand, selectedModel, selectedVariant });

  // اطلاع‌رسانی انتخاب‌ها به والد
  useEffect(() => {
    onChange?.({
      brandId: selectedBrand,
      modelId: selectedModel,
      variantId: selectedVariant,
    });
  }, [selectedBrand, selectedModel, selectedVariant, onChange]);

  // شیء پیش‌فرض برای brands, models, variants
  const defaultBrands: actionsGetRes<Brand[]> = {
    data: [],
    error: false,
    message: '',
    success: true,
    isLoading: isLoadingBrands,
  };

  const defaultModels: actionsGetRes<Model[]> = {
    data: [],
    error: false,
    message: '',
    success: true,
    isLoading: isLoadingModels,
  };

  const defaultVariants: actionsGetRes<Variant[]> = {
    data: [],
    error: false,
    message: '',
    success: true,
    isLoading: isLoadingVariants,
  };

  console.log(models, 'modelsssssssss')
  console.log(brands, 'brandsssssssssssss')
  return add ? (
    <AddBmv brands={brands || defaultBrands} models={models || defaultModels} variants={variants || defaultVariants} 
    onChange={({ brandId }) => {
      setSelectedBrand(brandId);

      
    }}
    />
  ) : (
    <div className="space-y-4 text-black">
      {isLoadingBrands && <p className="text-gray-500">منتظر باشید، در حال بارگذاری برندها...</p>}
      {brandsError && <p className="text-red-500">خطا در بارگذاری برندها: {brandsError.message}</p>}
      {!isLoadingBrands && brands && brands.data.length === 0 && !brands.error && (
        <p className="text-gray-500">هیچ برندی یافت نشد</p>
      )}

      <select
        onChange={(e) => {
          setSelectedBrand(e.target.value || null);
          setSelectedModel(null);
          setSelectedVariant(null);
        }}
        value={selectedBrand || ''}
        className="border p-2 w-full"
        disabled={brands?.data.length === 0 || isLoadingBrands}
      >
        <option value="">انتخاب برند</option>
        {(brands || defaultBrands).data.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>

      {selectedBrand && (
        <>
          {modelsError && <p className="text-red-500">{modelsError.message}</p>}
          {isLoadingModels && <p className="text-gray-500">منتظر باشید، در حال بارگذاری مدل‌ها...</p>}
          {!isLoadingModels && models && models.data.length === 0 && !models.error && (
            <p className="text-gray-500">مدلی برای این برند یافت نشد</p>
          )}
          <select
            onChange={(e) => {
              setSelectedModel(e.target.value || null);
              setSelectedVariant(null);
            }}
            value={selectedModel || ''}
            className="border p-2 w-full"
            disabled={models?.data.length === 0 || isLoadingModels}
          >
            <option value="">انتخاب مدل</option>
            {(models || defaultModels).data.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </>
      )}

      {selectedModel && (
        <>
          {variantsError && <p className="text-red-500">{variantsError.message}</p>}
          {isLoadingVariants && <p className="text-gray-500">منتظر باشید، در حال بارگذاری واریانت‌ها...</p>}
          {!isLoadingVariants && variants && variants.data.length === 0 && !variants.error && (
            <p className="text-gray-500">رنگی برای این مدل یافت نشد</p>
          )}
          <select
            value={selectedVariant || ''}
            onChange={(e) => setSelectedVariant(e.target.value || null)}
            className="border p-2 w-full"
            disabled={variants?.data.length === 0 || isLoadingVariants}
          >
            <option value="">انتخاب رنگ</option>
            {(variants || defaultVariants).data.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.color} - موجودی: {variant.inventory}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  )
}