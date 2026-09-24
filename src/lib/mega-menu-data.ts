export interface SubMenuLink {
  label: string;
  href: string;
}

export interface SubMenuGroup {
  title: string;
  href?: string;
  items: SubMenuLink[];
}

export interface CategoryMegaMenuConfig {
  slug: string; // matches Category.slug
  title: string;
  allHref: string;
  iconName?: string;
  columns: {
    groups: SubMenuGroup[];
  }[];
}

export const CATEGORY_MEGA_MENUS: Record<string, CategoryMegaMenuConfig> = {
  "tai-nghe-audio": {
    slug: "tai-nghe-audio",
    title: "Tai Nghe",
    allHref: "/category/tai-nghe-audio",
    iconName: "Headphones",
    columns: [
      {
        groups: [
          {
            title: "Thương hiệu tai nghe",
            href: "/category/tai-nghe-audio",
            items: [
              { label: "ASUS", href: "/category/tai-nghe-audio?search=ASUS" },
              { label: "HyperX", href: "/category/tai-nghe-audio?search=HyperX" },
              { label: "Corsair", href: "/category/tai-nghe-audio?search=Corsair" },
              { label: "Razer", href: "/category/tai-nghe-audio?search=Razer" },
              { label: "ONIKUMA", href: "/category/tai-nghe-audio?search=ONIKUMA" },
            ],
          },
          {
            title: "Kiểu tai nghe",
            href: "/category/tai-nghe-audio",
            items: [
              { label: "Tai nghe Over-ear", href: "/category/tai-nghe-audio?search=Over-ear" },
              { label: "Tai nghe Gaming In-ear", href: "/category/tai-nghe-audio?search=In-ear" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Thương hiệu tai nghe",
            href: "/category/tai-nghe-audio",
            items: [
              { label: "AKKO", href: "/category/tai-nghe-audio?search=AKKO" },
              { label: "Rapoo", href: "/category/tai-nghe-audio?search=Rapoo" },
              { label: "Logitech", href: "/category/tai-nghe-audio?search=Logitech" },
              { label: "Edifier", href: "/category/tai-nghe-audio?search=Edifier" },
              { label: "SteelSeries", href: "/category/tai-nghe-audio?search=SteelSeries" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Tai nghe theo giá",
            href: "/category/tai-nghe-audio",
            items: [
              { label: "Tai nghe dưới 1 triệu", href: "/category/tai-nghe-audio?maxPrice=1000000" },
              { label: "Tai nghe 1 triệu đến 2 triệu", href: "/category/tai-nghe-audio?minPrice=1000000&maxPrice=2000000" },
              { label: "Tai nghe 2 đến 3 triệu", href: "/category/tai-nghe-audio?minPrice=2000000&maxPrice=3000000" },
              { label: "Tai nghe 3 đến 4 triệu", href: "/category/tai-nghe-audio?minPrice=3000000&maxPrice=4000000" },
              { label: "Tai nghe trên 4 triệu", href: "/category/tai-nghe-audio?minPrice=4000000" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Kiểu kết nối",
            href: "/category/tai-nghe-audio",
            items: [
              { label: "Tai nghe Wireless", href: "/category/tai-nghe-audio?search=Wireless" },
              { label: "Tai nghe Bluetooth", href: "/category/tai-nghe-audio?search=Bluetooth" },
              { label: "Tai nghe Có dây 3.5mm", href: "/category/tai-nghe-audio?search=3.5mm" },
              { label: "Tai nghe Type-C / USB", href: "/category/tai-nghe-audio?search=Type-C" },
            ],
          },
        ],
      },
    ],
  },

  "chuot-gaming": {
    slug: "chuot-gaming",
    title: "Chuột Gaming",
    allHref: "/category/chuot-gaming",
    iconName: "Mouse",
    columns: [
      {
        groups: [
          {
            title: "Thương hiệu chuột",
            href: "/category/chuot-gaming",
            items: [
              { label: "Logitech G", href: "/category/chuot-gaming?search=Logitech" },
              { label: "Razer", href: "/category/chuot-gaming?search=Razer" },
              { label: "Pulsar", href: "/category/chuot-gaming?search=Pulsar" },
              { label: "Lamzu", href: "/category/chuot-gaming?search=Lamzu" },
              { label: "Zowie", href: "/category/chuot-gaming?search=Zowie" },
            ],
          },
          {
            title: "Kiểu cầm (Grip)",
            href: "/category/chuot-gaming",
            items: [
              { label: "Chuột công thái học (Ergo)", href: "/category/chuot-gaming?search=Ergo" },
              { label: "Chuột đối xứng (Ambidextrous)", href: "/category/chuot-gaming?search=Ambi" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Thương hiệu chuột",
            href: "/category/chuot-gaming",
            items: [
              { label: "Ninjutso", href: "/category/chuot-gaming?search=Ninjutso" },
              { label: "ATK / VXE", href: "/category/chuot-gaming?search=VXE" },
              { label: "Darmoshark", href: "/category/chuot-gaming?search=Darmoshark" },
              { label: "SteelSeries", href: "/category/chuot-gaming?search=SteelSeries" },
              { label: "Corsair", href: "/category/chuot-gaming?search=Corsair" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Chuột theo giá",
            href: "/category/chuot-gaming",
            items: [
              { label: "Chuột dưới 500 nghìn", href: "/category/chuot-gaming?maxPrice=500000" },
              { label: "Chuột 500 nghìn đến 1 triệu", href: "/category/chuot-gaming?minPrice=500000&maxPrice=1000000" },
              { label: "Chuột 1 đến 2 triệu", href: "/category/chuot-gaming?minPrice=1000000&maxPrice=2000000" },
              { label: "Chuột trên 2 triệu", href: "/category/chuot-gaming?minPrice=2000000" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Kiểu kết nối & Trọng lượng",
            href: "/category/chuot-gaming",
            items: [
              { label: "Chuột không dây (Wireless)", href: "/category/chuot-gaming?search=Wireless" },
              { label: "Chuột siêu nhẹ (< 60g)", href: "/category/chuot-gaming?search=siêu nhẹ" },
              { label: "Chuột có dây Type-C", href: "/category/chuot-gaming?search=có dây" },
              { label: "Polling Rate 4K / 8K Hz", href: "/category/chuot-gaming?search=8K" },
            ],
          },
        ],
      },
    ],
  },

  "ban-phim-co": {
    slug: "ban-phim-co",
    title: "Bàn Phím Cơ",
    allHref: "/category/ban-phim-co",
    iconName: "Keyboard",
    columns: [
      {
        groups: [
          {
            title: "Thương hiệu bàn phím",
            href: "/category/ban-phim-co",
            items: [
              { label: "AKKO", href: "/category/ban-phim-co?search=AKKO" },
              { label: "Keychron", href: "/category/ban-phim-co?search=Keychron" },
              { label: "MonsGeek", href: "/category/ban-phim-co?search=MonsGeek" },
              { label: "FL-Esports", href: "/category/ban-phim-co?search=FL-Esports" },
              { label: "Aula", href: "/category/ban-phim-co?search=Aula" },
            ],
          },
          {
            title: "Loại Switch",
            href: "/category/ban-phim-co",
            items: [
              { label: "Linear Switch (Êm ái)", href: "/category/ban-phim-co?search=Linear" },
              { label: "Tactile Switch (Khấc bấm)", href: "/category/ban-phim-co?search=Tactile" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Layout & Kích cỡ",
            href: "/category/ban-phim-co",
            items: [
              { label: "Layout 65% / 68 phím", href: "/category/ban-phim-co?search=68" },
              { label: "Layout 75% / 82 phím", href: "/category/ban-phim-co?search=75" },
              { label: "Layout TKL 87 phím", href: "/category/ban-phim-co?search=TKL" },
              { label: "Layout Fullsize 108 phím", href: "/category/ban-phim-co?search=Fullsize" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Bàn phím theo giá",
            href: "/category/ban-phim-co",
            items: [
              { label: "Dưới 1 triệu đồng", href: "/category/ban-phim-co?maxPrice=1000000" },
              { label: "1 triệu đến 2 triệu", href: "/category/ban-phim-co?minPrice=1000000&maxPrice=2000000" },
              { label: "2 triệu đến 3 triệu", href: "/category/ban-phim-co?minPrice=2000000&maxPrice=3000000" },
              { label: "Trên 3 triệu đồng", href: "/category/ban-phim-co?minPrice=3000000" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Kết nối & Tính năng",
            href: "/category/ban-phim-co",
            items: [
              { label: "Không dây (3-Mode Wireless)", href: "/category/ban-phim-co?search=Wireless" },
              { label: "Bàn phím nhôm CNC", href: "/category/ban-phim-co?search=nhôm" },
              { label: "Mạch xuôi Hot-swap", href: "/category/ban-phim-co?search=Hot-swap" },
              { label: "Led RGB & Gasket Mount", href: "/category/ban-phim-co?search=Gasket" },
            ],
          },
        ],
      },
    ],
  },

  "lot-chuot-mousepad": {
    slug: "lot-chuot-mousepad",
    title: "Lót Chuột & Mousepad",
    allHref: "/category/lot-chuot-mousepad",
    iconName: "Square",
    columns: [
      {
        groups: [
          {
            title: "Thương hiệu lót chuột",
            href: "/category/lot-chuot-mousepad",
            items: [
              { label: "Artisan Japan", href: "/category/lot-chuot-mousepad?search=Artisan" },
              { label: "Pulsar Superglide", href: "/category/lot-chuot-mousepad?search=Pulsar" },
              { label: "SteelSeries QcK", href: "/category/lot-chuot-mousepad?search=SteelSeries" },
              { label: "Razer Gigantus", href: "/category/lot-chuot-mousepad?search=Razer" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Chất liệu bề mặt",
            href: "/category/lot-chuot-mousepad",
            items: [
              { label: "Pad vải (Cloth Speed/Control)", href: "/category/lot-chuot-mousepad?search=vải" },
              { label: "Pad kính cường lực (Glass)", href: "/category/lot-chuot-mousepad?search=kính" },
              { label: "Pad Cordura kháng nước", href: "/category/lot-chuot-mousepad?search=Cordura" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Kích thước mousepad",
            href: "/category/lot-chuot-mousepad",
            items: [
              { label: "Size M / L (Chuẩn Esports)", href: "/category/lot-chuot-mousepad?search=Esports" },
              { label: "Size XL / Deskmat (900x400)", href: "/category/lot-chuot-mousepad?search=Deskmat" },
              { label: "Dày 4mm / 6mm Poron", href: "/category/lot-chuot-mousepad?search=Poron" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Phân khúc theo giá",
            href: "/category/lot-chuot-mousepad",
            items: [
              { label: "Dưới 300 nghìn", href: "/category/lot-chuot-mousepad?maxPrice=300000" },
              { label: "300 nghìn đến 700 nghìn", href: "/category/lot-chuot-mousepad?minPrice=300000&maxPrice=700000" },
              { label: "Cao cấp trên 700 nghìn", href: "/category/lot-chuot-mousepad?minPrice=700000" },
            ],
          },
        ],
      },
    ],
  },

  "man-hinh-gia-do": {
    slug: "man-hinh-gia-do",
    title: "Màn Hình & Giá Đỡ Arm",
    allHref: "/category/man-hinh-gia-do",
    iconName: "Monitor",
    columns: [
      {
        groups: [
          {
            title: "Thương hiệu màn hình & Arm",
            href: "/category/man-hinh-gia-do",
            items: [
              { label: "ASUS ROG / TUF", href: "/category/man-hinh-gia-do?search=ASUS" },
              { label: "ViewSonic", href: "/category/man-hinh-gia-do?search=ViewSonic" },
              { label: "Samsung Odyssey", href: "/category/man-hinh-gia-do?search=Samsung" },
              { label: "Human Motion", href: "/category/man-hinh-gia-do?search=Human" },
              { label: "North Bayou (NB)", href: "/category/man-hinh-gia-do?search=North+Bayou" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Tần số quét Gaming",
            href: "/category/man-hinh-gia-do",
            items: [
              { label: "Màn hình 144Hz - 180Hz", href: "/category/man-hinh-gia-do?search=180Hz" },
              { label: "Màn hình 240Hz - 360Hz", href: "/category/man-hinh-gia-do?search=240Hz" },
              { label: "Màn hình 500Hz+ Esports", href: "/category/man-hinh-gia-do?search=500Hz" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Kích thước & Độ phân giải",
            href: "/category/man-hinh-gia-do",
            items: [
              { label: "Màn hình 24 - 25 inch FHD", href: "/category/man-hinh-gia-do?search=24" },
              { label: "Màn hình 27 inch 2K QHD", href: "/category/man-hinh-gia-do?search=27" },
              { label: "Tấm nền Fast IPS / OLED", href: "/category/man-hinh-gia-do?search=IPS" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Giá đỡ màn hình Arm",
            href: "/category/man-hinh-gia-do",
            items: [
              { label: "Arm đơn (Dành cho 1 màn)", href: "/category/man-hinh-gia-do?search=Arm" },
              { label: "Arm đôi (Dành cho 2 màn)", href: "/category/man-hinh-gia-do?search=đôi" },
              { label: "Giá đỡ tải trọng nặng (34-49\")", href: "/category/man-hinh-gia-do?search=nặng" },
            ],
          },
        ],
      },
    ],
  },

  "phu-kien-switch": {
    slug: "phu-kien-switch",
    title: "Phụ Kiện & Switch",
    allHref: "/category/phu-kien-switch",
    iconName: "Sliders",
    columns: [
      {
        groups: [
          {
            title: "Switch bàn phím cơ",
            href: "/category/phu-kien-switch",
            items: [
              { label: "Gateron Switch", href: "/category/phu-kien-switch?search=Gateron" },
              { label: "Outemu Switch", href: "/category/phu-kien-switch?search=Outemu" },
              { label: "HMX / KTT Switch", href: "/category/phu-kien-switch?search=HMX" },
              { label: "TTC Switch", href: "/category/phu-kien-switch?search=TTC" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Keycap bộ",
            href: "/category/phu-kien-switch",
            items: [
              { label: "Keycap PBT Doubleshot", href: "/category/phu-kien-switch?search=PBT" },
              { label: "Keycap Cherry Profile", href: "/category/phu-kien-switch?search=Cherry" },
              { label: "Keycap MOA / XDA Profile", href: "/category/phu-kien-switch?search=MOA" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Dụng cụ Mod & Lube",
            href: "/category/phu-kien-switch",
            items: [
              { label: "Mỡ lube Krytox 205g0", href: "/category/phu-kien-switch?search=Krytox" },
              { label: "Switch Puller & Opener", href: "/category/phu-kien-switch?search=Puller" },
              { label: "Foam tiêu âm Poron", href: "/category/phu-kien-switch?search=Foam" },
            ],
          },
        ],
      },
      {
        groups: [
          {
            title: "Cáp xoắn & Feet chuột",
            href: "/category/phu-kien-switch",
            items: [
              { label: "Cáp xoắn Coiled Type-C", href: "/category/phu-kien-switch?search=Coiled" },
              { label: "Grip Tape chống trượt", href: "/category/phu-kien-switch?search=Grip" },
              { label: "Feet chuột PTFE / Thủy tinh", href: "/category/phu-kien-switch?search=Feet" },
            ],
          },
        ],
      },
    ],
  },
};

export function getMegaMenuConfig(slug: string): CategoryMegaMenuConfig | undefined {
  if (CATEGORY_MEGA_MENUS[slug]) return CATEGORY_MEGA_MENUS[slug];
  // Fallback matching partial slugs: e.g. tai-nghe -> tai-nghe-audio
  if (slug.includes("tai-nghe") || slug.includes("audio")) {
    return CATEGORY_MEGA_MENUS["tai-nghe-audio"];
  }
  if (slug.includes("chuot")) {
    return CATEGORY_MEGA_MENUS["chuot-gaming"];
  }
  if (slug.includes("ban-phim")) {
    return CATEGORY_MEGA_MENUS["ban-phim-co"];
  }
  if (slug.includes("lot-chuot") || slug.includes("mousepad")) {
    return CATEGORY_MEGA_MENUS["lot-chuot-mousepad"];
  }
  if (slug.includes("man-hinh") || slug.includes("gia-do")) {
    return CATEGORY_MEGA_MENUS["man-hinh-gia-do"];
  }
  if (slug.includes("phu-kien") || slug.includes("switch")) {
    return CATEGORY_MEGA_MENUS["phu-kien-switch"];
  }
  return undefined;
}
