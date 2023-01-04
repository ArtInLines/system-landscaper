/**
 * @author Andrei Kashcha (aka anvaka) / https://github.com/anvaka
 * @author ArtInLines / Updated to TypeScript + Minor Changes (https://github.com/artinlines)
 */
export default function dragndrop(element: HTMLElement): {
    onStart: (callback: any) => any;
    onDrag: (callback: any) => any;
    onStop: (callback: any) => any;
    /**
     * Occurs when mouse wheel event happens. callback = function(e, scrollDelta, scrollPoint);
     */
    onScroll: (callback: any) => any;
    release: () => void;
};
