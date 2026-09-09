/**
 * Mẫu thông số kỹ thuật (Tech Specs Presets) gợi ý theo từng ngành hàng Gaming Gear
 */

export const CATEGORY_SPEC_PRESETS: Record<string, Record<string, string>> = {
  "chuot-gaming": {
    "Cảm biến (Sensor)": "PixArt PAW3395 (26,000 DPI, 650 IPS)",
    "Độ phân giải (DPI)": "26,000 DPI",
    "Loại Switch": "Huano Blue Pink Dot (80 triệu lần nhấn)",
    "Trọng lượng": "49g siêu nhẹ",
    "Kiểu kết nối": "Tri-mode: Wireless 2.4G / Bluetooth 5.2 / Type-C có dây",
    "Thời lượng pin": "Lên đến 100 giờ liên tục (1000Hz)",
    "Tần số phản hồi (Polling Rate)": "1000Hz - 4000Hz",
  },
  "ban-phim-co": {
    "Loại Switch": "Linear Switch / Tactile Switch",
    "Khả năng Hotswap": "Hotswap 5-pin xuôi mạch (South-facing)",
    "Layout phím": "75% (81 phím) / TKL (87 phím)",
    "Chất liệu Keycap": "PBT Doubleshot Cherry Profile",
    "Đèn LED": "RGB 16.8 triệu màu từng phím",
    "Kiểu kết nối": "3 Mode: Bluetooth 5.0 / Wireless 2.4Ghz / USB Type-C",
    "Dung lượng pin": "4000mAh",
  },
  "tai-nghe-gaming": {
    "Kích thước Driver": "50mm Neodymium Drivers",
    "Dải tần số phản hồi": "20Hz - 20,000Hz",
    "Microphone": "Micro rời đa hướng chống ồn lọc tạp âm",
    "Kiểu kết nối": "Wireless 2.4GHz độ trễ siêu thấp / 3.5mm Jack",
    "Thời lượng pin": "Lên tới 40 giờ sử dụng",
    "Trọng lượng": "270g đệm tai mút hoạt tính êm ái",
  },
  "lot-chuot": {
    "Kích thước": "900 x 400 mm (Bao phủ cả bàn phím & chuột)",
    "Độ dày": "4mm êm ái",
    "Chất liệu bề mặt": "Vải dệt Cordura / Speed & Control cân bằng",
    "Bo viền": "Khâu vắt sổ chống rách viền cao cấp",
    "Đế lót": "Cao su tự nhiên vân chống trượt tuyệt đối",
  },
  "man-hinh-gaming": {
    "Kích thước & Tấm nền": "27 inch IPS Fast Liquid Crystal",
    "Độ phân giải": "2K QHD (2560 x 1440)",
    "Tần số quét": "180Hz - 240Hz",
    "Thời gian phản hồi": "1ms (GtG)",
    "Công nghệ đồng bộ": "NVIDIA G-Sync & AMD FreeSync Premium",
    "Cổng kết nối": "2x DisplayPort 1.4, 2x HDMI 2.0, 1x Audio 3.5mm",
  },
};

/**
 * Trả về danh sách key-value thông số mẫu theo slug của danh mục.
 * Nếu không có slug phù hợp, trả về thông số thiết bị chung.
 */
export function getSpecsPresetForCategory(slug: string): Record<string, string> {
  const normalized = slug.toLowerCase().trim();
  if (CATEGORY_SPEC_PRESETS[normalized]) {
    return { ...CATEGORY_SPEC_PRESETS[normalized] };
  }

  // Tìm kiếm tương đối nếu slug chứa từ khóa
  if (normalized.includes("chuot")) return { ...CATEGORY_SPEC_PRESETS["chuot-gaming"] };
  if (normalized.includes("phim")) return { ...CATEGORY_SPEC_PRESETS["ban-phim-co"] };
  if (normalized.includes("tai-nghe")) return { ...CATEGORY_SPEC_PRESETS["tai-nghe-gaming"] };
  if (normalized.includes("lot-chuot") || normalized.includes("pad")) return { ...CATEGORY_SPEC_PRESETS["lot-chuot"] };
  if (normalized.includes("man-hinh")) return { ...CATEGORY_SPEC_PRESETS["man-hinh-gaming"] };

  // Mẫu mặc định chung
  return {
    "Thương hiệu": "Chính hãng",
    "Bảo hành": "12 tháng 1 đổi 1",
    "Kiểu kết nối": "USB Type-C",
    "Màu sắc": "Đen / Trắng",
  };
}
