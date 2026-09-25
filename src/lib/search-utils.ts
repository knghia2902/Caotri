/**
 * Tiện ích xử lý từ khóa tìm kiếm thông minh cho Storefront và Admin
 */

const STOP_WORDS = new Set([
  "cơ", "có", "và", "cho", "tay", "với", "loại", "các", "những", "cho", "của", "trong"
]);

/**
 * Phân tích và trích xuất các từ khóa ứng viên từ chuỗi tìm kiếm.
 * Ví dụ:
 *  - "Chuột không dây (Wireless)" -> ["Chuột không dây (Wireless)", "Wireless", "không dây", "Chuột không dây"]
 *  - "Bàn phím cơ (Mechanical)" -> ["Bàn phím cơ (Mechanical)", "Mechanical", "Bàn phím cơ"]
 *  - "Chuột siêu nhẹ (< 60g)" -> ["Chuột siêu nhẹ (< 60g)", "60g", "siêu nhẹ"]
 *  - "Wireless" -> ["Wireless"]
 */
export function extractSearchCandidates(query: string): string[] {
  const trimmed = query?.trim();
  if (!trimmed) return [];

  const candidates = new Set<string>();
  candidates.add(trimmed);

  // 1. Trích xuất từ khóa trong ngoặc () hoặc [] hoặc {}
  const bracketMatches = trimmed.matchAll(/[\(\[\{]([^\)\]\}]+)[\)\]\}]/g);
  for (const m of bracketMatches) {
    const inside = m[1].trim();
    if (inside.length >= 2 && !STOP_WORDS.has(inside.toLowerCase())) {
      candidates.add(inside);
      // Nếu có ký tự so sánh như "< 60g", ">= 1000Hz" -> lấy cả phần sạch
      const cleanInside = inside.replace(/^[<>~=≤≥\s]+/, "").trim();
      if (cleanInside && cleanInside !== inside && cleanInside.length >= 2) {
        candidates.add(cleanInside);
      }
    }
  }

  // 2. Trích xuất phần bên ngoài dấu ngoặc
  const outside = trimmed.replace(/[\(\[\{][^\)\]\}]*[\)\]\}]/g, " ").trim();
  if (outside && outside !== trimmed && outside.length >= 2) {
    candidates.add(outside);

    // 3. Loại bỏ tiền tố danh mục thông dụng để lấy phần cốt lõi
    // Vd: "Chuột không dây" -> "không dây"
    // "Bàn phím không dây" -> "không dây"
    const prefixRegex = /^(chuột|bàn phím|tai nghe|lót chuột|màn hình|phụ kiện|mouse|keyboard|headset|pad)\s+(gaming\s+|cơ\s+)?/i;
    const stripped = outside.replace(prefixRegex, "").trim();
    if (stripped && stripped !== outside && stripped.length >= 3 && !STOP_WORDS.has(stripped.toLowerCase())) {
      candidates.add(stripped);
    }
  }

  // 4. Nếu toàn chuỗi bắt đầu bằng tiền tố danh mục: "Chuột Razer" -> "Razer"
  const prefixRegex = /^(chuột|bàn phím|tai nghe|lót chuột|màn hình|phụ kiện|mouse|keyboard|headset|pad)\s+(gaming\s+|cơ\s+)?/i;
  const strippedTrimmed = trimmed.replace(prefixRegex, "").trim();
  if (strippedTrimmed && strippedTrimmed !== trimmed && strippedTrimmed.length >= 3 && !STOP_WORDS.has(strippedTrimmed.toLowerCase())) {
    candidates.add(strippedTrimmed);
  }

  return Array.from(candidates);
}

/**
 * Xây dựng điều kiện Prisma OR cho tìm kiếm thông minh sản phẩm.
 * Hỗ trợ tra cứu theo Name, Slug, Description, Specs.
 * Bổ sung biến thể chữ thường/hoa để tương thích tối đa với SQLite & PostgreSQL.
 */
export function buildProductSearchFilter(query: string) {
  const candidates = extractSearchCandidates(query);
  if (candidates.length === 0) return null;

  const orConditions: any[] = [];

  for (const term of candidates) {
    orConditions.push(
      { name: { contains: term } },
      { slug: { contains: term } },
      { description: { contains: term } },
      { specs: { contains: term } }
    );

    // Biến thể chữ thường và viết hoa đầu chữ cái (cho tiếng Việt trên SQLite)
    const lower = term.toLowerCase();
    const capitalized = term.charAt(0).toUpperCase() + term.slice(1);

    if (lower !== term) {
      orConditions.push(
        { name: { contains: lower } },
        { specs: { contains: lower } },
        { description: { contains: lower } }
      );
    }
    if (capitalized !== term && capitalized !== lower) {
      orConditions.push(
        { name: { contains: capitalized } },
        { specs: { contains: capitalized } },
        { description: { contains: capitalized } }
      );
    }
  }

  return { OR: orConditions };
}

/**
 * Trích xuất từ khóa tìm kiếm mặc định khi người dùng nhập tên hiển thị trong Admin Mega Menu.
 * Ví dụ:
 *  - "Chuột không dây (Wireless)" -> "Wireless"
 *  - "Bàn phím cơ (Mechanical)" -> "Mechanical"
 *  - "Form cầm Ergo (Công thái học)" -> "Ergo"
 *  - "Chuột Logitech" -> "Logitech"
 *  - "Razer Viper" -> "Razer Viper"
 */
export function extractDefaultSearchKeyword(label: string): string {
  const trimmed = label?.trim() || "";
  if (!trimmed) return "";

  // 1. Nếu có ngoặc đơn: "Chuột không dây (Wireless)" -> "Wireless"
  const bracketMatch = trimmed.match(/[\(\[\{]([^\)\]\}]+)[\)\]\}]/);
  if (bracketMatch && bracketMatch[1]?.trim()) {
    const inside = bracketMatch[1].trim();
    // Bỏ ký tự so sánh nếu có: "< 60g" -> "60g"
    return inside.replace(/^[<>~=≤≥\s]+/, "").trim() || inside;
  }

  // 2. Nếu có tiền tố loại sản phẩm: "Chuột Logitech" -> "Logitech"
  const prefixRegex = /^(chuột|bàn phím|tai nghe|lót chuột|màn hình|phụ kiện|mouse|keyboard|headset|pad)\s+(gaming\s+|cơ\s+)?/i;
  const stripped = trimmed.replace(prefixRegex, "").trim();
  if (stripped && stripped !== trimmed && stripped.length >= 2) {
    return stripped;
  }

  return trimmed;
}

/**
 * Trích xuất từ khóa search từ href của item (ví dụ: "/category/chuot-gaming?search=Wireless" -> "Wireless")
 */
export function getSearchQueryFromHref(href: string): string {
  if (!href) return "";
  try {
    const url = new URL(href, "http://dummy.local");
    return url.searchParams.get("search") || "";
  } catch {
    const match = href.match(/[?&]search=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }
}

/**
 * Cập nhật hoặc thay thế từ khóa search trong href
 */
export function updateSearchQueryInHref(href: string, categorySlug: string, newSearch: string): string {
  const trimmed = newSearch.trim();
  const basePath = `/category/${categorySlug}`;
  try {
    const url = new URL(href || basePath, "http://dummy.local");
    if (trimmed) {
      url.searchParams.set("search", trimmed);
    } else {
      url.searchParams.delete("search");
    }
    const searchStr = url.searchParams.toString();
    const pathname = url.pathname.startsWith("/category/") ? url.pathname : basePath;
    return searchStr ? `${pathname}?${searchStr}` : pathname;
  } catch {
    return trimmed ? `${basePath}?search=${encodeURIComponent(trimmed)}` : basePath;
  }
}
