import { createContext, useContext, useEffect } from "react";

type DeclaredEvents = {
  [key: string]: unknown;
};

type DeclaredEventListeners<T extends DeclaredEvents> = {
  [K in keyof T]: Set<(event: T[K]) => void>;
};

/**
 * An event emitter.
 */
export type DeclaredEventsEmitter<T extends DeclaredEvents> = {
  [K in keyof T]: (event: T[K]) => void;
};

/**
 * An event subscriber.
 */
export type DeclaredEventsSubscription<T extends DeclaredEvents> = {
  [K in keyof T]: {
    useSubscription: (callback: (event: T[K]) => void) => void;
  };
};

/**
 * Define the events to use in your app.
 * @returns The event emitter and listener.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function declareEvents<T extends DeclaredEvents = {}>() {
  const sharedListeners = {} as DeclaredEventListeners<T>;

  const EventContext = createContext(sharedListeners);

  function createEventEmitter() {
    return new Proxy({} as DeclaredEventsEmitter<T>, {
      get(_, key) {
        return (event: T[keyof T]) => {
          const subscribers = sharedListeners[key as keyof T];

          if (subscribers) {
            for (const subscriber of subscribers) {
              subscriber(event);
            }
          }
        };
      },
    });
  }

  function createEventListener() {
    return new Proxy({} as DeclaredEventsSubscription<T>, {
      get(_, key) {
        return {
          /**
           * Subscribe to an event.
           */
          useSubscription(callback: (event: T[keyof T]) => void) {
            const listeners = useContext(EventContext);

            useEffect(() => {
              const k = key as keyof T;

              if (!listeners[k]) {
                listeners[k] = new Set();
              }

              listeners[k].add(callback);

              return () => {
                listeners[k].delete(callback);
              };
            }, []);
          },
        };
      },
    });
  }

  return {
    /**
     * An emitter to send event to all the subscribers.
     */
    eventEmitter: createEventEmitter(),

    /**
     * Provide a mechanism to subscribe to events.
     */
    eventListener: createEventListener(),
  };
}
