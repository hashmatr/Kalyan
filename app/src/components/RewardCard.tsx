'use client';

import { motion } from 'framer-motion';
import { Lock, Unlock, Sparkles, Star } from 'lucide-react';
import Image from 'next/image';
import { Reward } from '@/types';
import { TIER_COLORS } from '@/lib/constants';

interface RewardCardProps {
    reward: Reward;
}

const TIER_IMAGES: Record<string, string> = {
    bronze: '/rewards/bronze.png',
    silver: '/rewards/silver.png',
    gold: '/rewards/gold.png',
    platinum: '/rewards/platinum.png',
    diamond: '/rewards/diamond.png',
    legendary: '/rewards/legendary.png',
};

export function RewardCard({ reward }: RewardCardProps) {
    const tierStyle = TIER_COLORS[reward.tier];
    const imageSrc = TIER_IMAGES[reward.tier] || TIER_IMAGES.bronze;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className={`
                relative overflow-hidden rounded-3xl p-1 group
                bg-gradient-to-br ${reward.unlocked ? tierStyle.border : 'from-white/5 to-white/5'}
                shadow-2xl
            `}
        >
            <div className={`
                relative h-full rounded-[20px] p-6 flex flex-col items-center text-center overflow-hidden
                ${reward.unlocked
                    ? `bg-gradient-to-b ${tierStyle.bg}`
                    : 'bg-white border border-slate-100 shadow-inner'
                }
            `}>
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]" />

                {reward.unlocked && (
                    <motion.div
                        className="absolute inset-0 bg-white/5"
                        animate={{ opacity: [0, 0.3, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                )}

                {/* Main Image */}
                <div className="relative w-48 h-48 -mt-4 mb-4 z-10">
                    <motion.div
                        animate={reward.unlocked ? {
                            scale: [1, 1.05, 1],
                            y: [0, -5, 0],
                            filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)']
                        } : {}}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={`w-full h-full relative ${!reward.unlocked && 'grayscale opacity-50 blur-[1px]'}`}
                    >
                        <Image
                            src={imageSrc}
                            alt={reward.tier}
                            fill
                            className="object-contain drop-shadow-2xl"
                        />
                    </motion.div>

                    {/* Locked Overlay Icon */}
                    {!reward.unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="bg-black/50 p-3 rounded-full backdrop-blur-md border border-white/10">
                                <Lock className="w-8 h-8 text-white/50" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="relative z-10 w-full mt-auto">
                    {/* Tier Badge */}
                    <div className={`
                        inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3
                        text-[10px] font-bold uppercase tracking-[0.2em]
                        border backdrop-blur-md
                        ${reward.unlocked
                            ? 'bg-white/20 border-white/30 text-white'
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                        }
                    `}>
                        {reward.tier}
                    </div>

                    <h3 className={`
                        font-bold text-xl mb-2 leading-tight
                        ${reward.unlocked ? 'text-white' : 'text-slate-900'}
                    `}>
                        {reward.name}
                    </h3>

                    <p className={`
                        text-sm mb-6 line-clamp-2
                        ${reward.unlocked ? 'text-white/80' : 'text-slate-500'}
                    `}>
                        {reward.description}
                    </p>

                    {/* Footer Status */}
                    <div className={`
                        w-full py-3 rounded-xl flex items-center justify-center gap-2
                        backdrop-blur-md border transition-colors
                        ${reward.unlocked
                            ? 'bg-white/20 border-white/30 hover:bg-white/30'
                            : 'bg-slate-50 border-slate-100'
                        }
                    `}>
                        {reward.unlocked ? (
                            <>
                                <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">
                                    Unlocked
                                </span>
                            </>
                        ) : (
                            <>
                                <Star className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {reward.daysRequired} Days Goal
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

interface RewardsGridProps {
    rewards: Reward[];
}

export function RewardsGrid({ rewards }: RewardsGridProps) {
    const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'legendary'];

    return (
        <div className="space-y-24">
            {tiers.map((tier, tierIndex) => {
                const tierRewards = rewards.filter(r => r.tier === tier);
                if (tierRewards.length === 0) return null;

                const unlockedCount = tierRewards.filter(r => r.unlocked).length;
                const progress = (unlockedCount / tierRewards.length) * 100;

                return (
                    <motion.div
                        key={tier}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: tierIndex * 0.1 }}
                    >
                        {/* Section Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-200 pb-8">
                            <div className="flex items-center gap-5">
                                {/* Tier Icon/Image Preview */}
                                <div className="relative w-16 h-16">
                                    <Image
                                        src={TIER_IMAGES[tier] || TIER_IMAGES.bronze}
                                        alt={tier}
                                        fill
                                        className="object-contain drop-shadow-lg"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-slate-900 capitalize tracking-tight">{tier} Collection</h3>
                                    <p className="text-base text-slate-500 mt-1">
                                        Unlock by maintaining your streak
                                    </p>
                                </div>
                            </div>

                            {/* Section Progress */}
                            <div className="flex flex-col items-end gap-3 min-w-[200px]">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-slate-900">{unlockedCount}</span>
                                    <span className="text-sm font-medium text-slate-500">/ {tierRewards.length} Unlocked</span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full bg-gradient-to-r ${TIER_COLORS[tier as keyof typeof TIER_COLORS].bg}`}
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${progress}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cards Grid - 3 Columns with Large Gap */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 xl:gap-16">
                            {tierRewards.map(reward => (
                                <RewardCard key={reward.id} reward={reward} />
                            ))}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
