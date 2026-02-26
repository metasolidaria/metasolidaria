

## Analysis

The `HeroGroupsPreview` carousel already includes the `embla-carousel-autoplay` plugin with `delay: 4000`, `stopOnInteraction: true`, and `stopOnMouseEnter: true`. It should already be auto-scrolling.

However, `stopOnInteraction: true` means that once a user scrolls, clicks, or touches the carousel, autoplay stops permanently. This could make it seem like autoplay isn't working.

## Plan

1. **In `src/components/HeroGroupsPreview.tsx`**: Change `stopOnInteraction` from `true` to `false` so autoplay resumes after user interaction. Keep `stopOnMouseEnter: true` so it pauses on hover but resumes when the mouse leaves.

This single change should make the carousel feel consistently automatic.

