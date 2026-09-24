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
  slug: string;
  title: string;
  allHref: string;
  iconName?: string;
  columns: {
    groups: SubMenuGroup[];
  }[];
}

// Function to generate category mega menu based on the actual slug and category name
export function getMegaMenuConfig(slug: string, customTitle?: string): CategoryMegaMenuConfig | undefined {
  const normSlug = slug.toLowerCase();

  // 1. TAI NGHE / AUDIO
  if (normSlug.includes("tai-nghe") || normSlug.includes("audio") || normSlug.includes("headphone")) {
    const baseSlug = slug;
    return {
      slug: baseSlug,
      title: customTitle || "Tai Nghe",
      allHref: `/category/${baseSlug}`,
      iconName: "Headphones",
      columns: [
        {
          groups: [
            {
              title: "Thương hiệu tai nghe",
              href: `/category/${baseSlug}`,
              items: [
                { label: "ASUS", href: `/category/${baseSlug}?search=ASUS` },
                { label: "HyperX", href: `/category/${baseSlug}?search=HyperX` },
                { label: "Corsair", href: `/category/${baseSlug}?search=Corsair` },
                { label: "Razer", href: `/category/${baseSlug}?search=Razer` },
                { label: "ONIKUMA", href: `/category/${baseSlug}?search=ONIKUMA` },
              ],
            },
            {
              title: "Kiểu tai nghe",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Tai nghe Over-ear", href: `/category/${baseSlug}?search=Over-ear` },
                { label: "Tai nghe Gaming In-ear", href: `/category/${baseSlug}?search=In-ear` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Thương hiệu tai nghe",
              href: `/category/${baseSlug}`,
              items: [
                { label: "AKKO", href: `/category/${baseSlug}?search=AKKO` },
                { label: "Rapoo", href: `/category/${baseSlug}?search=Rapoo` },
                { label: "Logitech", href: `/category/${baseSlug}?search=Logitech` },
                { label: "Edifier", href: `/category/${baseSlug}?search=Edifier` },
                { label: "SteelSeries", href: `/category/${baseSlug}?search=SteelSeries` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Tai nghe theo giá",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Tai nghe dưới 1 triệu", href: `/category/${baseSlug}?maxPrice=1000000` },
                { label: "Tai nghe 1 triệu đến 2 triệu", href: `/category/${baseSlug}?minPrice=1000000&maxPrice=2000000` },
                { label: "Tai nghe 2 đến 3 triệu", href: `/category/${baseSlug}?minPrice=2000000&maxPrice=3000000` },
                { label: "Tai nghe 3 đến 4 triệu", href: `/category/${baseSlug}?minPrice=3000000&maxPrice=4000000` },
                { label: "Tai nghe trên 4 triệu", href: `/category/${baseSlug}?minPrice=4000000` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Kiểu kết nối",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Tai nghe Wireless", href: `/category/${baseSlug}?search=Wireless` },
                { label: "Tai nghe Bluetooth", href: `/category/${baseSlug}?search=Bluetooth` },
                { label: "Tai nghe Có dây 3.5mm", href: `/category/${baseSlug}?search=3.5mm` },
                { label: "Tai nghe Type-C / USB", href: `/category/${baseSlug}?search=Type-C` },
              ],
            },
          ],
        },
      ],
    };
  }

  // 2. CHUỘT GAMING (Loại trừ lót chuột / mousepad)
  if (
    (normSlug.includes("chuot") || normSlug.includes("mouse")) &&
    !normSlug.includes("lot-chuot") &&
    !normSlug.includes("pad")
  ) {
    const baseSlug = slug;
    return {
      slug: baseSlug,
      title: customTitle || "Chuột Gaming",
      allHref: `/category/${baseSlug}`,
      iconName: "Mouse",
      columns: [
        {
          groups: [
            {
              title: "Thương hiệu chuột",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Logitech G", href: `/category/${baseSlug}?search=Logitech` },
                { label: "Razer", href: `/category/${baseSlug}?search=Razer` },
                { label: "Pulsar", href: `/category/${baseSlug}?search=Pulsar` },
                { label: "Lamzu", href: `/category/${baseSlug}?search=Lamzu` },
                { label: "Zowie", href: `/category/${baseSlug}?search=Zowie` },
              ],
            },
            {
              title: "Kiểu cầm (Grip)",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Chuột công thái học (Ergo)", href: `/category/${baseSlug}?search=Ergo` },
                { label: "Chuột đối xứng (Ambi)", href: `/category/${baseSlug}?search=Ambi` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Thương hiệu nổi bật",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Ninjutso", href: `/category/${baseSlug}?search=Ninjutso` },
                { label: "ATK / VXE", href: `/category/${baseSlug}?search=VXE` },
                { label: "Darmoshark", href: `/category/${baseSlug}?search=Darmoshark` },
                { label: "SteelSeries", href: `/category/${baseSlug}?search=SteelSeries` },
                { label: "Corsair", href: `/category/${baseSlug}?search=Corsair` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Chuột theo giá",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Chuột dưới 500 nghìn", href: `/category/${baseSlug}?maxPrice=500000` },
                { label: "Chuột 500 nghìn đến 1 triệu", href: `/category/${baseSlug}?minPrice=500000&maxPrice=1000000` },
                { label: "Chuột 1 đến 2 triệu", href: `/category/${baseSlug}?minPrice=1000000&maxPrice=2000000` },
                { label: "Chuột trên 2 triệu", href: `/category/${baseSlug}?minPrice=2000000` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Kiểu kết nối & Trọng lượng",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Chuột không dây (Wireless)", href: `/category/${baseSlug}?search=Wireless` },
                { label: "Chuột siêu nhẹ (< 60g)", href: `/category/${baseSlug}?search=siêu nhẹ` },
                { label: "Chuột có dây Type-C", href: `/category/${baseSlug}?search=có dây` },
                { label: "Polling Rate 4K / 8K Hz", href: `/category/${baseSlug}?search=8K` },
              ],
            },
          ],
        },
      ],
    };
  }

  // 3. BÀN PHÍM CƠ
  if (normSlug.includes("ban-phim") || normSlug.includes("keyboard")) {
    const baseSlug = slug;
    return {
      slug: baseSlug,
      title: customTitle || "Bàn Phím Cơ",
      allHref: `/category/${baseSlug}`,
      iconName: "Keyboard",
      columns: [
        {
          groups: [
            {
              title: "Thương hiệu bàn phím",
              href: `/category/${baseSlug}`,
              items: [
                { label: "AKKO", href: `/category/${baseSlug}?search=AKKO` },
                { label: "Keychron", href: `/category/${baseSlug}?search=Keychron` },
                { label: "MonsGeek", href: `/category/${baseSlug}?search=MonsGeek` },
                { label: "FL-Esports", href: `/category/${baseSlug}?search=FL-Esports` },
                { label: "Aula", href: `/category/${baseSlug}?search=Aula` },
              ],
            },
            {
              title: "Loại Switch",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Linear Switch (Êm ái)", href: `/category/${baseSlug}?search=Linear` },
                { label: "Tactile Switch (Khấc bấm)", href: `/category/${baseSlug}?search=Tactile` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Layout & Kích cỡ",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Layout 65% / 68 phím", href: `/category/${baseSlug}?search=68` },
                { label: "Layout 75% / 82 phím", href: `/category/${baseSlug}?search=75` },
                { label: "Layout TKL 87 phím", href: `/category/${baseSlug}?search=TKL` },
                { label: "Layout Fullsize 108 phím", href: `/category/${baseSlug}?search=Fullsize` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Bàn phím theo giá",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Dưới 1 triệu đồng", href: `/category/${baseSlug}?maxPrice=1000000` },
                { label: "1 triệu đến 2 triệu", href: `/category/${baseSlug}?minPrice=1000000&maxPrice=2000000` },
                { label: "2 triệu đến 3 triệu", href: `/category/${baseSlug}?minPrice=2000000&maxPrice=3000000` },
                { label: "Trên 3 triệu đồng", href: `/category/${baseSlug}?minPrice=3000000` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Kết nối & Tính năng",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Không dây (3-Mode Wireless)", href: `/category/${baseSlug}?search=Wireless` },
                { label: "Bàn phím nhôm CNC", href: `/category/${baseSlug}?search=nhôm` },
                { label: "Mạch xuôi Hot-swap", href: `/category/${baseSlug}?search=Hot-swap` },
                { label: "Led RGB & Gasket Mount", href: `/category/${baseSlug}?search=Gasket` },
              ],
            },
          ],
        },
      ],
    };
  }

  // 4. LÓT CHUỘT
  if (normSlug.includes("lot-chuot") || normSlug.includes("mousepad")) {
    const baseSlug = slug;
    return {
      slug: baseSlug,
      title: customTitle || "Lót Chuột Mousepad",
      allHref: `/category/${baseSlug}`,
      iconName: "Square",
      columns: [
        {
          groups: [
            {
              title: "Thương hiệu lót chuột",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Artisan Japan", href: `/category/${baseSlug}?search=Artisan` },
                { label: "Pulsar Superglide", href: `/category/${baseSlug}?search=Pulsar` },
                { label: "SteelSeries QcK", href: `/category/${baseSlug}?search=SteelSeries` },
                { label: "Razer Gigantus", href: `/category/${baseSlug}?search=Razer` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Chất liệu bề mặt",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Pad vải (Cloth Speed/Control)", href: `/category/${baseSlug}?search=vải` },
                { label: "Pad kính cường lực (Glass)", href: `/category/${baseSlug}?search=kính` },
                { label: "Pad Cordura kháng nước", href: `/category/${baseSlug}?search=Cordura` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Kích thước mousepad",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Size M / L (Chuẩn Esports)", href: `/category/${baseSlug}?search=Esports` },
                { label: "Size XL / Deskmat (900x400)", href: `/category/${baseSlug}?search=Deskmat` },
                { label: "Dày 4mm / 6mm Poron", href: `/category/${baseSlug}?search=Poron` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Phân khúc theo giá",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Dưới 300 nghìn", href: `/category/${baseSlug}?maxPrice=300000` },
                { label: "300 nghìn đến 700 nghìn", href: `/category/${baseSlug}?minPrice=300000&maxPrice=700000` },
                { label: "Cao cấp trên 700 nghìn", href: `/category/${baseSlug}?minPrice=700000` },
              ],
            },
          ],
        },
      ],
    };
  }

  // 5. MÀN HÌNH
  if (normSlug.includes("man-hinh") || normSlug.includes("monitor")) {
    const baseSlug = slug;
    return {
      slug: baseSlug,
      title: customTitle || "Màn Hình & Giá Đỡ Arm",
      allHref: `/category/${baseSlug}`,
      iconName: "Monitor",
      columns: [
        {
          groups: [
            {
              title: "Thương hiệu màn hình",
              href: `/category/${baseSlug}`,
              items: [
                { label: "ASUS ROG / TUF", href: `/category/${baseSlug}?search=ASUS` },
                { label: "ViewSonic", href: `/category/${baseSlug}?search=ViewSonic` },
                { label: "Samsung Odyssey", href: `/category/${baseSlug}?search=Samsung` },
                { label: "Human Motion (Arm)", href: `/category/${baseSlug}?search=Human` },
                { label: "North Bayou (NB)", href: `/category/${baseSlug}?search=North+Bayou` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Tần số quét Gaming",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Màn hình 144Hz - 180Hz", href: `/category/${baseSlug}?search=180Hz` },
                { label: "Màn hình 240Hz - 360Hz", href: `/category/${baseSlug}?search=240Hz` },
                { label: "Màn hình 500Hz+ Esports", href: `/category/${baseSlug}?search=500Hz` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Kích thước & Độ phân giải",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Màn hình 24 - 25 inch FHD", href: `/category/${baseSlug}?search=24` },
                { label: "Màn hình 27 inch 2K QHD", href: `/category/${baseSlug}?search=27` },
                { label: "Tấm nền Fast IPS / OLED", href: `/category/${baseSlug}?search=IPS` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Giá đỡ màn hình Arm",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Arm đơn (Dành cho 1 màn)", href: `/category/${baseSlug}?search=Arm` },
                { label: "Arm đôi (Dành cho 2 màn)", href: `/category/${baseSlug}?search=đôi` },
                { label: "Giá đỡ tải nặng 34-49 inch", href: `/category/${baseSlug}?search=nặng` },
              ],
            },
          ],
        },
      ],
    };
  }

  // 6. MICRO
  if (normSlug.includes("micro") || normSlug.includes("mic")) {
    const baseSlug = slug;
    return {
      slug: baseSlug,
      title: customTitle || "Micro & Thu Âm",
      allHref: `/category/${baseSlug}`,
      iconName: "Mic",
      columns: [
        {
          groups: [
            {
              title: "Thương hiệu micro",
              href: `/category/${baseSlug}`,
              items: [
                { label: "HyperX QuadCast", href: `/category/${baseSlug}?search=HyperX` },
                { label: "Fifine", href: `/category/${baseSlug}?search=Fifine` },
                { label: "Razer Seiren", href: `/category/${baseSlug}?search=Razer` },
                { label: "Rode", href: `/category/${baseSlug}?search=Rode` },
                { label: "Maono", href: `/category/${baseSlug}?search=Maono` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Kiểu kết nối micro",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Micro USB cắm là chạy", href: `/category/${baseSlug}?search=USB` },
                { label: "Micro chuẩn XLR Pro", href: `/category/${baseSlug}?search=XLR` },
                { label: "Micro không dây cài áo", href: `/category/${baseSlug}?search=không dây` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Micro theo khoảng giá",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Micro dưới 1 triệu", href: `/category/${baseSlug}?maxPrice=1000000` },
                { label: "Micro 1 đến 2 triệu", href: `/category/${baseSlug}?minPrice=1000000&maxPrice=2000000` },
                { label: "Micro cao cấp trên 2 triệu", href: `/category/${baseSlug}?minPrice=2000000` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Phụ kiện đi kèm",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Tay kẹp bàn (Boom Arm)", href: `/category/${baseSlug}?search=Boom+Arm` },
                { label: "Màng lọc âm (Pop filter)", href: `/category/${baseSlug}?search=Pop+filter` },
                { label: "Giá chống rung (Shockmount)", href: `/category/${baseSlug}?search=Shockmount` },
              ],
            },
          ],
        },
      ],
    };
  }

  // 7. LOA
  if (normSlug.includes("loa") || normSlug.includes("speaker")) {
    const baseSlug = slug;
    return {
      slug: baseSlug,
      title: customTitle || "Loa Máy Tính & Soundbar",
      allHref: `/category/${baseSlug}`,
      iconName: "Volume2",
      columns: [
        {
          groups: [
            {
              title: "Thương hiệu loa",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Edifier", href: `/category/${baseSlug}?search=Edifier` },
                { label: "Logitech", href: `/category/${baseSlug}?search=Logitech` },
                { label: "Creative", href: `/category/${baseSlug}?search=Creative` },
                { label: "Razer Nommo", href: `/category/${baseSlug}?search=Razer` },
                { label: "Microlab", href: `/category/${baseSlug}?search=Microlab` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Kiểu dáng loa",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Loa vi tính 2.0 để bàn", href: `/category/${baseSlug}?search=2.0` },
                { label: "Loa 2.1 có Sub bass rời", href: `/category/${baseSlug}?search=2.1` },
                { label: "Loa Soundbar thanh ngang", href: `/category/${baseSlug}?search=Soundbar` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Loa theo mức giá",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Loa dưới 1 triệu", href: `/category/${baseSlug}?maxPrice=1000000` },
                { label: "Loa 1 triệu đến 2 triệu", href: `/category/${baseSlug}?minPrice=1000000&maxPrice=2000000` },
                { label: "Loa 2 đến 4 triệu", href: `/category/${baseSlug}?minPrice=2000000&maxPrice=4000000` },
                { label: "Loa cao cấp trên 4 triệu", href: `/category/${baseSlug}?minPrice=4000000` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Kết nối âm thanh",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Bluetooth không dây", href: `/category/${baseSlug}?search=Bluetooth` },
                { label: "Cổng AUX 3.5mm", href: `/category/${baseSlug}?search=3.5mm` },
                { label: "Cổng quang Optical", href: `/category/${baseSlug}?search=Optical` },
              ],
            },
          ],
        },
      ],
    };
  }

  // 8. TAY CẦM
  if (normSlug.includes("tay-cam") || normSlug.includes("controller") || normSlug.includes("gamepad")) {
    const baseSlug = slug;
    return {
      slug: baseSlug,
      title: customTitle || "Tay Cầm Chơi Game",
      allHref: `/category/${baseSlug}`,
      iconName: "Gamepad2",
      columns: [
        {
          groups: [
            {
              title: "Thương hiệu tay cầm",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Xbox Wireless Controller", href: `/category/${baseSlug}?search=Xbox` },
                { label: "Sony PlayStation DualSense", href: `/category/${baseSlug}?search=DualSense` },
                { label: "Machenike", href: `/category/${baseSlug}?search=Machenike` },
                { label: "GameSir", href: `/category/${baseSlug}?search=GameSir` },
                { label: "Flydigi", href: `/category/${baseSlug}?search=Flydigi` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Nền tảng hỗ trợ",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Tay cầm PC / Laptop", href: `/category/${baseSlug}?search=PC` },
                { label: "Tay cầm Android / iOS", href: `/category/${baseSlug}?search=Điện+thoại` },
                { label: "Tay cầm PS5 / Nintendo", href: `/category/${baseSlug}?search=Switch` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Mức giá",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Dưới 500 nghìn", href: `/category/${baseSlug}?maxPrice=500000` },
                { label: "500 nghìn đến 1 triệu", href: `/category/${baseSlug}?minPrice=500000&maxPrice=1000000` },
                { label: "1 triệu đến 2 triệu", href: `/category/${baseSlug}?minPrice=1000000&maxPrice=2000000` },
                { label: "Trên 2 triệu đồng", href: `/category/${baseSlug}?minPrice=2000000` },
              ],
            },
          ],
        },
        {
          groups: [
            {
              title: "Tính năng cao cấp",
              href: `/category/${baseSlug}`,
              items: [
                { label: "Cần Hall Effect chống trôi", href: `/category/${baseSlug}?search=Hall+Effect` },
                { label: "Kết nối 3-Mode (Wireless/BT)", href: `/category/${baseSlug}?search=Wireless` },
                { label: "Có phím Macro sau lưng", href: `/category/${baseSlug}?search=Macro` },
              ],
            },
          ],
        },
      ],
    };
  }

  // 9. DEFAULT / FALLBACK
  return {
    slug,
    title: customTitle || "Danh Mục Sản Phẩm",
    allHref: `/category/${slug}`,
    columns: [
      {
        groups: [
          {
            title: "Khám phá sản phẩm",
            href: `/category/${slug}`,
            items: [
              { label: "Sản phẩm mới nhất", href: `/category/${slug}` },
              { label: "Sản phẩm nổi bật", href: `/category/${slug}?sort=featured` },
              { label: "Giá thấp đến cao", href: `/category/${slug}?sort=price_asc` },
              { label: "Giá cao đến thấp", href: `/category/${slug}?sort=price_desc` },
            ],
          },
        ],
      },
    ],
  };
}
