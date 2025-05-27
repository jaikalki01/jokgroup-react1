import axios from 'axios';
import { Product, User, Category, Coupon } from '../types';

export const BASE_URL = 'http://localhost:8000/api/v1'; // Include /v1 here

export const products = async (): Promise<Product[]> => {
  const res = await axios.get<Product[]>(`http://localhost:8000/api/v1/product/list`);
  return res.data;
};

export const categories = async (): Promise<Category[]> => {
  const res = await axios.get<Category[]>(`${BASE_URL}/category`);
  return res.data;
};
// api.ts
export const getCategories = async (): Promise<Category[]> => {
  const res = await axios.get<Category[]>(`${BASE_URL}/cat/category`);
  return res.data;
};


export const users = async (): Promise<User[]> => {
  const res = await axios.get<User[]>(`${BASE_URL}/users`);
  return res.data;
};



export const coupons = async (): Promise<Coupon[]> => {
  const res = await axios.get<Coupon[]>(`http://localhost:8000/api/v1/coupon`);
  return res.data;
};
