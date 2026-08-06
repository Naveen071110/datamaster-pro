/// <reference types="vite/client" />

declare module 'sql.js';
declare module '*.wasm?url' {
  const content: string;
  export default content;
}
