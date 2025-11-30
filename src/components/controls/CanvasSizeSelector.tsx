export interface CanvasSize {
  width: number;
  height: number;
}

export interface CanvasPreset {
  name: string;
  width: number;
  height: number;
}

interface CanvasSizeSelectorProps {
  currentSize: CanvasSize;
  onSizeChange: (size: CanvasSize) => void;
}

const CANVAS_PRESETS: CanvasPreset[] = [
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Post', width: 1200, height: 630 },
  { name: 'Twitter Post', width: 1200, height: 675 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'A4 (Portrait)', width: 2480, height: 3508 },
  { name: 'A4 (Landscape)', width: 3508, height: 2480 },
  { name: '4K', width: 3840, height: 2160 },
  { name: 'HD', width: 1920, height: 1080 },
];

export const CanvasSizeSelector: React.FC<CanvasSizeSelectorProps> = ({
  currentSize,
  onSizeChange,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <select
        value={`${currentSize.width}x${currentSize.height}`}
        onChange={(e) => {
          const [width, height] = e.target.value.split('x').map(Number);
          onSizeChange({ width, height });
        }}
        className="px-3 py-2 bg-white/95 backdrop-blur border border-gray-300 rounded-lg shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
      >
        {CANVAS_PRESETS.map((preset) => (
          <option key={preset.name} value={`${preset.width}x${preset.height}`}>
            {preset.name} ({preset.width}×{preset.height})
          </option>
        ))}
      </select>
    </div>
  );
};
