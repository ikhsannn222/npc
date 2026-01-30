import { ShoppingBag } from "lucide-react";

interface MarketplaceButtonsProps {
  name: string;
  links?: {
    shopee?: string;
    tokopedia?: string;
    lazada?: string;
  };
}

export default function MarketplaceButtons({
  name,
  links,
}: MarketplaceButtonsProps) {
  const getSearchUrl = (platform: "shopee" | "tokopedia" | "lazada") => {
    const encodedName = encodeURIComponent(name);
    switch (platform) {
      case "shopee":
        return `https://shopee.co.id/search?keyword=${encodedName}`;
      case "tokopedia":
        return `https://www.tokopedia.com/search?q=${encodedName}`;
      case "lazada":
        return `https://www.lazada.co.id/catalog/?q=${encodedName}`;
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <a
        href={links?.shopee || getSearchUrl("shopee")}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EE4D2D] text-white text-xs font-bold rounded-lg hover:brightness-110 transition-all shadow-sm flex-1 justify-center min-w-[90px]"
        onClick={(e) => e.stopPropagation()}
      >
        <ShoppingBag size={14} />
        Shopee
      </a>
      <a
        href={links?.tokopedia || getSearchUrl("tokopedia")}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#42B549] text-white text-xs font-bold rounded-lg hover:brightness-110 transition-all shadow-sm flex-1 justify-center min-w-[90px]"
        onClick={(e) => e.stopPropagation()}
      >
        <ShoppingBag size={14} />
        Tokopedia
      </a>
      <a
        href={links?.lazada || getSearchUrl("lazada")}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f146d] text-white text-xs font-bold rounded-lg hover:brightness-110 transition-all shadow-sm flex-1 justify-center min-w-[90px]"
        onClick={(e) => e.stopPropagation()}
      >
        <ShoppingBag size={14} />
        Lazada
      </a>
    </div>
  );
}
