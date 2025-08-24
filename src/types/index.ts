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

}

export type InvoiceProduct = {
  id: string;
  order: Product[]
  idOrder: string
  status: OrderStatus
  countOrder: number;
  total: number;
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
  quantity?: string
  id: string
  content?: string | null
  title: string
  published: boolean
  price: number
  priceWithProfit?: number
  count: number
  countproduct: number
  priceOffer: number
  author?: USERTYPE
  authorId: string
  createdAt: Date
  updatedAt: Date
  productImage: PHOTO[]
  categoryList: Category[]
  review: Review[]
  tags: string[]
  // tableContent?: string; // اختیاری کردن tableContent
  tableContent: string | null
  supplierId?: string
  supplier?: Supplier
}

export interface Supplier {
  id: string
  name: string
  password: string
  phone: string
  address?: string
  products: Product[]
  createdAt: Date
  updatedAt: Date
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