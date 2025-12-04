import { defineStore } from 'pinia';
import { ref } from 'vue';
// import { useI18n } from 'vue-i18n';
import i18n from '@/i18n';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  stock: number;
}

export const useProductsStore = defineStore('products', () => {
  // const i18n = useI18n();
  const products = ref<Product[]>([
    {
      id: 1,
      name: 'iPhone 15 Pro',
      price: 8999,
      image:
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      description: i18n.t(
        '最新款 iPhone，配备 A17 Pro 芯片，钛金属设计，专业级摄影系统。',
      ),
      category: i18n.t('手机'),
      stock: 50,
    },
    {
      id: 2,
      name: 'MacBook Pro 14"',
      price: 14999,
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
      description: 'M3 芯片，14 英寸 Liquid Retina XDR 显示屏，专业性能。',
      category: '电脑',
      stock: 30,
    },
    {
      id: 3,
      name: 'AirPods Pro',
      price: 1899,
      image:
        'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400',
      description: '主动降噪，空间音频，MagSafe 充电盒。',
      category: '耳机',
      stock: 100,
    },
    {
      id: 4,
      name: 'iPad Air',
      price: 4399,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
      description:
        'M2 芯片，10.9 英寸 Liquid Retina 显示屏，支持 Apple Pencil。',
      category: '平板',
      stock: 40,
    },
    {
      id: 5,
      name: 'Apple Watch Series 9',
      price: 2999,
      image: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400',
      description: 'S9 SiP 芯片，全天候视网膜显示屏，健康监测功能。',
      category: '手表',
      stock: 60,
    },
    {
      id: 6,
      name: 'Magic Keyboard',
      price: 899,
      image:
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
      description: '全尺寸键盘，背光按键，舒适的打字体验。',
      category: '配件',
      stock: 80,
    },
    {
      id: 7,
      name: 'Studio Display',
      price: 11499,
      image:
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
      description:
        '27 英寸 5K 视网膜显示屏，True Tone 技术，内置摄像头和扬声器。',
      category: '显示器',
      stock: 20,
    },
    {
      id: 8,
      name: 'HomePod mini',
      price: 749,
      image:
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
      description: '360 度音频，Siri 语音助手，智能家居控制中心。',
      category: '音响',
      stock: 70,
    },
  ]);

  function getProductById(id: number): Product | undefined {
    return products.value.find((p) => p.id === id);
  }

  function getProductsByCategory(category: string): Product[] {
    if (!category) return products.value;
    return products.value.filter((p) => p.category === category);
  }

  return {
    products,
    getProductById,
    getProductsByCategory,
  };
});
