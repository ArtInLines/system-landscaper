/**
 * @author Andrei Kashcha (aka anvaka) / https://github.com/anvaka
 * @author ArtInLines / Updated to TypeScript + Minor changes (https://github.com/artinlines)
 */
export default function createTimer(): (callback: () => any) => {
    /**
     * Stops execution of the callback
     */
    stop: () => void;
    restart: () => void;
};
