export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="p-2 h-9 w-9 bg-gray-200 rounded-full"></div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-7 bg-gray-200 rounded w-56"></div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-28"></div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 gap-6 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i}>
              <div className="h-3 bg-gray-200 rounded w-20 mb-3"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
