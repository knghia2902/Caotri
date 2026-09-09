/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành slug không dấu chuẩn SEO
 * Ví dụ: "Bàn phím cơ DareU EK87" -> "ban-phim-co-dareu-ek87"
 */
export function slugify(text: string): string {
  if (!text) return "";

  let str = text.toLowerCase();

  // Đổi ký tự có dấu thành không dấu
  str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
  str = str.replace(/[èéẹẻẽêềếệểễ]/g, "e");
  str = str.replace(/[ìíịỉĩ]/g, "i");
  str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
  str = str.replace(/[ùúụủũưừứựửữ]/g, "u");
  str = str.replace(/[ỳýỵỷỹ]/g, "y");
  str = str.replace(/đ/g, "d");

  // Xóa ký tự đặc biệt, chỉ giữ lại chữ, số và khoảng trắng
  str = str.replace(/[^a-z0-9\s-]/g, "");

  // Thay khoảng trắng và gạch dưới bằng dấu gạch ngang
  str = str.replace(/[\s_]+/g, "-");

  // Xóa các dấu gạch ngang liên tiếp
  str = str.replace(/-+/g, "-");

  // Xóa dấu gạch ngang ở đầu và cuối
  str = str.replace(/^-+|-+$/g, "");

  return str;
}
