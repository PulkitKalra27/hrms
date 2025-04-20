export function ComponentThumbnail({ id }: { id: number }) {
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden bg-white h-full">
      {/* Header bar with purple */}
      <div className="h-6 bg-[#9747ff] flex items-center px-2">
        <div className="w-3 h-3 rounded-full bg-white opacity-50 mr-1" />
      </div>

      {/* Content area */}
      <div className="p-2">
        {/* Simulate content with gray lines */}
        <div className="space-y-2">
          {Array(Math.floor(Math.random() * 3) + 1)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="h-3 bg-[#e5e5e5] rounded-sm"
                style={{ width: `${Math.floor(Math.random() * 50) + 50}%` }}
              />
            ))}
        </div>

        {/* Some thumbnails have tables */}
        {id % 3 === 0 && (
          <div className="mt-3 border-t border-[#e5e5e5] pt-2">
            <div className="space-y-1">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="flex">
                    <div className="w-1/3 h-2 bg-[#e5e5e5] rounded-sm mr-1" />
                    <div className="w-2/3 h-2 bg-[#e5e5e5] rounded-sm" />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Some thumbnails have buttons */}
        {id % 5 === 0 && (
          <div className="mt-3 flex justify-end">
            <div className="w-12 h-4 bg-[#9747ff] rounded-sm" />
          </div>
        )}
      </div>
    </div>
  )
}
