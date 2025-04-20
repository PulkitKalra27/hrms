import { ComponentThumbnail } from "@/components/component-thumbnail"

export function DesignGrid() {
  // Sample thumbnails based on the design
  const thumbnails = [
    { id: 1, cols: 1, rows: 1 },
    { id: 2, cols: 1, rows: 1 },
    { id: 3, cols: 1, rows: 1 },
    { id: 4, cols: 1, rows: 1 },
    { id: 5, cols: 1, rows: 1 },
    { id: 6, cols: 1, rows: 1 },
    { id: 7, cols: 1, rows: 1 },
    { id: 8, cols: 1, rows: 1 },
    { id: 9, cols: 1, rows: 1 },
    { id: 10, cols: 1, rows: 1 },
    { id: 11, cols: 1, rows: 1 },
    { id: 12, cols: 1, rows: 1 },
    { id: 13, cols: 2, rows: 2 },
    { id: 14, cols: 2, rows: 2 },
    { id: 15, cols: 1, rows: 1 },
    { id: 16, cols: 1, rows: 1 },
    { id: 17, cols: 1, rows: 1 },
    { id: 18, cols: 1, rows: 1 },
    { id: 19, cols: 1, rows: 1 },
    { id: 20, cols: 1, rows: 1 },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {thumbnails.map((thumbnail) => (
        <div
          key={thumbnail.id}
          className={`${thumbnail.cols === 2 ? "col-span-2" : "col-span-1"} ${
            thumbnail.rows === 2 ? "row-span-2" : "row-span-1"
          }`}
        >
          <ComponentThumbnail id={thumbnail.id} />
        </div>
      ))}

      {/* Large circular element on the right */}
      <div className="hidden lg:block lg:col-span-1 lg:row-span-2 relative">
        <div className="absolute right-0 top-0 w-40 h-40 bg-[#a4a4a4] rounded-full flex items-center justify-center">
          <div className="w-24 h-6 bg-white rounded-md flex items-center">
            <div className="h-4 w-full mx-1 bg-[#9747ff]" />
          </div>
        </div>
      </div>
    </div>
  )
}
