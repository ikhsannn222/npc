const API_URL = 'http://localhost:3000/api';

export const api = {
  getComponents: async () => {
    try {
      const response = await fetch(`${API_URL}/components`);
      if (!response.ok) throw new Error('Failed to fetch components');
      const data = await response.json();
      // Ensure price is a number
      return data.map((item: any) => ({
        ...item,
        price: Number(item.price)
      }));
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  createComponent: async (component: any) => {
    const response = await fetch(`${API_URL}/components`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(component),
    });
    if (!response.ok) throw new Error('Failed to create component');
    return await response.json();
  },

  updateComponent: async (id: number, component: any) => {
    const response = await fetch(`${API_URL}/components/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(component),
    });
    if (!response.ok) throw new Error('Failed to update component');
    return await response.json();
  },

  deleteComponent: async (id: number) => {
    const response = await fetch(`${API_URL}/components/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete component');
    return await response.json();
  },

  getMonitors: async () => {
    try {
      const response = await fetch(`${API_URL}/monitors`);
      if (!response.ok) throw new Error('Failed to fetch monitors');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  }
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};
