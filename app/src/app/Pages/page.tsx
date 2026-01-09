'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isFuture } from 'date-fns';
import {
  Flame, Trophy, Target, Calendar, Award, AlertTriangle,
  Menu, X, Zap, Crown, BarChart3, Plus
} from 'lucide-react';

import { DailyProgress, ViewMode, Punishment, UserStats, DailyHabit, HabitCategory } from '@/types';
import { REWARDS } from '@/lib/constants';
import {
  getAllProgress, getProgressForDate, saveProgress,
  getStats, getRewards, getPunishments, addPunishment, completePunishment,
  calculateDailyScore, getWeeklyStats, getMonthlyStats, getYearlyStats,
  isFirstLaunch, markAsLaunched, getAllHabits, addCustomHabit, deleteCustomHabit, checkDailyPunishments,
  checkRewards
} from '@/lib/storage';
import { loadFromDatabase, scheduleSyncWithDatabase, deleteHabitFromDB } from '@/lib/apiStorage';

import { AddHabitModal } from '@/components/AddHabitModal';
import { InstallPWA } from '@/components/InstallPWA';

import { HabitCard } from '@/components/HabitCard';
import { StatsCard } from '@/components/StatsCard';
import { RewardsGrid } from '@/components/RewardCard';
import { ProgressRing, ProgressBar } from '@/components/ProgressRing';
import { CalendarView } from '@/components/CalendarView';
import { WeeklyChart, MonthlyChart, HabitsPieChart, YearlyChart } from '@/components/Charts';
import { PunishmentModal, PunishmentList } from '@/components/PunishmentCard';
import { CelebrationModal } from '@/components/CelebrationModal';
import { ThemeProvider } from '@/components/ThemeContext';
import UserProfileDropdown from '@/components/UserProfileDropdown';
import { ToastProvider, useToast } from '@/components/Toast';
import { YearlyHeatmap } from '@/components/YearlyHeatmap';
import { Onboarding, useOnboarding } from '@/components/Onboarding';
import { ReminderBellButton, HabitRemindersModal } from '@/components/HabitReminders';
import { LoadingScreen } from '@/components/LoadingScreen';
import {
  SmoothScrollProvider,
  useScrollAnimation,
  useStaggerAnimation,
  usePageTransition
} from '@/components/SmoothScroll';

type ExtendedViewMode = ViewMode | 'rewards' | 'punishments';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ExtendedViewMode>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habits, setHabits] = useState<Record<string, boolean>>({});
  const [allProgress, setAllProgress] = useState<Record<string, DailyProgress>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [allHabits, setAllHabits] = useState<DailyHabit[]>([]);  // Empty - users add their own habits
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);

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

  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const { showOnboarding, completeOnboarding, isLoaded: onboardingLoaded } = useOnboarding();

  // GSAP Animations
  usePageTransition();
  useScrollAnimation('.glass-card', { y: 30, duration: 0.8 });
  useScrollAnimation('.stats-card', { y: 20, duration: 0.6 });
  useStaggerAnimation('.habit-list', '.habit-card');

  useEffect(() => {
    setMounted(true);
    loadData();

    // Check for missed habits from yesterday
    const newPunishments = checkDailyPunishments();
    if (newPunishments.length > 0) {
      scheduleSyncWithDatabase();
      // Show modal for the first new punishment
      setPunishmentModal({ isOpen: true, punishment: newPunishments[0] });
    }

    // Load data from database on mount
    loadFromDatabase().then((success) => {
      if (success) {
        loadData(); // Reload local data after DB sync
      }
    });

    if (isFirstLaunch()) {
      markAsLaunched();
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const progress = getProgressForDate(dateStr);

      if (progress) {
        // Only keep habits that exist in allHabits
        const validHabits: Record<string, boolean> = {};
        allHabits.forEach(habit => {
          validHabits[habit.id] = progress.habits[habit.id] || false;
        });
        setHabits(validHabits);
      } else {
        const initialHabits: Record<string, boolean> = {};
        allHabits.forEach(habit => {
          initialHabits[habit.id] = false;
        });
        setHabits(initialHabits);
      }
    }
  }, [selectedDate, mounted, allHabits.length]);

  const [rewards, setRewards] = useState(REWARDS);

  const loadData = () => {
    checkRewards(); // Check and unlock rewards based on new stats
    setAllProgress(getAllProgress());
    setAllHabits(getAllHabits());
    setRewards(getRewards());
  };

  const handleAddHabit = (habitData: { name: string; description: string; icon: string; category: HabitCategory }) => {
    const newHabit = addCustomHabit({
      ...habitData,
    });
    setIsAddHabitOpen(false);

    // Sync with DB immediately to prevent data loss on reload
    scheduleSyncWithDatabase();

    loadData();
    // Force refresh habits state to include the new habit
    setHabits(prev => ({ ...prev, [newHabit.id]: false }));
  };

  const handleDeleteHabit = async (habitId: string) => {
    // Remove locally
    deleteCustomHabit(habitId);

    // Optimistically update UI
    setAllHabits(prev => prev.filter(h => h.id !== habitId));

    // Remove from current day's tracking if present
    const newHabits = { ...habits };
    delete newHabits[habitId];
    setHabits(newHabits);

    // Recalculate score for today
    const score = calculateDailyScore(newHabits);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    // Save updated progress locally
    const progress: DailyProgress = {
      date: dateStr,
      habits: newHabits,
      score,
      streakBroken: false, // Reset streak broken if they deleted the broken habit? Maybe.
    };
    saveProgress(dateStr, progress);

    // Sync to DB
    await deleteHabitFromDB(habitId); // Delete habit definition
    scheduleSyncWithDatabase(); // Sync updated stats/progress
    loadData();
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
    scheduleSyncWithDatabase(); // Sync with database
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

    // Immediate punishment logic removed - now handled by checkDailyPunishments at start of new day
  }, [habits, selectedDate, allProgress]);

  const handleCompletePunishment = (id: string) => {
    completePunishment(id);
    scheduleSyncWithDatabase(); // Sync with database
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


  if (!mounted || isLoading) {
    return (
      <LoadingScreen
        minDuration={1500}
        onComplete={() => setIsLoading(false)}
      />
    );
  }

  return (
    <ToastProvider>
      <ThemeProvider>
        <SmoothScrollProvider>
          <main className="min-h-screen pb-24 transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm transition-colors duration-300">
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
                    {navigationItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setViewMode(item.id as ExtendedViewMode)}
                        className={`
                    flex items-center gap-2.5 px-5 py-2.5 rounded-xl
                    transition-all duration-200 text-sm font-medium
                    ${viewMode === item.id
                            ? 'tab-active'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                          }
                  `}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Add Habit Button - Mobile Visible */}
                    <button
                      onClick={() => setIsAddHabitOpen(true)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors font-medium text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden md:inline">Add Habit</span>
                    </button>

                    {/* Streak Badge */}
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-slate-900 transition-colors">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="text-base font-bold">{stats.currentStreak}</span>
                      <span className="text-sm text-slate-500">day streak</span>
                    </div>

                    {/* Reminders Bell */}
                    <ReminderBellButton onClick={() => setIsRemindersOpen(true)} />

                    {/* User Profile Dropdown */}
                    <UserProfileDropdown />

                    {/* Mobile Menu Button */}
                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="lg:hidden p-2.5 rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors"
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
                    className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl shadow-lg"
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
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }
                    `}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}

                      <div className="flex items-center justify-center gap-2 py-3 mt-2 border-t border-slate-200">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="font-bold text-slate-900">{stats.currentStreak} day streak</span>
                      </div>

                      <div className="border-t border-slate-200 pt-2">
                        <InstallPWA />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </header>

            {/* Main Content */}
            <div className="container-app py-16 pb-32">
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
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-20 xl:mb-8">
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
                        {Object.values(habits).filter(Boolean).length} of {allHabits.length} habits completed
                      </p>
                      {dailyScore === 100 && (
                        <div className="flex items-center gap-2 mt-4 text-emerald-600 font-bold text-lg">
                          <Crown className="w-6 h-6" />
                          PERFECT DAY!
                        </div>
                      )}

                      {/* Inline Add Button */}
                      <button
                        onClick={() => setIsAddHabitOpen(true)}
                        className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-slate-700 transition-colors px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Habit
                      </button>
                    </div>
                  </div>

                  {/* Spacer to prevent overlap on mobile */}
                  <div className="h-40 w-full block lg:hidden"></div>

                  {/* Habits List - Layer 3 */}
                  <div className="relative z-0 mt-0 lg:mt-12">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xl lg:text-2xl font-bold text-slate-900 flex items-center gap-2 ">
                        <Zap className="w-10 h-10 text-yellow-500" />
                        Daily Habits
                      </h2>
                    </div>


                    {/* Empty State - Show when no habits */}
                    {allHabits.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-16 px-8 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 gap-5 border-2 border-dashed border-slate-300"
                      >
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-800 to-black flex items-center justify-center mb-6 shadow-lg shadow-slate-900/30">
                          <Plus className="w-10 h-10 text-white" strokeWidth={2} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">
                          Start Your Journey!
                        </h3>
                        <p className="text-slate-500 text-center max-w-md mb-8 text-lg">
                          Create your first habit to begin tracking your daily progress and building powerful routines.
                        </p>
                        <button
                          onClick={() => setIsAddHabitOpen(true)}
                          className="
                        flex items-center gap-3 px-10 py-4 rounded-2xl
                        bg-gradient-to-r from-slate-800 via-slate-900 to-black
                        hover:from-slate-700 hover:via-slate-800 hover:to-slate-900
                        text-white font-bold text-lg
                        shadow-2xl shadow-slate-900/40 hover:shadow-slate-900/60
                        transition-all duration-300 hover:-translate-y-2 hover:scale-105
                        animate-pulse hover:animate-none
                      "
                        >
                          <Plus className="w-6 h-6" strokeWidth={2.5} />
                          Create Your First Habit
                        </button>
                        <p className="text-sm text-slate-400 mt-6">
                          Build the life you want, one habit at a time
                        </p>
                      </motion.div>
                    )}

                    {/* Habits Grid - Show when habits exist */}
                    {allHabits.length > 0 && (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {allHabits.map((habit) => (
                          <HabitCard
                            key={habit.id}
                            habit={habit}
                            isCompleted={habits[habit.id] || false}
                            onToggle={toggleHabit}
                            onDelete={handleDeleteHabit}
                            disabled={isFuture(selectedDate) && !isToday(selectedDate)}
                          />
                        ))}
                      </div>
                    )}
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
                      <p className="text-3xl lg:text-4xl font-bold text-gradient-blue">{weeklyStats.daysWithData}/7</p>
                    </div>
                  </div>

                  <WeeklyChart progress={allProgress} />
                  <div style={{ marginTop: '2rem' }}>
                    <HabitsPieChart progress={allProgress} habits={allHabits} />
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
                      <p className="text-3xl lg:text-4xl font-bold text-gradient-blue">
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
                      {allHabits.map(habit => {
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
                      <p className="text-slate-500 text-sm mb-3">Year Average</p>
                      <p className="text-3xl lg:text-4xl font-bold text-gradient-purple">{yearlyStats.averageScore}%</p>
                    </div>
                    <div className="glass-card p-6 lg:p-8 text-center">
                      <p className="text-slate-500 text-sm mb-3">Days Tracked</p>
                      <p className="text-3xl lg:text-4xl font-bold text-gradient-green">{yearlyStats.totalDays}</p>
                    </div>
                    <div className="glass-card p-6 lg:p-8 text-center">
                      <p className="text-slate-500 text-sm mb-3">Perfect Days</p>
                      <p className="text-3xl lg:text-4xl font-bold text-gradient-orange">{yearlyStats.perfectDays}</p>
                    </div>
                    <div className="glass-card p-6 lg:p-8 text-center">
                      <p className="text-slate-500 text-sm mb-3">Rewards</p>
                      <p className="text-3xl lg:text-4xl font-bold text-gradient-pink">{yearlyStats.rewardsEarned}</p>
                    </div>
                  </div>

                  <YearlyChart monthlyScores={yearlyStats.monthlyScores} year={yearlyStats.year} />

                  {/* GitHub-style Yearly Heatmap */}
                  <div style={{ marginTop: '2rem' }}>
                    <YearlyHeatmap progress={allProgress} year={yearlyStats.year} />
                  </div>
                </motion.div>
              )}

              {/* Rewards View */}
              {viewMode === 'rewards' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="mb-12 text-center">
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">🏆 Achievements</h2>
                    <p className="text-slate-500 text-base lg:text-lg">
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
                  <div className="mb-12">
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">⚠️ Accountability Log</h2>
                    <p className="text-slate-500 text-base lg:text-lg">Learn from your mistakes</p>
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

            <AddHabitModal
              isOpen={isAddHabitOpen}
              onClose={() => setIsAddHabitOpen(false)}
              onAdd={handleAddHabit}
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

            {/* Reminders Modal */}
            <AnimatePresence>
              {isRemindersOpen && (
                <HabitRemindersModal onClose={() => setIsRemindersOpen(false)} />
              )}
            </AnimatePresence>

            {/* Onboarding Flow */}
            <AnimatePresence>
              {onboardingLoaded && showOnboarding && (
                <Onboarding onComplete={completeOnboarding} />
              )}
            </AnimatePresence>
          </main>
        </SmoothScrollProvider>
      </ThemeProvider >
    </ToastProvider >
  );
}
