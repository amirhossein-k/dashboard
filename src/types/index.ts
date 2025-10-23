import { Prisma } from "@prisma/client"

export interface USERTYPE {
  id: string
  phoneNumber: string
  password: string | null
  name: string | null
  products: Product[]
  createdAt: Date
  isVerfied: boolean;
  listordershop: InvoiceProduct[];
  address: ADRESS[];
  admin: boolean
  purchaseOrders: PurchaseOrder[]
}

export type InvoiceProduct = {
  id: string;
  order: Product[]
  idOrder: string
  status: OrderStatus
  countOrder: number;
  total: number | null;
  odditemTotal: number;
};
export type OrderStatus = 'LOADING' | "SEE" | "POST" | "DONE";


export interface PHOTO {
  id: string
  defaultImage: boolean
  childImage: string
  fileKey: string | null
  ownerId: string | null


}

// رابط جدید برای خروجی با تاریخ‌های فرمت‌شده
export interface FormattedPostType extends Omit<Product, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}


export interface Product {
  quantity?: string | null
  id: string
  content?: string | null
  title: string
  published: boolean
  price: number
  priceWithProfit?: number | null
  count: number
  countproduct: number
  priceOffer: number
  author?: USERTYPE | null
  authorId: string
  createdAt: Date
  updatedAt: Date
  productImage: PHOTO[]
  categoryList: Category[]
  review: Review[]
  tags: string[]
  // tableContent?: string; // اختیاری کردن tableContent
  tableContent?: string | null
  supplierId?: string | null
  supplier?: Supplier | null
  productVariants: ProductVariant[]; // رابطه با ProductVariant
  purchaseOrders: PurchaseOrder[]; // رابطه با PurchaseOrder
}

export interface Supplier {
  id: string
  name: string
  password: string
  phoneNumber: string
  address?: string
  purchaseOrders: PurchaseOrder[]; // رابطه با PurchaseOrder
  products: Product[]
  createdAt: Date
  updatedAt: Date
  lastReminderSent: string | null; // تغییر به string
  reminderFrequency: string | null;
  reminderTime: string | null;
}
export interface Review {
  reviewText: string
  name: string
  email: string
  createdAt: Date
  rating: number
}

export interface Category {
  id: string
  category: string
}

export interface ADRESS {
  location: string;
  state: string;
  zipcode: string;
  id: string
  userId: string
}


export interface CATEGORYLayout {
  id: string
  item?: CATEGORYLayoutITEM[]
  layout: string
  item2?: CATEGORYLayoutITEM[]

}

export interface CATEGORYLayoutITEM {
  id: string
  link: string
  pic: string
  title: string
  subtitle?: string
  count?: string

}
export interface actionsGetRes<T> {
  data: T
  error: boolean
  success: boolean
  message: string
  isLoading?: boolean;// اضافه کردن isLoading

}
export interface PurchaseOrder {
  id: string;
  productId: string;
  supplierId: string;
  storeOwnerId: string;
  quantity: number;
  totalPrice: number;
  invoiceUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}
export interface ProductVariant {
  id: string;
  productId: string;
  variantId: string;
}

// types.ts
export type PublicSupplier = Omit<Supplier, "password">;

// export interface Variant{
//   id:string
//   color: string
//   inventory:number
//   modelId:string
// }

// export interface Model {
//   id: string
//   name:string
// brandId:string
// variants:Variant[]
// }

// export interface Brand{
//   id :string
//   name: string
//   models:Model[]
// }


export type FullPurchaseOrder = Prisma.PurchaseOrderGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: { supplier: true };
        };
      };
    };
    storeOwner: true;
  };
}>;
