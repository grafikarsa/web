'use client';

import { useEffect, useRef, useState } from 'react';

interface TwitterEmbedProps {
    url: string;
}

export function TwitterEmbed({ url }: TwitterEmbedProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!url) return;

        // Reset state on URL change
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
        }
        setError(false);
        setIsLoading(true);

        // Create blockquote element
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'twitter-tweet';
        blockquote.setAttribute('data-dnt', 'true');
        blockquote.setAttribute('data-theme', 'light');

        // Create anchor
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.textContent = 'Loading tweet...';
        blockquote.appendChild(anchor);

        // Append to container
        if (containerRef.current) {
            containerRef.current.appendChild(blockquote);
        }

        // Function to load widgets
        const loadWidgets = () => {
            // @ts-ignore
            if (window.twttr && window.twttr.widgets) {
                // @ts-ignore
                window.twttr.widgets.load(containerRef.current).then(() => {
                    setIsLoading(false);
                });
            }
        };

        // Check if script exists
        // @ts-ignore
        if (window.twttr) {
            loadWidgets();
        } else {
            // Load script if not present
            const script = document.createElement('script');
            script.src = "https://platform.twitter.com/widgets.js";
            script.async = true;
            script.charset = "utf-8";
            script.onload = loadWidgets;
            script.onerror = () => {
                setError(true);
                setIsLoading(false);
            };

            // Prevent duplicate script injection if possible, or just let it load
            if (!document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')) {
                document.body.appendChild(script);
            } else {
                // If script is loading but not ready, wait a bit
                // or just rely on the fact that existing script should trigger widgets.load? 
                // No, widgets.js only scans on load. We need to manually call load.
                // We can poll for twttr
                const interval = setInterval(() => {
                    // @ts-ignore
                    if (window.twttr) {
                        loadWidgets();
                        clearInterval(interval);
                    }
                }, 100);
            }
        }
    }, [url]);

    return (
        <div className="flex w-full justify-center">
            <div ref={containerRef} className="min-h-[200px] w-full max-w-[550px]" />
            {error && <p className="text-sm text-red-500">Gagal memuat Tweet.</p>}
        </div>
    );
}
