"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";

import type { WooImage } from "@/lib/woocommerce";

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const SWIPE_DISTANCE = 60;

type Point = { x: number; y: number };
type View = { scale: number; x: number; y: number };
const RESET: View = { scale: 1, x: 0, y: 0 };

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Full-screen photo viewer: pinch or double-tap to zoom, drag to look around
 * a zoomed photo, swipe (or use the arrows / keyboard) for the next one.
 */
export function ProductImageViewer({
  images,
  productName,
  startIndex,
  onClose,
}: {
  images: WooImage[];
  productName: string;
  startIndex: number;
  onClose: (index: number) => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [view, setView] = useState<View>(RESET);
  const [animate, setAnimate] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{
    pinchStart?: { distance: number; scale: number };
    panStart?: Point & { viewX: number; viewY: number };
    swipeStartX?: number;
    lastTap?: number;
  }>({});

  const count = images.length;
  const image = images[index] ?? images[0];

  function go(step: number) {
    setAnimate(false);
    setView(RESET);
    setIndex((current) => (current + step + count) % count);
  }

  // Keep a zoomed photo from being dragged off screen.
  function clamp(next: View): View {
    const stage = stageRef.current;
    if (!stage || next.scale <= 1) return RESET;
    const maxX = ((next.scale - 1) * stage.clientWidth) / 2;
    const maxY = ((next.scale - 1) * stage.clientHeight) / 2;
    return {
      scale: next.scale,
      x: Math.max(-maxX, Math.min(maxX, next.x)),
      y: Math.max(-maxY, Math.min(maxY, next.y)),
    };
  }

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose(index);
      if (count > 1 && event.key === "ArrowRight") go(1);
      if (count > 1 && event.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    setAnimate(false);
    const points = [...pointers.current.values()];

    if (points.length === 2) {
      gesture.current = {
        ...gesture.current,
        pinchStart: { distance: distance(points[0], points[1]), scale: view.scale },
        panStart: undefined,
        swipeStartX: undefined,
      };
    } else if (points.length === 1) {
      gesture.current = {
        ...gesture.current,
        pinchStart: undefined,
        panStart: { x: event.clientX, y: event.clientY, viewX: view.x, viewY: view.y },
        swipeStartX: view.scale === 1 ? event.clientX : undefined,
      };
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.current.values()];
    const { pinchStart, panStart } = gesture.current;

    if (points.length === 2 && pinchStart) {
      const scale = Math.min(
        MAX_SCALE,
        Math.max(1, (pinchStart.scale * distance(points[0], points[1])) / pinchStart.distance),
      );
      setView((current) => clamp({ ...current, scale }));
    } else if (points.length === 1 && panStart && view.scale > 1) {
      setView(
        clamp({
          scale: view.scale,
          x: panStart.viewX + event.clientX - panStart.x,
          y: panStart.viewY + event.clientY - panStart.y,
        }),
      );
    }
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    const { swipeStartX, lastTap } = gesture.current;

    if (pointers.current.size > 0) {
      // One finger lifted from a pinch: carry on panning with the other.
      const [rest] = pointers.current.values();
      gesture.current.pinchStart = undefined;
      gesture.current.panStart = { ...rest, viewX: view.x, viewY: view.y };
      gesture.current.swipeStartX = undefined;
      return;
    }

    if (swipeStartX !== undefined && view.scale === 1) {
      const moved = event.clientX - swipeStartX;
      if (count > 1 && Math.abs(moved) > SWIPE_DISTANCE) {
        go(moved < 0 ? 1 : -1);
        gesture.current = {};
        return;
      }
    }

    const now = Date.now();
    const tapped = swipeStartX === undefined || Math.abs(event.clientX - swipeStartX) < 10;
    if (tapped && lastTap && now - lastTap < 300) {
      // Double tap: zoom in on that spot, or back out.
      setAnimate(true);
      const stage = stageRef.current;
      if (view.scale > 1 || !stage) {
        setView(RESET);
      } else {
        const bounds = stage.getBoundingClientRect();
        const offsetX = event.clientX - bounds.left - bounds.width / 2;
        const offsetY = event.clientY - bounds.top - bounds.height / 2;
        setView(
          clamp({
            scale: DOUBLE_TAP_SCALE,
            x: -offsetX * (DOUBLE_TAP_SCALE - 1),
            y: -offsetY * (DOUBLE_TAP_SCALE - 1),
          }),
        );
      }
      gesture.current = {};
      return;
    }

    gesture.current = { lastTap: tapped ? now : undefined };
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${productName} photos`}
      className="fixed inset-0 z-[100] flex flex-col bg-white"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-muted-foreground">
          {count > 1 ? `${index + 1} / ${count}` : ""}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={() => onClose(index)}
          aria-label="Close photos"
          className="grid size-10 place-items-center rounded-full bg-muted text-foreground"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      <div
        ref={stageRef}
        className="relative min-h-0 flex-1 touch-none select-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transition: animate ? "transform 200ms ease-out" : undefined,
          }}
        >
          <Image
            key={image.id}
            src={image.src}
            alt={image.alt || productName}
            fill
            sizes="100vw"
            quality={90}
            draggable={false}
            className="object-contain"
          />
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              onPointerDown={(event) => event.stopPropagation()}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              onPointerDown={(event) => event.stopPropagation()}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </>
        ) : null}
      </div>

      <p className="px-4 py-3 text-center text-xs text-muted-foreground">
        Pinch or double-tap to zoom
      </p>
    </div>,
    document.body,
  );
}
