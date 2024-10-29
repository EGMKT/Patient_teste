declare module 'wavesurfer.js' {
  interface WaveSurferOptions {
    container: string | HTMLElement;
    waveColor?: string;
    progressColor?: string;
    backgroundColor?: string;
    cursorWidth?: number;
    cursorColor?: string;
    barWidth?: number;
    barRadius?: number;
    barGap?: number;
    responsive?: boolean;
    height?: number;
    normalize?: boolean;
    partialRender?: boolean;
    interact?: boolean;
    hideScrollbar?: boolean;
    autoCenter?: boolean;
    mediaControls?: boolean;
    backend?: string;
    plugins?: any[];
    smoothingTimeConstant?: number;
    minPxPerSec?: number;
    fillParent?: boolean;
    scrollParent?: boolean;
    audioContext?: AudioContext;
    mediaType?: string;
    renderFunction?: (peaks: number[][], width: number) => void;
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
    on(event: string, callback: Function): void;
    play(): void;
    pause(): void;
    stop(): void;
    seekTo(progress: number): void;
    setVolume(newVolume: number): void;
    getVolume(): number;
    exportPCM(): Float32Array;
    exportImage(format: string, quality: number): string;
  }

  export default WaveSurfer;
}
