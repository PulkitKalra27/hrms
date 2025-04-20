import { ColorPalette } from "@/components/color-palette"
import { DesignGrid } from "@/components/design-grid"

export default function DesignSystem() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#5c5c5c] p-6">
        <h1 className="text-white text-3xl font-medium">Design System</h1>
      </header>

      {/* Color Palette Section */}
      <div className="p-6">
        <ColorPalette />
      </div>

      {/* Design Section */}
      <div className="mt-8">
        <div className="bg-[#5c5c5c] py-4 text-center">
          <h2 className="text-white text-3xl font-medium">Design</h2>
        </div>

        {/* Design Grid */}
        <div className="p-6">
          <DesignGrid />
        </div>
      </div>
    </div>
  )
}
