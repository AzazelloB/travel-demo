import { useState } from 'react';
import type { Content } from '../../shared/types';
import { Modal } from '../ui/Modal';

export function Gallery({ item }: { item: Content }) {
  const [view, setView] = useState<string | null>(null);
  return (
    <>
      {item.gallery.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto [&_button]:shrink-0 [&_button]:basis-36 [&_button]:p-0 [&_img]:h-24 [&_img]:rounded-xl">
          {item.gallery.map((image, i) => (
            <button type="button" key={image} onClick={() => setView(image)}>
              <img src={image} alt={`Gallery view ${i + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {view && (
        <Modal title="Gallery" onClose={() => setView(null)} wide>
          <img
            className="max-h-screen w-full rounded-xl object-contain"
            src={view}
            alt="Full gallery view"
          />
        </Modal>
      )}
    </>
  );
}
