// app/actions/bmv/bmv.ts
"use server";
import {db as prisma } from "@/app/lib/db";
import { actionsGetRes } from "@/types";
import type { Brand, Model, Variant } from "@prisma/client";

export async function GetBrands(): Promise<actionsGetRes<Brand[]>> {
  try {
    const brands = await prisma.brand.findMany();
    console.log("Brands fetched:", brands);
    if (!brands.length) {
      return { data: [], error: true, message: "هیچ برندی یافت نشد", success: false };
    }
    return { data: brands, error: false, message: "اطلاعات برندها دریافت شد", success: true };
  } catch (error) {
    console.error("Error fetching brands:", error);
    return { data: [], error: true, message: "خطا در دریافت برندها", success: false };
  }
}

export async function GetModels(brandId: string): Promise<actionsGetRes<Model[]>> {
  try {
    if (!brandId || !/^[0-9a-fA-F]{24}$/.test(brandId)) {
      console.log("Invalid brandId:", brandId);
      return { data: [], error: true, message: "شناسه برند نامعتبر است", success: false };
    }
    // چک وجود برند
    const brand = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) {
      console.log("Brand not found for id:", brandId);
      return { data: [], error: true, message: "برند یافت نشد", success: false };
    }
    const models = await prisma.model.findMany({
      where: { brandId },
    });
    console.log("Models fetched for brand", brandId, ":", models);
    return { data: models, error: false, message: "اطلاعات مدل‌ها دریافت شد", success: true };
  } catch (error) {
    console.error("Error fetching models:", error);
    return { data: [], error: true, message: "خطا در دریافت مدل‌ها", success: false };
  }
}

export async function GetVariants(modelId: string): Promise<actionsGetRes<Variant[]>> {
  try {
    if (!modelId || !/^[0-9a-fA-F]{24}$/.test(modelId)) {
      console.log("Invalid modelId:", modelId);
      return { data: [], error: true, message: "شناسه مدل نامعتبر است", success: false };
    }
    // چک وجود مدل
    const model = await prisma.model.findUnique({ where: { id: modelId } });
    if (!model) {
      console.log("Model not found for id:", modelId);
      return { data: [], error: true, message: "مدل یافت نشد", success: false };
    }
    const variants = await prisma.variant.findMany({
      where: { modelId },
    });
    console.log("Variants fetched for model", modelId, ":", variants);
    return { data: variants, error: false, message: "اطلاعات واریانت‌ها دریافت شد", success: true };
  } catch (error) {
    console.error("Error fetching variants:", error);
    return { data: [], error: true, message: "خطا در دریافت واریانت‌ها", success: false };
  }
}