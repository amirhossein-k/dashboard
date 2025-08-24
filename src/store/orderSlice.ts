import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {InvoiceProduct} from '@prisma/client'
interface order{
    orderProduct: InvoiceProduct[]
}

const  initialState : order ={
    orderProduct:[]
}

const orderSlice = createSlice({
    name:"order",
    initialState,
    reducers:{
        setOrderProduct :(state,action:PayloadAction<InvoiceProduct[]>)=>{
            state.orderProduct = action.payload
        }
    }
})

export const {setOrderProduct } =orderSlice.actions
export default orderSlice.reducer