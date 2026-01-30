export interface Monitor {
  id: number;
  title: string;
  description: string;
  resolution: string;
  refresh_rate: number;
  panel_type: string;
  screen_size: number;
  price: number;
  rating: number;
  featured: boolean;
  image_url: string;
  marketplace_links?: {
    shopee?: string;
    tokopedia?: string;
    lazada?: string;
  };
}
