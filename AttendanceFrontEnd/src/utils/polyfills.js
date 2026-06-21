// This file provides polyfills for Node.js built-in modules in the browser environment
import { Buffer } from 'buffer';

// Add Buffer to window
window.Buffer = Buffer;

// Add process to window
if (typeof window.process === 'undefined') {
  window.process = { env: {} };
}

// Add global to window
if (typeof window.global === 'undefined') {
  window.global = window;
}
