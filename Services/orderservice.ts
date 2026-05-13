import api from './api';

export interface OrderItem {
  id: string;
  productId: string;
  orderId: string;
  quantity: number;
  price: number;
  Product?: {
    name: string;
    image: string | null;
    type: string;
  };
}

export interface Order {
  id: string;
  totalAmount: number;
  shippingAddress: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  createdAt: string;
  OrderItems: OrderItem[];
}

export interface PlaceOrderRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
  addressId?: string;
}

const orderService = {
  /**
   * Place a new order
   * @route POST /api/orders
   */
  placeOrder: async (data: PlaceOrderRequest) => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  /**
   * Get user orders
   * @route GET /api/orders/me
   */
  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders/me');
    return response.data;
  },

  /**
   * Get single order details
   * @route GET /api/orders/:id
   */
  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  }
};

export default orderService;
