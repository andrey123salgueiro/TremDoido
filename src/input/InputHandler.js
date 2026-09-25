/**
 * InputHandler.js
 * JavaScript mirror & export of the decoupled InputHandler architecture.
 * Manages all game commands in a single place and emits generic events:
 *  - MOVE_LEFT
 *  - MOVE_RIGHT
 *  - JUMP
 *  - SLIDE
 *  - HORN
 *
 * Designed to be swapped with Gamepads, WebSockets, Voice Recognition,
 * or Computer Vision simply by emitting these events.
 */

export { InputHandler, globalInputHandler } from './InputHandler.ts';
