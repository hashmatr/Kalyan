'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isFuture } from 'date-fns';
import {
  Flame, Trophy, Target, Calendar, Award, AlertTriangle,
  Menu, X, Zap, Crown, BarChart3
} from 'lucide-react';

import { DailyProgress, ViewMode, Punishment, UserStats } from '@/types';
import { DEFAULT_HABITS, REWARDS } from '@/lib/constants';
import {
  getAllProgress, getProgressForDate, saveProgress,
  getStats, getRewards, getPunishments, addPunishment, completePunishment,
  calculateDailyScore, getWeeklyStats, getMonthlyStats, getYearlyStats,
  isFirstLaunch, markAsLaunched
} from '@/lib/storage';

import { HabitCard } from '@/components/HabitCard';
import { StatsCard } from '@/components/StatsCard';
import { RewardsGrid } from '@/components/RewardCard';
import { ProgressRing, ProgressBar } from '@/components/ProgressRing';
import { CalendarView } from '@/components/CalendarView';
import { WeeklyChart, MonthlyChart, HabitsPieChart, YearlyChart } from '@/components/Charts';
import { PunishmentModal, PunishmentList } from '@/components/PunishmentCard';
import { CelebrationModal } from '@/components/CelebrationModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeProvider } from '@/components/ThemeContext';

type ExtendedViewMode = ViewMode | 'rewards' | 'punishments';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ExtendedViewMode>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habits, setHabits] = useState<Record<string, boolean>>({});
  const [allProgress, setAllProgress] = useState<Record<string, DailyProgress>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [celebrationModal, setCelebrationModal] = useState<{
    isOpen: boolean;
    type: 'streak' | 'reward' | 'perfect';
    title: string;
    message: string;
    icon?: string;
  }>({ isOpen: false, type: 'streak', title: '', message: '' });

  const [punishmentModal, setPunishmentModal] = useState<{
    isOpen: boolean;
    punishment: Punishment | null;
  }>({ isOpen: false, punishment: null });

  useEffect(() => {
    setMounted(true);
    loadData();

    if (isFirstLaunch()) {
      markAsLaunched();
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const progress = getProgressForDate(dateStr);

      if (progress) {
        setHabits(progress.habits);
      } else {
        const initialHabits: Record<string, boolean> = {};
        DEFAULT_HABITS.forEach(habit => {
          initialHabits[habit.id] = false;
        });
        setHabits(initialHabits);
      }
    }
  }, [selectedDate, mounted]);

  const loadData = () => {
    setAllProgress(getAllProgress());
  };

  const toggleHabit = useCallback((habitId: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const isTodayDate = isToday(selectedDate);

    if (isFuture(selectedDate) && !isTodayDate) return;

    const newHabits = { ...habits, [habitId]: !habits[habitId] };
    setHabits(newHabits);

    const score = calculateDailyScore(newHabits);
    const previousProgress = allProgress[dateStr];

    const wasBroken = previousProgress?.habits[habitId] && !newHabits[habitId];

    const progress: DailyProgress = {
      date: dateStr,
      habits: newHabits,
      score,
      streakBroken: wasBroken || (previousProgress?.streakBroken ?? false),
    };

    saveProgress(dateStr, progress);
    loadData();

    if (score === 100 && previousProgress?.score !== 100) {
      setTimeout(() => {
        setCelebrationModal({
          isOpen: true,
          type: 'perfect',
          title: 'Perfect Day! 🎉',
          message: 'You completed ALL habits today! You\'re unstoppable!',
        });
      }, 500);
    }

    const stats = getStats();
    const streakMilestones = [7, 10, 14, 20, 30, 45, 60, 75, 90, 100, 180, 365, 500, 1000];
    const newMilestone = streakMilestones.find(m => m === stats.currentStreak);

    if (newMilestone && score >= 80) {
      const reward = REWARDS.find(r => r.daysRequired === newMilestone);
      if (reward) {
        setTimeout(() => {
          setCelebrationModal({
            isOpen: true,
            type: 'reward',
            title: `${reward.name} Unlocked!`,
            message: reward.description,
            icon: reward.icon,
          });
        }, 1000);
      }
    }

    if (wasBroken) {
      const habit = DEFAULT_HABITS.find(h => h.id === habitId);
      const punishment: Punishment = {
        id: `${Date.now()}`,
        name: 'Habit Broken',
        description: `You broke the ${habit?.name} habit`,
        triggeredDate: format(new Date(), 'yyyy-MM-dd HH:mm'),
        habitBroken: habit?.name || habitId,
        severity: 'minor',
      };

      addPunishment(punishment);

      setTimeout(() => {
        setPunishmentModal({ isOpen: true, punishment });
      }, 300);
    }
  }, [habits, selectedDate, allProgress]);

  const handleCompletePunishment = (id: string) => {
    completePunishment(id);
    loadData();
  };

  const stats: UserStats = mounted ? getStats() : {
    currentStreak: 0,
    longestStreak: 0,
    totalDaysTracked: 0,
    perfectDays: 0,
    totalScore: 0,
    averageScore: 0,
    rewardsUnlocked: 0,
    punishments: 0,
    startDate: format(new Date(), 'yyyy-MM-dd'),
  };

  const rewards = mounted ? getRewards() : REWARDS;
  const punishments = mounted ? getPunishments() : [];
  const dailyScore = calculateDailyScore(habits);
  const weeklyStats = mounted ? getWeeklyStats(selectedDate) : null;
  const monthlyStats = mounted ? getMonthlyStats(selectedDate) : null;
  const yearlyStats = mounted ? getYearlyStats(new Date().getFullYear()) : null;

  const navigationItems = [
    { id: 'daily', label: 'Daily', icon: Target },
    { id: 'weekly', label: 'Weekly', icon: Calendar },
    { id: 'monthly', label: 'Monthly', icon: BarChart3 },
    { id: 'yearly', label: 'Yearly', icon: Trophy },
    { id: 'rewards', label: 'Rewards', icon: Award },
    { id: 'punishments', label: 'Punishments', icon: AlertTriangle },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <main className="min-h-screen pb-24 transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800 shadow-sm transition-colors duration-300">
          <div className="container-app">
            <div className="flex items-center justify-between h-16 lg:h-20">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className={`
                p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-red-600
                ${stats.currentStreak >= 7 ? 'beast-mode' : ''}
              `}>
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gradient-beast">KALYAN</h1>
                  <p className="text-xs text-slate-500 hidden sm:block">Beast Mode Activated</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-3">
                {navigationItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setViewMode(item.id as ExtendedViewMode)}
                    className={`
                    flex items-center gap-2.5 px-5 py-2.5 rounded-xl
                    transition-all duration-200 text-sm font-medium
                    ${viewMode === item.id
                        ? 'tab-active'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                      }
                  `}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Streak Badge */}
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-900 dark:text-white transition-colors">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-base font-bold">{stats.currentStreak}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">day streak</span>
                </div>

                <ThemeToggle />

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg"
              >
                <div className="container-app py-4 space-y-2">
                  {navigationItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setViewMode(item.id as ExtendedViewMode);
                        setMobileMenuOpen(false);
                      }}
                      className={`
                      flex items-center gap-3 w-full px-4 py-3 rounded-xl
                      transition-all duration-200
                      ${viewMode === item.id
                          ? 'tab-active'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                        }
                    `}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}

                  <div className="flex items-center justify-center gap-2 py-3 mt-2 border-t border-slate-200 dark:border-slate-800">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-bold text-slate-900 dark:text-white">{stats.currentStreak} day streak</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Main Content */}
        <div className="container-app py-16">
          {/* Stats Overview - Layer 1 */}
          <section className="mb-32 py-8 lg:py-12">
            <StatsCard stats={stats} />
          </section>

          {/* Daily View */}
          {viewMode === 'daily' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Calendar & Progress - Layer 2 */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-40">
                <div className="xl:col-span-2">
                  <CalendarView
                    progress={allProgress}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                  />
                </div>

                <div className="glass-card p-8 flex flex-col items-center justify-center">
                  <h3 className="text-base font-medium text-slate-500 mb-6">
                    {isToday(selectedDate) ? "Today's Progress" : format(selectedDate, 'MMM d, yyyy')}
                  </h3>
                  <ProgressRing progress={dailyScore} size={160} strokeWidth={12} />
                  <p className="text-slate-500 text-base mt-6">
                    {Object.values(habits).filter(Boolean).length} of {DEFAULT_HABITS.length} habits completed
                  </p>
                  {dailyScore === 100 && (
                    <div className="flex items-center gap-2 mt-4 text-emerald-600 font-bold text-lg">
                      <Crown className="w-6 h-6" />
                      PERFECT DAY!
                    </div>
                  )}
                </div>
              </div>

              {/* Habits List - Layer 3 */}
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-16 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  Daily Habits
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {DEFAULT_HABITS.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      isCompleted={habits[habit.id] || false}
                      onToggle={toggleHabit}
                      disabled={isFuture(selectedDate) && !isToday(selectedDate)}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Weekly View */}
          {viewMode === 'weekly' && weeklyStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-16"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
                <div className="glass-card p-6 lg:p-8 text-center">
                  <p className="text-slate-500 text-sm mb-3">Week Average</p>
                  <p className="text-3xl lg:text-4xl font-bold text-gradient-purple">{weeklyStats.averageScore}%</p>
                </div>
                <div className="glass-card p-6 lg:p-8 text-center">
                  <p className="text-slate-500 text-sm mb-3">Habits Done</p>
                  <p className="text-3xl lg:text-4xl font-bold text-gradient-green">{weeklyStats.completedHabits}</p>
                </div>
                <div className="glass-card p-6 lg:p-8 text-center">
                  <p className="text-slate-500 text-sm mb-3">Perfect Days</p>
                  <p className="text-3xl lg:text-4xl font-bold text-gradient-orange">{weeklyStats.perfectDays}</p>
                </div>
                <div className="glass-card p-6 lg:p-8 text-center">
                  <p className="text-slate-500 text-sm mb-3">Days Tracked</p>
                  <p className="text-3xl lg:text-4xl font-bold text-slate-900">{weeklyStats.daysWithData}/7</p>
                </div>
              </div>

              <WeeklyChart progress={allProgress} />
              <div style={{ marginTop: '2rem' }}>
                <HabitsPieChart progress={allProgress} />
              </div>
            </motion.div>
          )}

          {/* Monthly View */}
          {viewMode === 'monthly' && monthlyStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-16"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
                <div className="glass-card p-6 lg:p-8 text-center">
                  <p className="text-slate-500 text-sm mb-3">Month Average</p>
                  <p className="text-3xl lg:text-4xl font-bold text-gradient-purple">{monthlyStats.averageScore}%</p>
                </div>
                <div className="glass-card p-6 lg:p-8 text-center">
                  <p className="text-slate-500 text-sm mb-3">Days Tracked</p>
                  <p className="text-3xl lg:text-4xl font-bold text-gradient-green">{monthlyStats.totalDays}</p>
                </div>
                <div className="glass-card p-6 lg:p-8 text-center">
                  <p className="text-slate-500 text-sm mb-3">Perfect Days</p>
                  <p className="text-3xl lg:text-4xl font-bold text-gradient-orange">{monthlyStats.perfectDays}</p>
                </div>
                <div className="glass-card p-6 lg:p-8 text-center">
                  <p className="text-slate-500 text-sm mb-3">Completion</p>
                  <p className="text-3xl lg:text-4xl font-bold text-slate-900">
                    {monthlyStats.totalDays > 0
                      ? Math.round((monthlyStats.totalDays / monthlyStats.daysInMonth) * 100)
                      : 0}%
                  </p>
                </div>
              </div>

              <MonthlyChart progress={allProgress} />

              <div className="glass-card p-6 lg:p-8" style={{ marginTop: '2rem' }}>
                <h3 className="text-lg lg:text-xl font-semibold text-slate-900 mb-8">Habit Completion This Month</h3>
                <div className="space-y-6">
                  {DEFAULT_HABITS.map(habit => {
                    const completed = monthlyStats.habitsCompletion[habit.id] || 0;
                    const percentage = monthlyStats.totalDays > 0
                      ? Math.round((completed / monthlyStats.totalDays) * 100)
                      : 0;

                    return (
                      <ProgressBar
                        key={habit.id}
                        progress={percentage}
                        label={habit.name}
                        color={percentage >= 80 ? 'from-emerald-500 to-green-500' :
                          percentage >= 50 ? 'from-yellow-500 to-amber-500' :
                            'from-red-500 to-rose-500'}
                      />
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Yearly View */}
          {viewMode === 'yearly' && yearlyStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-16"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
                <div className="glass-card p-6 lg:p-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Year Average</p>
                  <p className="text-3xl lg:text-4xl font-bold text-gradient-purple">{yearlyStats.averageScore}%</p>
                </div>
                <div className="glass-card p-6 lg:p-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Days Tracked</p>
                  <p className="text-3xl lg:text-4xl font-bold text-gradient-green">{yearlyStats.totalDays}</p>
                </div>
                <div className="glass-card p-6 lg:p-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Perfect Days</p>
                  <p className="text-3xl lg:text-4xl font-bold text-gradient-orange">{yearlyStats.perfectDays}</p>
                </div>
                <div className="glass-card p-6 lg:p-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">Rewards</p>
                  <p className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">{yearlyStats.rewardsEarned}</p>
                </div>
              </div>

              <YearlyChart monthlyScores={yearlyStats.monthlyScores} year={yearlyStats.year} />
            </motion.div>
          )}

          {/* Rewards View */}
          {viewMode === 'rewards' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-32 text-center">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-3">🏆 Achievements</h2>
                <p className="text-slate-500 dark:text-slate-400 text-base lg:text-lg">
                  {rewards.filter(r => r.unlocked).length} of {rewards.length} unlocked
                </p>
              </div>
              <RewardsGrid rewards={rewards} />
            </motion.div>
          )}

          {/* Punishments View */}
          {viewMode === 'punishments' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-32">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-3">⚠️ Accountability Log</h2>
                <p className="text-slate-500 dark:text-slate-400 text-base lg:text-lg">Learn from your mistakes</p>
              </div>
              <div className="glass-card p-6 lg:p-8">
                <PunishmentList punishments={punishments} onComplete={handleCompletePunishment} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Modals */}
        <CelebrationModal
          isOpen={celebrationModal.isOpen}
          onClose={() => setCelebrationModal(prev => ({ ...prev, isOpen: false }))}
          type={celebrationModal.type}
          title={celebrationModal.title}
          message={celebrationModal.message}
          icon={celebrationModal.icon}
        />

        <PunishmentModal
          isOpen={punishmentModal.isOpen}
          punishment={punishmentModal.punishment}
          onClose={() => setPunishmentModal({ isOpen: false, punishment: null })}
        />

        {/* Floating Streak Badge */}
        {stats.currentStreak >= 7 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 z-30"
          >
            <div className={`
            flex items-center gap-2 px-5 py-3 rounded-full
            bg-gradient-to-r from-orange-500 to-red-600
            shadow-lg
            ${stats.currentStreak >= 30 ? 'beast-mode' : ''}
          `}>
              <Flame className="w-5 h-5 text-white" />
              <span className="font-bold text-white">
                {stats.currentStreak >= 30 ? 'BEAST MODE!' : `${stats.currentStreak} Days!`}
              </span>
            </div>
          </motion.div>
        )}
      </main>
    </ThemeProvider>
  );
}
