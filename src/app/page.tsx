import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Gamepad2, ShoppingBag, ShieldCheck, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="w-7 h-7 text-sky-600" />
            <span className="font-bold text-xl tracking-tight">CAOTRI GEAR</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/admin/login">
              <Button variant="outline" size="sm">
                Trang Quản trị
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="secondary" className="mb-4">
            Clean Tech Minimalist • Phase 1 Scaffolding
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-slate-900 mb-4">
            Gaming Gear & Phụ Kiện Máy Tính
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Hệ thống bán lẻ thiết bị chuột gaming, bàn phím cơ, tai nghe chính hãng. Trải nghiệm mua hàng tức thì, chốt đơn nhanh chóng qua Zalo & Facebook.
          </p>
          <div className="flex justify-center gap-3">
            <Button size="lg" className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" /> Khám phá danh mục
            </Button>
            <Button variant="outline" size="lg">
              Tìm kiếm linh kiện
            </Button>
          </div>
        </div>

        {/* Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="accent">Nổi bật</Badge>
                <span className="text-xs text-slate-400 font-mono">LOGI-01</span>
              </div>
              <CardTitle className="mt-2">Logitech G Pro X Superlight 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">
                Cảm biến HERO 2 32K DPI, tần số 2000Hz, trọng lượng siêu nhẹ 60g, switch quang học hybrid LIGHTFORCE.
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900">{formatPrice(3490000)}</span>
                <span className="text-xs text-slate-400 line-through">{formatPrice(3990000)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="default" className="w-full flex items-center justify-center gap-2">
                Thêm vào giỏ <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="success">Mới về</Badge>
                <span className="text-xs text-slate-400 font-mono">KEY-01</span>
              </div>
              <CardTitle className="mt-2">Keychron Q1 Pro Wireless</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">
                Bàn phím cơ Custom nhôm nguyên khối CNC, Gasket Mount, Bluetooth 5.1 & Type-C, mạch xuôi hotswap RGB.
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900">{formatPrice(4450000)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="default" className="w-full flex items-center justify-center gap-2">
                Thêm vào giỏ <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="secondary">Bán chạy</Badge>
                <span className="text-xs text-slate-400 font-mono">HYPER-01</span>
              </div>
              <CardTitle className="mt-2">HyperX Cloud II Wireless</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">
                Âm thanh vòm 7.1 vòm ảo, đệm tai mút hoạt tính êm ái, kết nối không dây 2.4GHz không độ trễ, pin 30 giờ.
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900">{formatPrice(2790000)}</span>
                <span className="text-xs text-slate-400 line-through">{formatPrice(3190000)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="default" className="w-full flex items-center justify-center gap-2">
                Thêm vào giỏ <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Feature Banner */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-sky-600" />
            <div>
              <h4 className="font-semibold text-slate-900">Cam kết hàng chính hãng 100%</h4>
              <p className="text-sm text-slate-500">Bảo hành 1 đổi 1 nhanh chóng, tư vấn cấu hình nhiệt tình qua Zalo & Hotline.</p>
            </div>
          </div>
          <Button variant="outline">Xem chính sách bảo hành</Button>
        </div>
      </main>
    </div>
  );
}
