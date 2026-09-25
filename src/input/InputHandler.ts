/**
 * InputHandler.ts
 * Decoupled event-driven input architecture for Iron Horse Rush.
 *
 * Emits generic actions:
 *  - 'MOVE_LEFT' -> Trocar para a pista da esquerda
 *  - 'MOVE_RIGHT' -> Trocar para a pista da direita
 *  - 'JUMP' -> Subir rampas ou pular
 *  - 'SLIDE' -> Abaixar / Frear
 *  - 'HORN' -> Ativar a buzina / apito do trem a qualquer momento
 *
 * Mapeamento Padrão de Controles:
 *  - Teclado: Setas / WASD para movimentação + ESPAÇO ou H para buzinar.
 *  - Touch / Mobile: Gestos de Swipe para movimentação + Botão virtual de buzina fixo na tela.
 *
 * Facilmente substituível por Gamepad, socket, webcam, ou IA apenas alterando o InputHandler.
 */

import { GameAction } from '../types/game';

export type ActionListener = (action: GameAction) => void;

export interface IInputSource {
  attach(targetElement: HTMLElement | Window): void;
  detach(): void;
  onAction(listener: ActionListener): () => void;
  emit(action: GameAction): void;
}

export class InputHandler implements IInputSource {
  private listeners: Set<ActionListener> = new Set();
  private targetElement: HTMLElement | Window | null = null;

  // Touch gesture tracking
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private readonly minSwipeDistance = 30; // pixels
  private readonly maxSwipeTime = 500; // ms

  // Bound event handlers for clean attach/detach
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundTouchStart: (e: TouchEvent) => void;
  private boundTouchEnd: (e: TouchEvent) => void;

  constructor() {
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);
  }

  /**
   * Subscribe a listener to action events.
   * Returns an unsubscribe function.
   */
  public onAction(listener: ActionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Directly emit an action. Useful for UI buttons, Gamepads, WebSockets, or AI.
   */
  public emit(action: GameAction): void {
    for (const listener of this.listeners) {
      try {
        listener(action);
      } catch (err) {
        console.error('Error in input action listener:', err);
      }
    }
  }

  /**
   * Attach keyboard and touch listeners to a DOM element or window.
   */
  public attach(target: HTMLElement | Window = window): void {
    this.detach(); // Safety detach first
    this.targetElement = target;

    window.addEventListener('keydown', this.boundKeyDown, { passive: false });

    const touchTarget = target === window ? document.body : target;
    touchTarget.addEventListener('touchstart', this.boundTouchStart as EventListener, { passive: true });
    touchTarget.addEventListener('touchend', this.boundTouchEnd as EventListener, { passive: false });
  }

  /**
   * Clean up event listeners.
   */
  public detach(): void {
    window.removeEventListener('keydown', this.boundKeyDown);

    if (this.targetElement) {
      const touchTarget = this.targetElement === window ? document.body : this.targetElement;
      touchTarget.removeEventListener('touchstart', this.boundTouchStart as EventListener);
      touchTarget.removeEventListener('touchend', this.boundTouchEnd as EventListener);
      this.targetElement = null;
    }
  }

  /**
   * Keyboard handler: Arrow keys, WASD, and Space/Shift.
   */
  private handleKeyDown(e: KeyboardEvent): void {
    // Avoid interfering when user is typing in form inputs
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return;
    }

    let action: GameAction | null = null;

    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        action = 'MOVE_LEFT';
        break;

      case 'ArrowRight':
      case 'KeyD':
        action = 'MOVE_RIGHT';
        break;

      case 'ArrowUp':
      case 'KeyW':
        action = 'JUMP';
        break;

      case 'Space':
      case 'KeyH':
        action = 'HORN';
        break;

      case 'ArrowDown':
      case 'KeyS':
      case 'ShiftLeft':
      case 'ShiftRight':
        action = 'SLIDE';
        break;

      default:
        return;
    }

    if (action) {
      e.preventDefault();
      this.emit(action);
    }
  }

  /**
   * Record touch starting coordinates.
   */
  private handleTouchStart(e: TouchEvent): void {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
  }

  /**
   * Determine swipe vector and trigger action.
   */
  private handleTouchEnd(e: TouchEvent): void {
    if (e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const deltaTime = Date.now() - this.touchStartTime;

    if (deltaTime > this.maxSwipeTime) return;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check if movement exceeded threshold
    if (Math.max(absDeltaX, absDeltaY) < this.minSwipeDistance) return;

    // Horizontal swipe dominant
    if (absDeltaX > absDeltaY) {
      if (deltaX > 0) {
        this.emit('MOVE_RIGHT');
      } else {
        this.emit('MOVE_LEFT');
      }
    } else {
      // Vertical swipe dominant
      if (deltaY > 0) {
        this.emit('SLIDE');
      } else {
        this.emit('JUMP');
      }
    }
  }
}

// Global singleton instance for easy access or testing
export const globalInputHandler = new InputHandler();
