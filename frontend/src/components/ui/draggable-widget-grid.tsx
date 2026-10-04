"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useId,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";

export type WidgetSize = "sm" | "wide" | "tall" | "large";

export interface WidgetItem {
  id: string;
  size: WidgetSize;
  label?: string;
  [key: string]: any;
}

export interface DraggableWidgetGridProps {
  items?: WidgetItem[];
  onChange?: (items: WidgetItem[]) => void;
  renderItem?: (item: WidgetItem, sizeInfo: { w: number; h: number }) => ReactNode;
  editable?: boolean;
  maxColumns?: number;
  cellSize?: number;
  gap?: number;
  radius?: number;
  className?: string;
  children?: ReactNode;
}

const SIZE_SPANS: Record<WidgetSize, { w: number; h: number }> = {
  sm: { w: 1, h: 1 },
  wide: { w: 2, h: 1 },
  tall: { w: 1, h: 2 },
  large: { w: 2, h: 2 },
};

export function DraggableWidgetGrid({
  items: initialItems = [],
  onChange,
  renderItem,
  editable = true,
  maxColumns = 4,
  gap = 16,
  radius = 16,
  className = "",
}: DraggableWidgetGridProps) {
  const [items, setItems] = useState<WidgetItem[]>(initialItems);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (initialItems.length > 0) {
      setItems(initialItems);
    }
  }, [initialItems]);

  const handleDragStart = (id: string) => {
    if (!editable) return;
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggedId && id !== overId) {
      setOverId(id);
    }
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setOverId(null);
      return;
    }

    const currentIndex = items.findIndex((i) => i.id === draggedId);
    const targetIndex = items.findIndex((i) => i.id === targetId);

    if (currentIndex === -1 || targetIndex === -1) return;

    const newItems = [...items];
    const [moved] = newItems.splice(currentIndex, 1);
    newItems.splice(targetIndex, 0, moved);

    setItems(newItems);
    setDraggedId(null);
    setOverId(null);
    onChange?.(newItems);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setOverId(null);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ "--widget-radius": `${radius}px` } as React.CSSProperties}
    >
      {editable && (
        <p id={hintId} className="sr-only">
          Drag cards to rearrange the dashboard layout.
        </p>
      )}

      <motion.div
        layout={!shouldReduceMotion}
        role="list"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        style={{ gap }}
      >
        {items.map((item) => {
          const isDragging = draggedId === item.id;
          const isOver = overId === item.id;
          const span = SIZE_SPANS[item.size] || { w: 1, h: 1 };
          const colSpanClass =
            span.w === 2 ? "md:col-span-2" : "col-span-1";

          return (
            <motion.div
              key={item.id}
              layout={!shouldReduceMotion}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              draggable={editable}
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={() => handleDrop(item.id)}
              onDragEnd={handleDragEnd}
              className={`group relative rounded-[var(--widget-radius)] transition-all ${colSpanClass} ${
                editable ? "cursor-grab active:cursor-grabbing" : ""
              } ${isDragging ? "opacity-40 scale-[0.98]" : ""} ${
                isOver ? "ring-2 ring-primary ring-offset-2 scale-[1.01]" : ""
              }`}
            >
              {editable && (
                <div
                  className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-muted/80 backdrop-blur-sm px-2 py-1 rounded text-[11px] font-medium text-muted-foreground pointer-events-none select-none flex items-center gap-1 border border-border/50"
                  aria-hidden="true"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="5" r="1"/>
                    <circle cx="9" cy="12" r="1"/>
                    <circle cx="9" cy="19" r="1"/>
                    <circle cx="15" cy="5" r="1"/>
                    <circle cx="15" cy="12" r="1"/>
                    <circle cx="15" cy="19" r="1"/>
                  </svg>
                  <span>Drag</span>
                </div>
              )}

              <div className="h-full w-full">
                {renderItem ? renderItem(item, span) : item.children}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default DraggableWidgetGrid;
