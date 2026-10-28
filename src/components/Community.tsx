import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Plus,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Content, MediaAttachment, Submission } from '../../shared/types';
import { useStore } from '../context/Store';
import { useSubmissions } from '../hooks/useSubmissions';
import { useWords } from '../hooks/useWords';
import { api, send } from '../lib/api';
import { uploadMedia } from '../lib/upload';
import { buttonStyles } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { SectionHead } from '../ui/SectionHead';
import { ContentContext } from './ContentContext';

export function Community({ target }: { target: Content }) {
  const { user } = useStore();
  const { page, loading, refresh } = useSubmissions(target.id);
  const submissions = page.items;
  const words = useWords();
  const [open, setOpen] = useState(false),
    [selectedPost, setSelectedPost] = useState<Submission | null>(null),
    [selectedIndex, setSelectedIndex] = useState(0);
  const approved = submissions.filter((s) => s.targetId === target.id && s.status === 'approved');
  return (
    <section className="mt-12 community">
      <SectionHead title={words('Seen along the way.', 'Widziane po drodze.')}>
        {user.role !== 'Guest' && (
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-lilac hover:text-primary-dark"
            onClick={() => setOpen(true)}
          >
            <Plus size={15} />
            {words('Share a photo', 'Dodaj zdjęcie')}
          </button>
        )}
      </SectionHead>
      {approved.length ? (
        <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
          {approved.map((post) => (
            <CommunityPost
              key={post.id}
              post={post}
              onOpen={(index) => {
                setSelectedIndex(index);
                setSelectedPost(post);
              }}
            />
          ))}
        </div>
      ) : loading ? (
        <p role="status" className="text-sm text-muted">
          {words('Loading photos…', 'Ładowanie zdjęć…')}
        </p>
      ) : (
        <p className="text-muted">
          {words(
            'No traveller photos yet. Signed-in travellers can contribute photos or videos for review.',
            'Nie ma jeszcze zdjęć podróżników. Zalogowani użytkownicy mogą przesyłać zdjęcia i filmy do zatwierdzenia.',
          )}
        </p>
      )}
      {page.nextOffset !== null && (
        <button
          type="button"
          className={buttonStyles({ variant: 'secondary', className: 'mt-5' })}
          disabled={loading}
          onClick={() => void refresh(page.nextOffset!)}
        >
          {words('Load more', 'Pokaż więcej')}
        </button>
      )}
      {user.role !== 'Guest' &&
        submissions
          .filter(
            (s) => s.userId === user.id && s.targetId === target.id && s.status !== 'approved',
          )
          .map((s) => (
            <div
              className="flex items-center justify-between gap-3 border-t border-line py-4 text-sm"
              key={s.id}
            >
              {s.caption}
              <span className="inline-block whitespace-nowrap rounded-full bg-lilac px-2.5 py-1 text-xs text-primary [&.draft]:bg-amber-100 [&.draft]:text-amber-800">
                {s.status}
              </span>
            </div>
          ))}
      {selectedPost && (
        <Modal title={selectedPost.name} onClose={() => setSelectedPost(null)} wide>
          <p className="mb-5 whitespace-pre-wrap text-base leading-relaxed text-ink">
            {selectedPost.caption}
          </p>
          <PostMedia media={selectedPost.media} initialIndex={selectedIndex} large />
        </Modal>
      )}
      {open && (
        <ShareModal
          target={target}
          onClose={() => setOpen(false)}
          onSubmitted={() => void refresh()}
        />
      )}
    </section>
  );
}

const acceptedMedia = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
];

function ShareModal({
  target,
  onClose,
  onSubmitted,
}: {
  target: Content;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const { notice } = useStore();
  const words = useWords();
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const fileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`;
  function addFiles(selected: File[]) {
    const incoming = selected.filter(
      (file, index) =>
        !files.some((existing) => fileKey(existing) === fileKey(file)) &&
        selected.findIndex((other) => fileKey(other) === fileKey(file)) === index,
    );
    if (incoming.some((file) => !acceptedMedia.includes(file.type))) {
      setError(
        words(
          'Choose JPG, PNG, WebP, GIF, MP4 or WebM files.',
          'Wybierz pliki JPG, PNG, WebP, GIF, MP4 lub WebM.',
        ),
      );
      return;
    }
    if (incoming.some((file) => file.size > 15 * 1024 * 1024)) {
      setError(
        words('Each file must be 15 MB or less.', 'Każdy plik może mieć maksymalnie 15 MB.'),
      );
      return;
    }
    if (files.length + incoming.length > 6) {
      setError(words('Choose up to 6 files.', 'Wybierz maksymalnie 6 plików.'));
      return;
    }
    setFiles((current) => [...current, ...incoming]);
    setError('');
  }

  return (
    <Modal
      title={words('Share your photos', 'Podziel się zdjęciami')}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!files.length || busy) return;
          setBusy(true);
          try {
            const images = [];
            for (const file of files) images.push((await uploadMedia(file)).url);
            await api('submissions', send('POST', { targetId: target.id, images, caption }));
            onSubmitted();
            onClose();
            notice(words('Submitted for review.', 'Przesłano do zatwierdzenia.'));
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <ContentContext item={target} label={words('Sharing to', 'Dodajesz do')} />
        <div>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: drag and drop supplements the keyboard-accessible Choose files button. */}
          <div
            className={`rounded-2xl border-2 border-dashed px-5 py-6 text-center transition-colors ${dragging ? 'border-primary bg-lilac' : 'border-line bg-white hover:border-primary/50 hover:bg-lilac/30'}`}
            onDragEnter={(event) => {
              event.preventDefault();
              dragDepth.current += 1;
              setDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'copy';
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              dragDepth.current -= 1;
              if (dragDepth.current <= 0) {
                dragDepth.current = 0;
                setDragging(false);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              dragDepth.current = 0;
              setDragging(false);
              if (!busy) addFiles(Array.from(event.dataTransfer.files));
            }}
          >
            <Upload size={24} className="mx-auto mb-2 text-primary" />
            <p className="text-sm font-bold text-ink">
              {words('Drop photos or videos here', 'Przeciągnij tutaj zdjęcia lub filmy')}
            </p>
            <p className="mt-1 text-xs text-muted">
              {words('Up to 6 files, 15 MB each', 'Do 6 plików, po 15 MB każdy')}
            </p>
            <input
              ref={input}
              type="file"
              className="hidden"
              accept={acceptedMedia.join(',')}
              multiple
              onChange={(event) => {
                addFiles(Array.from(event.target.files || []));
                event.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={busy}
              className="mt-3 rounded-lg bg-lilac px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
              onClick={() => input.current?.click()}
            >
              {words('Choose files', 'Wybierz pliki')}
            </button>
          </div>
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((file) => (
                <li
                  key={fileKey(file)}
                  className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate text-ink">{file.name}</span>
                  <span className="shrink-0 text-xs text-muted">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    aria-label={`${words('Remove', 'Usuń')} ${file.name}`}
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-lilac hover:text-primary"
                    onClick={() => {
                      setFiles((current) => current.filter((entry) => entry !== file));
                      setError('');
                    }}
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <label>
          {words('Caption', 'Podpis')}
          <textarea
            rows={3}
            maxLength={1000}
            required
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder={words('Tell us about this moment…', 'Opowiedz o tej chwili…')}
          />
          <span className="text-right text-xs font-normal text-muted">{caption.length} / 1000</span>
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {words(
              'Your post will be reviewed before it appears.',
              'Twój wpis pojawi się po zatwierdzeniu.',
            )}
          </p>
          <button type="submit" className={buttonStyles({})} disabled={busy || !files.length}>
            {busy
              ? words('Uploading…', 'Przesyłanie…')
              : words('Submit for review', 'Wyślij do zatwierdzenia')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CommunityPost({ post, onOpen }: { post: Submission; onOpen: (index: number) => void }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <PostMedia media={post.media} onOpen={onOpen} />
      <button
        type="button"
        onClick={() => onOpen(0)}
        className="block w-full p-4 text-left hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className="block text-sm font-bold text-ink">{post.name}</span>
        <span className="mt-2 block line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">
          {post.caption}
        </span>
      </button>
    </article>
  );
}

function PostMedia({
  media,
  large = false,
  initialIndex = 0,
  onOpen,
}: {
  media: MediaAttachment[];
  large?: boolean;
  initialIndex?: number;
  onOpen?: (index: number) => void;
}) {
  const words = useWords();
  const [index, setIndex] = useState(initialIndex);
  return (
    <div className={`relative overflow-hidden bg-ink ${large ? 'h-media rounded-xl' : 'h-52'}`}>
      <div
        className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {media.map((file, position) => (
          <div
            key={file.url}
            className="relative h-full w-full shrink-0"
            inert={position !== index}
          >
            {Math.abs(position - index) <= 1 &&
              (large ? (
                <MediaView url={file.url} mime={file.mime} active={position === index} />
              ) : (
                <button
                  type="button"
                  onClick={() => onOpen?.(position)}
                  tabIndex={position === index && !large ? 0 : -1}
                  aria-hidden={position !== index || large}
                  aria-label={words('Open post', 'Otwórz wpis')}
                  className="group block size-full overflow-hidden"
                >
                  <PreviewMedia file={file} />
                </button>
              ))}
          </div>
        ))}
      </div>
      {media.length > 1 && (
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <button
            type="button"
            aria-label={words('Previous photo or video', 'Poprzednie zdjęcie lub film')}
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
            className="grid size-9 place-items-center rounded-full bg-white text-ink shadow disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="rounded-full bg-ink/70 px-3 py-1 text-xs font-bold text-white">
            {index + 1} / {media.length}
          </span>
          <button
            type="button"
            aria-label={words('Next photo or video', 'Następne zdjęcie lub film')}
            disabled={index === media.length - 1}
            onClick={() => setIndex(index + 1)}
            className="grid size-9 place-items-center rounded-full bg-white text-ink shadow disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

function PreviewMedia({ file }: { file: MediaAttachment }) {
  const video = file.mime.startsWith('video/');
  return (
    <>
      {file.thumbnail || !video ? (
        <img
          src={file.thumbnail || file.url}
          alt=""
          loading="lazy"
          className={
            video
              ? 'size-full object-cover transition-opacity duration-300 group-hover:opacity-85'
              : 'size-full object-cover transition-transform duration-500 group-hover:scale-105'
          }
        />
      ) : (
        <video
          src={file.url}
          preload="metadata"
          muted
          playsInline
          className="size-full object-cover"
        />
      )}
      {video && (
        <span className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-white/90 text-primary">
          <Play size={20} />
        </span>
      )}
    </>
  );
}

export function MediaView({
  url,
  mime,
  active = true,
}: {
  url: string;
  mime: string;
  active?: boolean;
}) {
  return mime.startsWith('video/') ? (
    <VideoPlayer url={url} active={active} />
  ) : (
    <img
      src={url}
      alt="Traveller contribution"
      loading="lazy"
      className="size-full object-contain"
    />
  );
}

function VideoPlayer({ url, active }: { url: string; active: boolean }) {
  const words = useWords();
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    if (!active) ref.current?.pause();
  }, [active]);
  const format = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  return (
    <div className="relative h-full w-full bg-ink">
      <video
        ref={ref}
        src={url}
        preload={active ? 'metadata' : 'none'}
        playsInline
        className="size-full object-contain"
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) =>
          setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)
        }
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-ink/85 px-4 py-3 text-white">
        <button
          type="button"
          aria-label={playing ? words('Pause', 'Pauza') : words('Play', 'Odtwórz')}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-primary transition hover:bg-lilac"
          onClick={() => {
            if (playing) ref.current?.pause();
            else void ref.current?.play().catch(() => {});
          }}
        >
          {playing ? <Pause size={17} /> : <Play size={17} />}
        </button>
        <span className="text-xs font-semibold tabular-nums">{format(time)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(time, duration)}
          aria-label={words('Video progress', 'Postęp filmu')}
          className="min-w-0 flex-1 cursor-pointer accent-accent"
          onChange={(e) => {
            if (ref.current) ref.current.currentTime = Number(e.target.value);
          }}
        />
        <span className="text-xs font-semibold tabular-nums">{format(duration)}</span>
        <button
          type="button"
          aria-label={muted ? words('Unmute', 'Włącz dźwięk') : words('Mute', 'Wycisz')}
          className="grid size-9 shrink-0 place-items-center rounded-full transition hover:bg-white/20"
          onClick={() => {
            if (ref.current) {
              ref.current.muted = !ref.current.muted;
              setMuted(ref.current.muted);
            }
          }}
        >
          {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
        </button>
      </div>
    </div>
  );
}
