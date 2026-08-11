import React, { useEffect, useId, useRef } from 'react';
import displacementMap from './liquidGlassDisplacementMap.js';

const DRAG_THRESHOLD = 6;
const RESET_DELAY = 3000;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toFilterId(id) {
  return `liquid-glass-shader-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

export default function LiquidGlassButton({ href = '/register', children = 'Comenzar Ahora' }) {
  const filterId = toFilterId(useId());
  const displacementScale = 64;
  const aberrationIntensity = 2;
  const buttonRef = useRef(null);
  const dragRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    x: 0,
    y: 0,
    minDeltaX: 0,
    maxDeltaX: 0,
    minDeltaY: 0,
    maxDeltaY: 0,
    moved: false,
    resetTimer: null,
    returnTimer: null,
  });

  const clearResetTimers = () => {
    const state = dragRef.current;

    if (state.resetTimer !== null) {
      window.clearTimeout(state.resetTimer);
      state.resetTimer = null;
    }

    if (state.returnTimer !== null) {
      window.clearTimeout(state.returnTimer);
      state.returnTimer = null;
    }
  };

  const writeDragPosition = (x, y) => {
    const button = buttonRef.current;
    if (!button) return;

    const state = dragRef.current;
    state.x = x;
    state.y = y;
    button.style.setProperty('--liquid-glass-drag-x', `${x}px`);
    button.style.setProperty('--liquid-glass-drag-y', `${y}px`);
  };

  const scheduleReset = () => {
    const state = dragRef.current;
    clearResetTimers();

    state.resetTimer = window.setTimeout(() => {
      const button = buttonRef.current;
      if (!button) return;

      state.x = 0;
      state.y = 0;
      button.dataset.returning = 'true';
      writeDragPosition(0, 0);

      state.returnTimer = window.setTimeout(() => {
        button.dataset.returning = 'false';
        state.returnTimer = null;
      }, 700);
      state.resetTimer = null;
    }, RESET_DELAY);
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const button = buttonRef.current;
    if (!button) return;

    clearResetTimers();
    button.dataset.returning = 'false';

    const rect = button.getBoundingClientRect();
    const state = dragRef.current;
    state.pointerId = event.pointerId;
    state.startX = event.clientX;
    state.startY = event.clientY;
    state.originX = state.x;
    state.originY = state.y;
    state.minDeltaX = 16 - rect.left;
    state.maxDeltaX = window.innerWidth - 16 - rect.right;
    state.minDeltaY = 16 - rect.top;
    state.maxDeltaY = window.innerHeight - 16 - rect.bottom;
    state.moved = false;

    button.dataset.dragging = 'true';
    button.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const state = dragRef.current;
    if (state.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;

    if (!state.moved && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return;

    state.moved = true;
    event.preventDefault();
    writeDragPosition(
      state.originX + clamp(deltaX, state.minDeltaX, state.maxDeltaX),
      state.originY + clamp(deltaY, state.minDeltaY, state.maxDeltaY),
    );
  };

  const handlePointerUp = (event) => {
    const button = buttonRef.current;
    const state = dragRef.current;
    if (state.pointerId !== event.pointerId) return;

    if (button?.hasPointerCapture(event.pointerId)) {
      button.releasePointerCapture(event.pointerId);
    }

    state.pointerId = null;
    if (button) button.dataset.dragging = 'false';
    if (state.moved) scheduleReset();
  };

  const handleClick = (event) => {
    if (!dragRef.current.moved) return;

    event.preventDefault();
    dragRef.current.moved = false;
  };

  useEffect(() => () => clearResetTimers(), []);

  return (
    <div className="liquid-glass-button-wrapper">
      <svg className="liquid-glass-filter" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id={`${filterId}-edge-mask`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="black" stopOpacity="0" />
            <stop
              offset={`${Math.max(30, 80 - aberrationIntensity * 2)}%`}
              stopColor="black"
              stopOpacity="0"
            />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </radialGradient>
          <filter
            id={filterId}
            x="-35%"
            y="-35%"
            width="170%"
            height="170%"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              x="0"
              y="0"
              width="100%"
              height="100%"
              result="DISPLACEMENT_MAP"
              href={displacementMap}
              preserveAspectRatio="xMidYMid slice"
            />
            <feColorMatrix
              in="DISPLACEMENT_MAP"
              type="matrix"
              values="0.3 0.3 0.3 0 0
                      0.3 0.3 0.3 0 0
                      0.3 0.3 0.3 0 0
                      0 0 0 1 0"
              result="EDGE_INTENSITY"
            />
            <feComponentTransfer in="EDGE_INTENSITY" result="EDGE_MASK">
              <feFuncA type="discrete" tableValues={`0 ${aberrationIntensity * 0.05} 1`} />
            </feComponentTransfer>

            <feOffset in="SourceGraphic" dx="0" dy="0" result="CENTER_ORIGINAL" />

            <feDisplacementMap
              in="SourceGraphic"
              in2="DISPLACEMENT_MAP"
              scale={displacementScale * -1}
              xChannelSelector="R"
              yChannelSelector="B"
              result="RED_DISPLACED"
            />
            <feColorMatrix
              in="RED_DISPLACED"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="RED_CHANNEL"
            />

            <feDisplacementMap
              in="SourceGraphic"
              in2="DISPLACEMENT_MAP"
              scale={displacementScale * (-1 - aberrationIntensity * 0.05)}
              xChannelSelector="R"
              yChannelSelector="B"
              result="GREEN_DISPLACED"
            />
            <feColorMatrix
              in="GREEN_DISPLACED"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="GREEN_CHANNEL"
            />

            <feDisplacementMap
              in="SourceGraphic"
              in2="DISPLACEMENT_MAP"
              scale={displacementScale * (-1 - aberrationIntensity * 0.1)}
              xChannelSelector="R"
              yChannelSelector="B"
              result="BLUE_DISPLACED"
            />
            <feColorMatrix
              in="BLUE_DISPLACED"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="BLUE_CHANNEL"
            />

            <feBlend in="GREEN_CHANNEL" in2="BLUE_CHANNEL" mode="screen" result="GB_COMBINED" />
            <feBlend in="RED_CHANNEL" in2="GB_COMBINED" mode="screen" result="RGB_COMBINED" />
            <feGaussianBlur
              in="RGB_COMBINED"
              stdDeviation={Math.max(0.1, 0.5 - aberrationIntensity * 0.1)}
              result="ABERRATED_BLURRED"
            />
            <feComposite in="ABERRATED_BLURRED" in2="EDGE_MASK" operator="in" result="EDGE_ABERRATION" />

            <feComponentTransfer in="EDGE_MASK" result="INVERTED_MASK">
              <feFuncA type="table" tableValues="1 0" />
            </feComponentTransfer>
            <feComposite in="CENTER_ORIGINAL" in2="INVERTED_MASK" operator="in" result="CENTER_CLEAN" />
            <feComposite in="EDGE_ABERRATION" in2="CENTER_CLEAN" operator="over" />
          </filter>
        </defs>
      </svg>

      <a
        ref={buttonRef}
        href={href}
        className="liquid-glass-btn"
        draggable={false}
        style={{
          '--liquid-glass-filter': `url(#${filterId})`,
          '--liquid-glass-drag-x': '0px',
          '--liquid-glass-drag-y': '0px',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
      >
        <span className="liquid-glass-warp" aria-hidden="true" />
        <span className="liquid-glass-edge" aria-hidden="true" />
        <span className="liquid-glass-sheen" aria-hidden="true" />
        <span className="liquid-glass-content">{children}</span>
      </a>
    </div>
  );
}
