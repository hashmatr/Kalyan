'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

// Register GSAP plugins
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    // Note: ScrollSmoother requires GSAP Club membership
    // We'll use CSS-based smooth scroll with GSAP animations instead
}

interface SmoothScrollProviderProps {
    children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Apply smooth scrolling via CSS
        document.documentElement.style.scrollBehavior = 'smooth';

        // GSAP ScrollTrigger for scroll-based animations
        ScrollTrigger.defaults({
            toggleActions: 'play none none reverse',
            start: 'top 85%',
        });

        // Refresh ScrollTrigger on resize
        const handleResize = () => {
            ScrollTrigger.refresh();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            ScrollTrigger.killAll();
        };
    }, []);

    return (
        <>
            {children}
        </>
    );
}

// Hook for scroll-triggered animations
export function useScrollAnimation(
    selector: string,
    animation: gsap.TweenVars = {},
    trigger?: gsap.plugins.ScrollTriggerInstanceVars
) {
    useEffect(() => {
        const elements = document.querySelectorAll(selector);

        elements.forEach((element) => {
            gsap.fromTo(element,
                {
                    opacity: 0,
                    y: 30,
                    ...animation.from
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                        ...trigger,
                    },
                    ...animation,
                }
            );
        });

        return () => {
            ScrollTrigger.getAll().forEach(st => st.kill());
        };
    }, [selector, animation, trigger]);
}

// Staggered animation for lists
export function useStaggerAnimation(containerSelector: string, itemSelector: string) {
    useEffect(() => {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const items = container.querySelectorAll(itemSelector);

        gsap.fromTo(items,
            {
                opacity: 0,
                y: 20,
                scale: 0.95,
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.4,
                stagger: 0.08,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: container,
                    start: 'top 80%',
                },
            }
        );

        return () => {
            ScrollTrigger.getAll().forEach(st => st.kill());
        };
    }, [containerSelector, itemSelector]);
}

// Page transition animation
export function usePageTransition() {
    useEffect(() => {
        // Initial page load animation
        const tl = gsap.timeline();

        tl.fromTo('main',
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: 'power2.out' }
        );

        tl.fromTo('header',
            { y: -20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
            '-=0.3'
        );

        return () => {
            tl.kill();
        };
    }, []);
}
