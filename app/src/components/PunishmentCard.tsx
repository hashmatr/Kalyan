'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Skull, Flame, CheckCircle, Clock } from 'lucide-react';
import { Punishment } from '@/types';
import { PUNISHMENTS } from '@/lib/constants';

interface PunishmentModalProps {
    punishment: Punishment | null;
    onClose: () => void;
    isOpen: boolean;
}

export function PunishmentModal({ punishment, onClose, isOpen }: PunishmentModalProps) {
    if (!punishment) return null;

    const punishmentInfo = PUNISHMENTS[punishment.severity];

    const severityColors = {
        warning: 'from-yellow-500 to-amber-600',
        minor: 'from-orange-500 to-red-500',
        major: 'from-red-500 to-rose-600',
        critical: 'from-red-700 to-rose-900',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                        className={`
              relative w-full max-w-md p-8 rounded-3xl
              bg-gradient-to-br ${severityColors[punishment.severity]}
              shadow-2xl
            `}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>

                        {/* Warning icon */}
                        <motion.div
                            animate={{
                                rotate: [-10, 10, -10],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="flex justify-center mb-6"
                        >
                            <div className="p-4 rounded-full bg-white/20">
                                {punishment.severity === 'critical' ? (
                                    <Skull className="w-12 h-12 text-white" />
                                ) : (
                                    <AlertTriangle className="w-12 h-12 text-white" />
                                )}
                            </div>
                        </motion.div>

                        {/* Content */}
                        <div className="text-center">
                            <div className="text-4xl mb-4">{punishmentInfo.icon}</div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {punishmentInfo.name}
                            </h2>
                            <p className="text-white/80 mb-4">
                                {punishmentInfo.description}
                            </p>

                            <div className="bg-white/10 rounded-xl p-4 mb-6">
                                <p className="text-sm text-white/70">Habit Broken:</p>
                                <p className="text-white font-semibold">{punishment.habitBroken}</p>
                                <p className="text-xs text-white/50 mt-2">
                                    {punishment.triggeredDate}
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-3 px-6 rounded-xl bg-white/20 hover:bg-white/30 
                  text-white font-semibold transition-colors"
                            >
                                I Accept & Will Do Better
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

interface PunishmentListProps {
    punishments: Punishment[];
    onComplete?: (id: string) => void;
}

export function PunishmentList({ punishments, onComplete }: PunishmentListProps) {
    if (punishments.length === 0) {
        return (
            <div className="text-center py-12">
                <Flame className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Clean Record!</h3>
                <p className="text-slate-500">No punishments yet. Keep up the discipline!</p>
            </div>
        );
    }

    const severityColors = {
        warning: 'border-yellow-500/50 bg-yellow-500/10',
        minor: 'border-orange-500/50 bg-orange-500/10',
        major: 'border-red-500/50 bg-red-500/10',
        critical: 'border-rose-700/50 bg-rose-700/10',
    };

    // Sort: Active first, then by date desc
    const sortedPunishments = [...punishments].sort((a, b) => {
        if (a.completed === b.completed) {
            return new Date(b.triggeredDate).getTime() - new Date(a.triggeredDate).getTime();
        }
        return a.completed ? 1 : -1;
    });

    return (
        <div className="space-y-6">
            {sortedPunishments.map((punishment, index) => {
                const punishmentInfo = PUNISHMENTS[punishment.severity];
                const isCompleted = punishment.completed;

                return (
                    <motion.div
                        key={punishment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: isCompleted ? 0.6 : 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                            p-4 rounded-xl border-2 transition-all duration-300
                            ${isCompleted
                                ? 'border-emerald-500/30 bg-emerald-500/5'
                                : severityColors[punishment.severity]
                            }
                        `}
                    >
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex items-start gap-4 flex-1">
                                <div className={`
                                    text-2xl p-2 rounded-lg
                                    ${isCompleted ? 'bg-emerald-500/20 text-emerald-500' : ''}
                                `}>
                                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : punishmentInfo.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h4 className={`
                                            font-semibold 
                                            ${isCompleted ? 'text-emerald-600 line-through' : 'text-slate-900'}
                                        `}>
                                            {punishmentInfo.name}
                                        </h4>
                                        <span className={`
                                            px-2 py-0.5 rounded-full text-xs font-medium uppercase
                                            ${isCompleted
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : punishment.severity === 'critical' ? 'bg-rose-500 text-white'
                                                    : punishment.severity === 'major' ? 'bg-red-500 text-white'
                                                        : punishment.severity === 'minor' ? 'bg-orange-500 text-white'
                                                            : 'bg-yellow-500 text-black'
                                            }
                                        `}>
                                            {isCompleted ? 'Resolved' : punishment.severity}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600">{punishment.habitBroken}</p>
                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {punishment.triggeredDate}
                                    </p>
                                </div>
                            </div>

                            {onComplete && (
                                <button
                                    onClick={() => onComplete(punishment.id)}
                                    className={`
                                        md:self-center w-full md:w-auto px-4 py-2 rounded-lg
                                        border text-sm font-medium transition-all
                                        flex items-center justify-center gap-2
                                        ${isCompleted
                                            ? 'bg-emerald-100 border-emerald-200 text-emerald-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                                            : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                                        }
                                    `}
                                >
                                    {isCompleted ? <X className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                    {isCompleted ? 'Undo' : 'Mark Done'}
                                </button>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
