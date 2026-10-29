import type { Map } from 'maplibre-gl';

// Small vector pictograms rasterised at 2× for MapLibre's symbol atlas.
const paths: Record<string, string> = {
  'landmark-church': 'M12 2v6 M9 5h6 M8 21V11l4-3 4 3v10 M8 14l-5 3v4h18v-4l-5-3 M11 21v-5h2v5',
  'landmark-museum': 'M3 9l9-6 9 6H3 M5 10v9 M10 10v9 M14 10v9 M19 10v9 M3 21h18',
  'landmark-castle': 'M3 21V5h4v4h3V5h4v4h3V5h4v16H3 M10 21v-6h4v6',
  'landmark-monument': 'M5 21h14 M7 18h10l-2-4-1-11h-4L9 14z M7 18v3 M17 18v3',
};

export function registerLandmarkIcons(map: Map) {
  map.on('styleimagemissing', ({ id }) => {
    if (!paths[id] || map.hasImage(id)) return;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 48;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.scale(2, 2);
    context.fillStyle = '#fff7fd';
    context.beginPath();
    context.arc(12, 12, 11, 0, Math.PI * 2);
    context.fill();
    context.translate(4, 4);
    context.scale(2 / 3, 2 / 3);
    context.strokeStyle = '#754082';
    context.lineWidth = 1.8;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke(new Path2D(paths[id]));
    map.addImage(id, context.getImageData(0, 0, 48, 48), { pixelRatio: 2 });
  });
}
