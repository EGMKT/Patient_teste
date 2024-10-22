declare module 'wavesurfer.js' {
  interface WaveSurferOptions {
    container: string | HTMLElement;
    waveColor?: string;
    progressColor?: string;
    cursorWidth?: number;
    cursorColor?: string;
    barWidth?: number;
    barRadius?: number;
    responsive?: boolean;
    height?: number;
    // Adicione outras opções conforme necessário
  }

  interface WaveSurferBackend {
    setBuffer?: (buffer: Float32Array) => void;
  }

  class WaveSurfer {
    constructor(options: WaveSurferOptions);
    static create(options: WaveSurferOptions): WaveSurfer;
    loadBlob(blob: Blob): void;
    destroy(): void;
    drawBuffer(): void;
    backend: WaveSurferBackend;
    // Adicione outros métodos conforme necessário
  }

  export default WaveSurfer;
}