"use client";

/**
 * MagneticDropZone (Share.io style)
 *
 * - Same look as the landing page dropzone: paper background, dashed ink border,
 *   6px radius, signal colour while a file is near / over it.
 * - The zone leans a few pixels toward a file you are dragging (a response to the
 *   user's action, so it fits the "nothing else moves" rule). Disabled when the
 *   user prefers reduced motion.
 * - It only collects files. It does not show them: the parent owns the list.
 *   `onFilesChange` receives the accepted files from each drop / pick, so the
 *   parent can append them.
 * - Rejected files (wrong type or too big) are listed under the zone; the
 *   accepted ones from the same batch still go through.
 *
 * Uses framer-motion (already in the project). CSS variables fall back to the
 * Share.io tokens, so it also works outside the .sio-form wrapper.
 *
 * Usage:
 *   <MagneticDropZone
 *     multiple
 *     maxSize={2 * 1024 * 1024}
 *     disabled={uploading}
 *     onFilesChange={(files) => addFiles(files)}
 *   />
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
   motion,
   useMotionTemplate,
   useMotionValue,
   useReducedMotion,
   useSpring,
} from "framer-motion";

const MAGNET_DISTANCE = 180;
const MAX_MAGNET_OFFSET = 8;
const MAGNET_SPRING = { damping: 24, mass: 0.65, stiffness: 280 };

const STYLES = `
.sio-mdz {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 224px;
  align-items: center;
  justify-content: center;
  background: var(--paper, #FFFFFF);
  border: 1.5px dashed var(--ink, #1A2030);
  border-radius: var(--radius, 6px);
  text-align: center;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.sio-mdz[data-near="true"] {
  background: var(--signal-wash, #E9ECFD);
  border-color: var(--signal, #2B3FE8);
}
.sio-mdz[data-over="true"] {
  background: var(--signal-wash, #E9ECFD);
  border-style: solid;
  border-color: var(--signal, #2B3FE8);
}
.sio-mdz[data-disabled="true"] { opacity: 0.5; }

.sio-mdz-btn {
  display: flex;
  width: 100%;
  min-height: 224px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: none;
  border: 0;
  border-radius: inherit;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.sio-mdz-btn:disabled { cursor: not-allowed; }
.sio-mdz-btn:focus-visible {
  outline: 3px solid var(--signal, #2B3FE8);
  outline-offset: -8px;
}

.sio-mdz-icon {
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--ink, #1A2030);
  border-radius: var(--radius, 6px);
  color: var(--ink, #1A2030);
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.sio-mdz[data-over="true"] .sio-mdz-icon {
  background: var(--signal, #2B3FE8);
  border-color: var(--signal, #2B3FE8);
  color: #FFFFFF;
}

.sio-mdz-title {
  margin-top: 16px;
  font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--ink, #1A2030);
}
.sio-mdz-sub {
  margin-top: 6px;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--graphite, #525B68);
}

.sio-mdz-errors {
  margin-top: 12px;
  padding: 0;
  list-style: none;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: #B42318;
}

@media (prefers-reduced-motion: reduce) {
  .sio-mdz, .sio-mdz-icon { transition-duration: 0.01ms !important; }
}
`;

function formatBytes(bytes) {
   if (!bytes) return "0 B";
   const units = ["B", "KB", "MB", "GB"];
   const exponent = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
   );
   const value = bytes / Math.pow(1024, exponent);
   const rounded =
      exponent === 0
         ? Math.round(value)
         : Number(value.toFixed(value >= 10 ? 0 : 1));
   return `${rounded} ${units[exponent]}`;
}

function isFileDrag(dataTransfer) {
   return dataTransfer
      ? Array.from(dataTransfer.types).includes("Files")
      : false;
}

function acceptsFile(file, accept) {
   if (!accept || !accept.trim()) return true;

   const fileName = file.name.toLowerCase();
   const fileType = file.type.toLowerCase();

   return accept
      .split(",")
      .map((rule) => rule.trim().toLowerCase())
      .some((rule) => {
         if (rule.startsWith(".")) return fileName.endsWith(rule);
         if (rule.endsWith("/*")) return fileType.startsWith(rule.slice(0, -1));
         return fileType === rule;
      });
}

export function MagneticDropZone({
   accept = "",
   className = "",
   disabled = false,
   maxSize = 20 * 1024 * 1024,
   multiple = false,
   onFilesChange,
}) {
   const inputRef = useRef(null);
   const zoneRef = useRef(null);
   const subId = useId();
   const [isNear, setIsNear] = useState(false);
   const [isOver, setIsOver] = useState(false);
   const [errors, setErrors] = useState([]);
   const reduceMotion = useReducedMotion();

   const magnetX = useMotionValue(0);
   const magnetY = useMotionValue(0);
   const magnetScale = useMotionValue(1);
   const springX = useSpring(magnetX, MAGNET_SPRING);
   const springY = useSpring(magnetY, MAGNET_SPRING);
   const springScale = useSpring(magnetScale, MAGNET_SPRING);
   const transform = useMotionTemplate`translate3d(${springX}px, ${springY}px, 0) scale(${springScale})`;

   const resetMagnet = useCallback(() => {
      magnetX.set(0);
      magnetY.set(0);
      magnetScale.set(1);
      setIsNear(false);
      setIsOver(false);
   }, [magnetScale, magnetX, magnetY]);

   useEffect(() => {
      function handleWindowDragOver(event) {
         if (!isFileDrag(event.dataTransfer)) return;

         const zone = zoneRef.current;
         if (!zone) return;

         const rect = zone.getBoundingClientRect();
         const centerX = rect.left + rect.width / 2;
         const centerY = rect.top + rect.height / 2;
         const distanceFromEdgeX = Math.max(
            Math.abs(event.clientX - centerX) - rect.width / 2,
            0
         );
         const distanceFromEdgeY = Math.max(
            Math.abs(event.clientY - centerY) - rect.height / 2,
            0
         );
         const distance = Math.hypot(distanceFromEdgeX, distanceFromEdgeY);
         const pointerIsOver =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;

         // A file dropped outside the zone would make the browser open it and
         // leave the page. Cancel the default and show "not allowed" instead.
         if (!pointerIsOver) {
            event.preventDefault();
            event.dataTransfer.dropEffect = "none";
         }

         const proximity = Math.max(0, 1 - distance / MAGNET_DISTANCE);

         if (disabled || proximity === 0) {
            resetMagnet();
            return;
         }

         const deltaX = event.clientX - centerX;
         const deltaY = event.clientY - centerY;
         const pointerDistance = Math.max(Math.hypot(deltaX, deltaY), 1);
         const offset = pointerIsOver ? 0 : proximity * MAX_MAGNET_OFFSET;

         magnetX.set(reduceMotion ? 0 : (deltaX / pointerDistance) * offset);
         magnetY.set(reduceMotion ? 0 : (deltaY / pointerDistance) * offset);
         magnetScale.set(reduceMotion ? 1 : pointerIsOver ? 1.02 : 1.008);
         setIsNear(true);
         setIsOver(pointerIsOver);
      }

      function handleDragEnd() {
         resetMagnet();
      }

      window.addEventListener("dragover", handleWindowDragOver);
      window.addEventListener("dragend", handleDragEnd);
      window.addEventListener("drop", handleDragEnd);

      return () => {
         window.removeEventListener("dragover", handleWindowDragOver);
         window.removeEventListener("dragend", handleDragEnd);
         window.removeEventListener("drop", handleDragEnd);
      };
   }, [disabled, magnetScale, magnetX, magnetY, reduceMotion, resetMagnet]);

   const acceptFiles = useCallback(
      (incoming) => {
         if (incoming.length === 0) return;

         const batch = multiple ? incoming : incoming.slice(0, 1);
         const accepted = [];
         const problems = [];

         for (const file of batch) {
            if (!acceptsFile(file, accept)) {
               problems.push(`${file.name} is not a supported file type.`);
            } else if (file.size > maxSize) {
               problems.push(`${file.name} is larger than ${formatBytes(maxSize)}.`);
            } else {
               accepted.push(file);
            }
         }

         setErrors(problems);
         if (accepted.length > 0 && onFilesChange) onFilesChange(accepted);
      },
      [accept, maxSize, multiple, onFilesChange]
   );

   function handleDrop(event) {
      event.preventDefault();
      event.stopPropagation();
      resetMagnet();
      if (disabled) return;
      acceptFiles(Array.from(event.dataTransfer.files));
   }

   function handleDragOver(event) {
      if (!isFileDrag(event.dataTransfer)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = disabled ? "none" : "copy";
   }

   function handleInputChange(event) {
      acceptFiles(Array.from(event.target.files || []));
      // Reset so choosing the same file again still fires onChange.
      event.target.value = "";
   }

   function openFilePicker() {
      if (!disabled && inputRef.current) inputRef.current.click();
   }

   const title = isOver
      ? "Let go to add"
      : isNear
         ? "Bring them closer"
         : "Drag files into this box";

   return (
      <div className={className}>
         <style>{STYLES}</style>

         <motion.div
            ref={zoneRef}
            role="group"
            aria-label="File drop area"
            className="sio-mdz"
            data-near={isNear}
            data-over={isOver}
            data-disabled={disabled}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{ transform: reduceMotion ? undefined : transform }}
         >
            <input
               ref={inputRef}
               type="file"
               className="hidden"
               tabIndex={-1}
               accept={accept || undefined}
               multiple={multiple}
               disabled={disabled}
               onChange={handleInputChange}
            />

            <button
               type="button"
               className="sio-mdz-btn"
               onClick={openFilePicker}
               disabled={disabled}
               aria-describedby={subId}
            >
               <span className="sio-mdz-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 22 22" focusable="false">
                     <path
                        d="M5 14 11 7l6 7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                     />
                  </svg>
               </span>
               <span className="sio-mdz-title">{title}</span>
               <span id={subId} className="sio-mdz-sub">
                  or choose them from your device. Up to {formatBytes(maxSize)} each.
               </span>
            </button>
         </motion.div>

         {errors.length > 0 && (
            <ul className="sio-mdz-errors" role="alert">
               {errors.map((message) => (
                  <li key={message}>{message}</li>
               ))}
            </ul>
         )}
      </div>
   );
}

export default MagneticDropZone;