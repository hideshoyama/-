import { prisma } from "@/lib/db/client";
import Link from "next/link";

async function getStats() {
  const [companyCount, listCount, importCount] = await Promise.all([
    prisma.company.count(),
    prisma.targetList.count(),
    prisma.importSession.count(),
  ]);
  return { companyCount, listCount, importCount };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="登録企業数" value={stats.companyCount} unit="社" />
        <StatCard label="送信対象リスト" value={stats.listCount} unit="件" />
        <StatCard label="インポート履歴" value={stats.importCount} unit="回" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MenuCard href="/import" title="CSVインポート" description="MUSUBU・UrizoのCSVから企業データを取り込む" />
        <MenuCard href="/customers" title="企業一覧" description="登録済みの企業データを検索・フィルタリング" />
        <MenuCard href="/lists" title="送信対象リスト" description="DMを送る企業リストを作成・管理" />
      </div>
    </div>
  );
}

function StatCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">
        {value.toLocaleString()}
        <span className="text-base font-normal text-gray-500 ml-1">{unit}</span>
      </p>
    </div>
  );
}

function MenuCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-sm transition-all">
      <p className="text-base font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </Link>
  );
}
