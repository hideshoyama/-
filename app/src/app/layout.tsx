import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "庄山FP事務所 CRM",
  description: "顧客データベース＆DM営業メール送信",
};

const navItems = [
  { href: "/", label: "ダッシュボード" },
  { href: "/customers", label: "企業一覧" },
  { href: "/import", label: "CSVインポート" },
  { href: "/lists", label: "送信対象リスト" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={geist.className}>
      <body className="min-h-screen flex bg-gray-50">
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-4 py-5 border-b border-gray-200">
            <p className="text-xs text-gray-500">庄山FP事務所</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">CRM</p>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
