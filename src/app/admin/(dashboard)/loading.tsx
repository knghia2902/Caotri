export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header / Welcome Banner Skeleton */}
      <div className="rounded-[10px] border border-[#E7E7E3] bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2.5">
          <div className="h-7 w-56 rounded bg-[#EDEDEA]" />
          <div className="h-4 w-72 rounded bg-[#F3F3F0]" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-32 rounded-[8px] bg-[#EDEDEA]" />
          <div className="h-9 w-36 rounded-[8px] bg-[#EDEDEA]" />
        </div>
      </div>

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-[10px] border border-[#E7E7E3] bg-white p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-28 rounded bg-[#EDEDEA]" />
              <div className="h-8 w-8 rounded-[8px] bg-[#F3F3F0]" />
            </div>
            <div className="h-7 w-36 rounded bg-[#EDEDEA]" />
            <div className="h-3 w-32 rounded bg-[#F3F3F0]" />
          </div>
        ))}
      </div>

      {/* 2 Summary Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-[10px] border border-[#E7E7E3] bg-white p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-[8px] bg-[#F3F3F0]" />
                <div className="h-4 w-44 rounded bg-[#EDEDEA]" />
              </div>
              <div className="h-8 w-24 rounded-[8px] bg-[#F3F3F0]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-14 rounded-[8px] bg-[#F7F7F5]" />
              <div className="h-14 rounded-[8px] bg-[#F7F7F5]" />
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-[10px] border border-[#E7E7E3] bg-white overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-[#E7E7E3]">
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-[#EDEDEA]" />
            <div className="h-3.5 w-64 rounded bg-[#F3F3F0]" />
          </div>
          <div className="h-4 w-20 rounded bg-[#EDEDEA]" />
        </div>
        <div className="divide-y divide-[#E7E7E3]">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="px-5 py-3.5 flex items-center justify-between gap-4"
            >
              <div className="h-4 w-24 rounded bg-[#EDEDEA]" />
              <div className="h-4 w-32 rounded bg-[#F3F3F0]" />
              <div className="hidden sm:block h-4 w-40 rounded bg-[#F3F3F0]" />
              <div className="h-4 w-24 rounded bg-[#EDEDEA]" />
              <div className="h-5 w-20 rounded-full bg-[#F3F3F0]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
