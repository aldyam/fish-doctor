import type { PointerEvent } from "react";

function clearPress(event: PointerEvent<HTMLElement>) {
  delete event.currentTarget.dataset.glowPressed;
}

// Presentation only: update local CSS coordinates without scheduling React renders.
export const pointerGlow = {
  onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch" &&
        !event.currentTarget.matches(":disabled, [aria-disabled='true']")) {
      event.currentTarget.dataset.glowPressed = "true";
    }
  },
  onPointerUp: clearPress,
  onPointerCancel: clearPress,
  onPointerLeave: clearPress,
  onPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse" ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
        event.currentTarget.matches(":disabled, [aria-disabled='true']")) return;

    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--mouse-x", `${event.clientX - rect.left - element.clientLeft}px`);
    element.style.setProperty("--mouse-y", `${event.clientY - rect.top - element.clientTop}px`);
  },
};
