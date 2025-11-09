import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomFit: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomFit,
}) => {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        className="w-12 h-12 bg-white/95 backdrop-blur shadow-lg rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center"
        title="Zoom avant"
      >
        <span className="text-xl font-bold">+</span>
      </button>

      {/* Zoom percentage */}
      <div className="w-12 h-12 bg-white/95 backdrop-blur shadow-lg rounded-lg border border-gray-200 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-700">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        className="w-12 h-12 bg-white/95 backdrop-blur shadow-lg rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center"
        title="Zoom arrière"
      >
        <span className="text-xl font-bold">−</span>
      </button>

      {/* Reset 1:1 */}
      <button
        onClick={onZoomReset}
        className="w-12 h-12 bg-white/95 backdrop-blur shadow-lg rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center"
        title="Zoom 100%"
      >
        <span className="text-xs font-bold">1:1</span>
      </button>

      {/* Fit to screen */}
      <button
        onClick={onZoomFit}
        className="w-12 h-12 bg-white/95 backdrop-blur shadow-lg rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center"
        title="Ajuster à l'écran"
      >
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
};
