declare global {
  interface Window {
    __rsvshopTimers?: number[];
    __rsvshopTimeoutTimers?: number[];
    __rsvshopEventListeners?: Array<{element: Element, event: string, handler: EventListener}>;
    __rsvshopWebSockets?: WebSocket[];
    __rsvshopEventSources?: EventSource[];
    __rsvshopAbortController?: AbortController;
    __rsvshopBackgroundTimers?: number[];
    __rsvshopMemoryUtils?: {
      registerTimer: (timer: number, type?: 'interval' | 'timeout') => void;
      registerEventListener: (element: Element, event: string, handler: EventListener) => void;
      registerWebSocket: (ws: WebSocket) => void;
      registerEventSource: (es: EventSource) => void;
      checkMemoryUsage: () => void;
    };
    errorMonitor?: any;
    __NEXT_DATA__?: any;
    __rsvshopPingTimer?: number;
    gc?: () => void;
  }
}

export {};
