'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Clock, X, Check, Plus, Trash2 } from 'lucide-react';

interface Reminder {
    id: string;
    habitName: string;
    time: string; // HH:MM format
    enabled: boolean;
    days: number[]; // 0-6 (Sun-Sat)
}

interface HabitRemindersProps {
    habitName?: string;
    onClose?: () => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Check if browser supports notifications
function supportsNotifications(): boolean {
    return 'Notification' in window;
}

// Request notification permission
async function requestPermission(): Promise<boolean> {
    if (!supportsNotifications()) return false;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

// Schedule a notification
function scheduleNotification(title: string, body: string, delay: number) {
    if (!supportsNotifications() || Notification.permission !== 'granted') return;

    setTimeout(() => {
        new Notification(title, {
            body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: 'habit-reminder',
            requireInteraction: true,
        });
    }, delay);
}

export function useHabitReminders() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        // Load reminders from localStorage
        const stored = localStorage.getItem('kalyan_reminders');
        if (stored) {
            try {
                setReminders(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse reminders');
            }
        }

        // Check notification permission
        if (supportsNotifications()) {
            setPermissionGranted(Notification.permission === 'granted');
        }
    }, []);

    const saveReminders = useCallback((newReminders: Reminder[]) => {
        setReminders(newReminders);
        localStorage.setItem('kalyan_reminders', JSON.stringify(newReminders));
    }, []);

    const addReminder = useCallback((habitName: string, time: string, days: number[]) => {
        const newReminder: Reminder = {
            id: Math.random().toString(36).slice(2),
            habitName,
            time,
            enabled: true,
            days,
        };
        saveReminders([...reminders, newReminder]);
        return newReminder;
    }, [reminders, saveReminders]);

    const removeReminder = useCallback((id: string) => {
        saveReminders(reminders.filter(r => r.id !== id));
    }, [reminders, saveReminders]);

    const toggleReminder = useCallback((id: string) => {
        saveReminders(reminders.map(r =>
            r.id === id ? { ...r, enabled: !r.enabled } : r
        ));
    }, [reminders, saveReminders]);

    const requestNotificationPermission = useCallback(async () => {
        const granted = await requestPermission();
        setPermissionGranted(granted);
        return granted;
    }, []);

    // Check and trigger reminders
    useEffect(() => {
        if (!permissionGranted) return;

        const checkReminders = () => {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const currentDay = now.getDay();

            reminders.forEach(reminder => {
                if (reminder.enabled &&
                    reminder.time === currentTime &&
                    reminder.days.includes(currentDay)) {
                    scheduleNotification(
                        '🎯 Habit Reminder',
                        `Time to: ${reminder.habitName}`,
                        0
                    );
                }
            });
        };

        // Check every minute
        const interval = setInterval(checkReminders, 60000);

        // Initial check
        checkReminders();

        return () => clearInterval(interval);
    }, [reminders, permissionGranted]);

    return {
        reminders,
        addReminder,
        removeReminder,
        toggleReminder,
        permissionGranted,
        requestNotificationPermission,
        supportsNotifications: supportsNotifications(),
    };
}

export function HabitRemindersModal({ habitName, onClose }: HabitRemindersProps) {
    const {
        reminders,
        addReminder,
        removeReminder,
        toggleReminder,
        permissionGranted,
        requestNotificationPermission,
        supportsNotifications: hasSupport,
    } = useHabitReminders();

    const [newTime, setNewTime] = useState('09:00');
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
    const [newHabitName, setNewHabitName] = useState(habitName || '');

    const handleAddReminder = () => {
        if (!newHabitName.trim()) return;
        addReminder(newHabitName, newTime, selectedDays);
        if (!habitName) {
            setNewHabitName('');
        }
    };

    const toggleDay = (day: number) => {
        setSelectedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day].sort()
        );
    };

    const habitReminders = habitName
        ? reminders.filter(r => r.habitName === habitName)
        : reminders;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: 480,
                    backgroundColor: 'white',
                    borderRadius: 20,
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '24px 24px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            padding: 10,
                            backgroundColor: '#eff6ff',
                            borderRadius: 12,
                        }}>
                            <Bell size={24} color="#3b82f6" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#0f172a' }}>
                                Habit Reminders
                            </h2>
                            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
                                Never miss your habits
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            style={{
                                padding: 8,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#94a3b8',
                            }}
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>

                <div style={{ padding: 24 }}>
                    {/* Permission Request */}
                    {hasSupport && !permissionGranted && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                padding: 16,
                                backgroundColor: '#fef3c7',
                                borderRadius: 12,
                                marginBottom: 20,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                            }}
                        >
                            <BellOff size={20} color="#d97706" />
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#92400e' }}>
                                    Notifications are disabled
                                </p>
                                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#a16207' }}>
                                    Enable to receive habit reminders
                                </p>
                            </div>
                            <button
                                onClick={requestNotificationPermission}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#f59e0b',
                                    border: 'none',
                                    borderRadius: 8,
                                    color: 'white',
                                    fontWeight: 500,
                                    fontSize: 13,
                                    cursor: 'pointer',
                                }}
                            >
                                Enable
                            </button>
                        </motion.div>
                    )}

                    {!hasSupport && (
                        <div style={{
                            padding: 16,
                            backgroundColor: '#fee2e2',
                            borderRadius: 12,
                            marginBottom: 20,
                        }}>
                            <p style={{ margin: 0, fontSize: 14, color: '#991b1b' }}>
                                Your browser doesn't support notifications. Please try a different browser.
                            </p>
                        </div>
                    )}

                    {/* Add New Reminder */}
                    <div style={{
                        padding: 20,
                        backgroundColor: '#f8fafc',
                        borderRadius: 16,
                        marginBottom: 20,
                    }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#334155' }}>
                            Add New Reminder
                        </h3>

                        {!habitName && (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                                    Habit Name
                                </label>
                                <input
                                    type="text"
                                    value={newHabitName}
                                    onChange={e => setNewHabitName(e.target.value)}
                                    placeholder="e.g., Morning Meditation"
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: 10,
                                        border: '1px solid #e2e8f0',
                                        fontSize: 14,
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        )}

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                                Time
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Clock size={18} color="#64748b" />
                                <input
                                    type="time"
                                    value={newTime}
                                    onChange={e => setNewTime(e.target.value)}
                                    style={{
                                        padding: '10px 14px',
                                        borderRadius: 10,
                                        border: '1px solid #e2e8f0',
                                        fontSize: 14,
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                                Repeat on
                            </label>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {DAYS.map((day, idx) => (
                                    <button
                                        key={day}
                                        onClick={() => toggleDay(idx)}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 10,
                                            border: 'none',
                                            backgroundColor: selectedDays.includes(idx) ? '#6366f1' : '#e2e8f0',
                                            color: selectedDays.includes(idx) ? 'white' : '#64748b',
                                            fontWeight: 500,
                                            fontSize: 12,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {day.slice(0, 1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleAddReminder}
                            disabled={!newHabitName.trim() || selectedDays.length === 0}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: 10,
                                border: 'none',
                                backgroundColor: '#6366f1',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                opacity: (!newHabitName.trim() || selectedDays.length === 0) ? 0.5 : 1,
                            }}
                        >
                            <Plus size={18} />
                            Add Reminder
                        </button>
                    </div>

                    {/* Existing Reminders */}
                    {habitReminders.length > 0 && (
                        <div>
                            <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#334155' }}>
                                Your Reminders
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {habitReminders.map(reminder => (
                                    <motion.div
                                        key={reminder.id}
                                        layout
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        style={{
                                            padding: 14,
                                            backgroundColor: reminder.enabled ? '#f0fdf4' : '#f8fafc',
                                            borderRadius: 12,
                                            border: `1px solid ${reminder.enabled ? '#bbf7d0' : '#e2e8f0'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                        }}
                                    >
                                        <button
                                            onClick={() => toggleReminder(reminder.id)}
                                            style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: 6,
                                                border: 'none',
                                                backgroundColor: reminder.enabled ? '#22c55e' : '#e2e8f0',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {reminder.enabled && <Check size={14} color="white" />}
                                        </button>
                                        <div style={{ flex: 1 }}>
                                            <p style={{
                                                margin: 0,
                                                fontSize: 14,
                                                fontWeight: 500,
                                                color: reminder.enabled ? '#166534' : '#64748b',
                                            }}>
                                                {reminder.habitName}
                                            </p>
                                            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                                                {reminder.time} • {reminder.days.map(d => DAYS[d].slice(0, 1)).join(', ')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeReminder(reminder.id)}
                                            style={{
                                                padding: 6,
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#ef4444',
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// Quick reminder button component
export function ReminderBellButton({ onClick }: { onClick: () => void }) {
    const { reminders, permissionGranted } = useHabitReminders();
    const activeReminders = reminders.filter(r => r.enabled).length;

    return (
        <button
            onClick={onClick}
            style={{
                position: 'relative',
                padding: 10,
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            title="Habit Reminders"
        >
            <Bell size={20} color={permissionGranted ? '#6366f1' : '#94a3b8'} />
            {activeReminders > 0 && (
                <span style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {activeReminders}
                </span>
            )}
        </button>
    );
}
