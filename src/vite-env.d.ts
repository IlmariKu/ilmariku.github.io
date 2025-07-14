/// <reference types="vite/client" />

// Wake Lock API types
interface WakeLockSentinel extends EventTarget {
    readonly released: boolean;
    readonly type: 'screen';
    release(): Promise<void>;
}

interface Navigator {
    wakeLock?: {
        request(type: 'screen'): Promise<WakeLockSentinel>;
    };
}
