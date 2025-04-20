export function ColorPalette() {
  const colors = [
    { color: "#eeeeee", name: "Light Gray" },
    { color: "#008413", name: "Green" },
    { color: "#000000", name: "Black" },
    { color: "#b70000", name: "Red" },
    { color: "#e8b000", name: "Yellow" },
    { color: "#4d007d", name: "Purple" },
    { color: "#ffffff", name: "White" },
    { color: "#121212", name: "Dark Gray" },
    { color: "#e5e5e5", name: "Light Gray 2" },
    { color: "#a4a4a4", name: "Medium Gray" },
    { color: "#9747ff", name: "Bright Purple" },
    { color: "#5c5c5c", name: "Medium Dark Gray" },
  ]

  return (
    <div className="flex items-start gap-1">
      <div className="grid grid-cols-4 gap-1 p-2 bg-[#e5e5e5] rounded-md">
        {colors.slice(0, 8).map((color, index) => (
          <div
            key={index}
            className="w-5 h-5 rounded-full"
            style={{ backgroundColor: color.color }}
            title={color.name}
          />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1 p-2 bg-[#e5e5e5] rounded-md opacity-50">
        {Array(16)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="w-3 h-3 rounded-full bg-[#a4a4a4]" />
          ))}
      </div>
    </div>
  )
}
