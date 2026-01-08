'use client';

import { useState, useEffect } from 'react';
import { Download, Share, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Detect iOS
        const isDeviceIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        if (isDeviceIOS && !isStandalone) {
            setIsIOS(true);
            setSupportsPWA(true); // Technically we can't "prompt" but we can show instructions
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const onClick = (evt: React.MouseEvent) => {
        evt.preventDefault();
        if (promptInstall) {
            promptInstall.prompt();
        } else if (isIOS) {
            setShowIOSInstructions(true);
        }
    };

    if (!supportsPWA) {
        return null;
    }

    return (
        <>
            <button
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                onClick={onClick}
            >
                <Download className="w-5 h-5" />
                <span className="font-medium">Install App</span>
            </button>

            <AnimatePresence>
                {showIOSInstructions && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                        onClick={() => setShowIOSInstructions(false)}
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm mb-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4 text-slate-900">
                                <Download className="w-6 h-6" />
                                <h3 className="text-lg font-bold">Install Application</h3>
                            </div>
                            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                                To install this app on your iOS device:
                                <br /><br />
                                1. Tap the <Share className="w-4 h-4 inline mx-1" /> <strong>Share</strong> button
                                <br />
                                2. Scroll down and tap <PlusSquare className="w-4 h-4 inline mx-1" /> <strong>Add to Home Screen</strong>
                            </p>
                            <button
                                onClick={() => setShowIOSInstructions(false)}
                                className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold"
                            >
                                Got it!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
