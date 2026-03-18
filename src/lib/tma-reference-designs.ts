/**
 * 📱 TMA Reference Designs
 * 
 * Exemplary designs for common TMA use cases.
 * Used by LLM as inspiration during code generation.
 * 
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TMAReference {
  id: string;
  name: string;
  description: string;
  category: 'finance' | 'productivity' | 'gaming' | 'social' | 'utility';
  features: string[];
  sections: string[];
  components: string[];
  codeExample: string;
  styleNotes: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CRYPTO WALLET REFERENCE
// ═══════════════════════════════════════════════════════════════════════════

export const CRYPTO_WALLET_REFERENCE: TMAReference = {
  id: 'crypto-wallet',
  name: 'Crypto Wallet',
  description: 'TON/crypto wallet with balance, transactions, and send/receive flow',
  category: 'finance',
  features: [
    'Balance display with multiple tokens',
    'Transaction history with status indicators',
    'Send/receive crypto flow',
    'QR code scanner for addresses',
    'Price charts and portfolio analytics',
    'Staking and DeFi integration',
  ],
  sections: [
    'Header with balance',
    'Token list with prices',
    'Transaction history',
    'Action buttons (Send/Receive/Swap)',
    'Settings and security',
  ],
  components: [
    'BalanceCard',
    'TokenListItem',
    'TransactionItem',
    'AddressInput',
    'AmountInput',
    'QRScanner',
    'PriceChart',
  ],
  styleNotes: 'Use glassmorphism for balance cards. Green for profits, red for losses. Subtle animations on balance updates. Large, tappable transaction items. Haptic feedback on send confirmation.',
  codeExample: `// Crypto Wallet TMA Reference
<div className="bg-gradient-to-b from-tma-button/20 to-transparent px-4 pt-safe-top pb-8">
  <p className="text-tma-hint text-sm">Total Balance</p>
  <h1 className="text-4xl font-bold text-tma-text">$12,847.32</h1>
  <p className="text-tma-link text-sm mt-1">+2.34% today</p>
</div>

{/* Action Buttons */}
<div className="flex gap-3 px-4 -mt-4">
  <TMAButton variant="primary" size="full">Send</TMAButton>
  <TMAButton variant="secondary" size="full">Receive</TMAButton>
  <TMAButton variant="outline" size="full">Swap</TMAButton>
</div>

{/* Token List */}
<TMASection title="Assets">
  <div className="tma-list-item">
    <div className="w-10 h-10 rounded-full bg-tma-button/20 flex items-center justify-center">
      <span className="font-bold text-tma-link">T</span>
    </div>
    <div className="flex-1 ml-3">
      <p className="font-medium text-tma-text">TON</p>
      <p className="text-sm text-tma-hint">Toncoin</p>
    </div>
    <div className="text-right">
      <p className="font-medium text-tma-text">$1,234.50</p>
      <p className="text-sm text-green-500">+3.2%</p>
    </div>
  </div>
</TMASection>`,
};

// ═══════════════════════════════════════════════════════════════════════════
// TASK MANAGER REFERENCE
// ═══════════════════════════════════════════════════════════════════════════

export const TASK_MANAGER_REFERENCE: TMAReference = {
  id: 'task-manager',
  name: 'Task Manager',
  description: 'Personal task/todo app with projects, deadlines, and collaboration',
  category: 'productivity',
  features: [
    'Task lists with categories',
    'Due dates and reminders',
    'Priority levels (high/medium/low)',
    'Subtasks and checklists',
    'Project organization',
    'Quick add with natural language',
  ],
  sections: [
    'Today/Upcoming tasks header',
    'Task list with checkboxes',
    'Project/category tabs',
    'Add task input',
    'Settings',
  ],
  components: [
    'TaskItem',
    'TaskCheckbox',
    'PriorityBadge',
    'DueDatePicker',
    'ProjectSelector',
    'QuickAddInput',
    'FilterTabs',
  ],
  styleNotes: 'Satisfying checkbox animation with haptic. Color-coded priorities. Swipe actions for quick actions. Floating add button. Subtle strikethrough for completed.',
  codeExample: `// Task Manager TMA Reference
<TMAHeader>
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-xl font-semibold text-tma-text">Today</h1>
      <p className="text-sm text-tma-hint">5 tasks remaining</p>
    </div>
    <TMAButton variant="ghost" size="sm">Add</TMAButton>
  </div>
</TMAHeader>

{/* Filter Tabs */}
<div className="flex gap-2 px-4 py-3 overflow-x-auto">
  <span className="px-3 py-1 rounded-full bg-tma-button text-tma-button-text text-sm">All</span>
  <span className="px-3 py-1 rounded-full bg-tma-card text-tma-text text-sm">Today</span>
</div>

{/* Task Item */}
<motion.div layout className="tma-list-item">
  <button onClick={handleCheck} className="w-6 h-6 rounded-full border-2 border-tma-button flex items-center justify-center">
    {task.completed && <Check className="w-4 h-4 text-tma-button" />}
  </button>
  <div className="flex-1 ml-3">
    <p className={task.completed ? 'line-through text-tma-hint' : 'text-tma-text font-medium'}>{task.title}</p>
    <p className="text-xs text-tma-hint">{task.dueDate}</p>
  </div>
  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-500">high</span>
</motion.div>`,
};

// ═══════════════════════════════════════════════════════════════════════════
// MINI GAME REFERENCE
// ═══════════════════════════════════════════════════════════════════════════

export const MINI_GAME_REFERENCE: TMAReference = {
  id: 'mini-game',
  name: 'Mini Game (Clicker/Tap)',
  description: 'Engaging tap/clicker game with upgrades, leaderboards, and rewards',
  category: 'gaming',
  features: [
    'Tap/click mechanic with visual feedback',
    'Score/currency system',
    'Upgrades and boosters',
    'Leaderboard with friends',
    'Daily rewards and streaks',
    'Achievements and badges',
  ],
  sections: [
    'Score/coins header',
    'Main tap area',
    'Upgrade shop',
    'Leaderboard',
    'Achievements',
  ],
  components: [
    'TapArea',
    'ScoreDisplay',
    'UpgradeCard',
    'LeaderboardItem',
    'AchievementBadge',
    'BoosterButton',
    'DailyReward',
  ],
  styleNotes: 'Satisfying tap animations with particles. Heavy haptic feedback on taps. Glowing, pulsing elements. Gamified UI with progress bars. Celebration animations on milestones.',
  codeExample: `// Mini Game TMA Reference
{/* Header with coins */}
<div className="px-4 pt-safe-top pb-4 bg-gradient-to-b from-tma-button/30 to-transparent">
  <div className="flex items-center justify-center gap-2">
    <span className="text-3xl">🪙</span>
    <motion.span key={coins} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-4xl font-bold text-tma-text">
      {coins.toLocaleString()}
    </motion.span>
  </div>
  <p className="text-center text-tma-hint text-sm mt-1">+{multiplier} per tap</p>
</div>

{/* Main Tap Area */}
<motion.button
  whileTap={{ scale: 0.95 }}
  onClick={handleTap}
  className="w-48 h-48 rounded-full bg-gradient-to-br from-tma-button to-tma-link
    shadow-[0_0_60px_rgba(36,129,204,0.5)] flex items-center justify-center"
>
  <span className="text-7xl">👆</span>
</motion.button>

{/* Upgrades */}
<div className="flex gap-3 overflow-x-auto py-4 px-4">
  <TMACard variant="elevated" className="min-w-[100px] text-center">
    <span className="text-3xl">⚡</span>
    <p className="font-medium text-tma-text mt-2">Speed</p>
    <p className="text-xs text-tma-hint">🪙 100</p>
  </TMACard>
</div>`,
};

// ═══════════════════════════════════════════════════════════════════════════
// SOCIAL NETWORK REFERENCE
// ═══════════════════════════════════════════════════════════════════════════

export const SOCIAL_NETWORK_REFERENCE: TMAReference = {
  id: 'social-network',
  name: 'Social Network',
  description: 'Telegram-native social feed with posts, stories, reactions, and messaging',
  category: 'social',
  features: [
    'Stories carousel at the top',
    'Post feed with images/videos',
    'Like, comment, share reactions',
    'User profiles with followers',
    'Direct messaging integration',
    'Notifications and activity feed',
  ],
  sections: [
    'Stories bar',
    'Post feed',
    'Create post FAB',
    'Bottom navigation',
    'Profile modal',
  ],
  components: [
    'StoryCircle',
    'PostCard',
    'ReactionBar',
    'CommentList',
    'UserAvatar',
    'FollowButton',
    'CreatePostSheet',
  ],
  styleNotes: 'Stories with gradient ring borders. Double-tap to like with heart animation. Smooth infinite scroll. Image lazy loading with blur placeholder. Pull-to-refresh with haptic.',
  codeExample: `// Social Network TMA Reference
{/* Stories Row */}
<div className="px-4 py-3 flex gap-3 overflow-x-auto bg-tma-bg border-b border-tma-border/10">
  {stories.map(story => (
    <div key={story.id} className="flex flex-col items-center gap-1">
      <div className={story.seen ? 'w-16 h-16 rounded-full p-0.5 bg-tma-hint/30' : 'w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-purple-500 to-pink-500'}>
        <img src={story.avatar} className="w-full h-full rounded-full object-cover border-2 border-tma-bg" />
      </div>
      <span className="text-xs text-tma-hint truncate w-16 text-center">{story.name}</span>
    </div>
  ))}
</div>

{/* Post Card */}
<div className="border-b border-tma-border/10">
  <div className="flex items-center gap-3 px-4 py-3">
    <img src={post.author.avatar} className="w-8 h-8 rounded-full" />
    <span className="font-medium text-tma-text">{post.author.name}</span>
    <span className="text-sm text-tma-hint ml-auto">{post.time}</span>
  </div>
  <img src={post.image} className="w-full aspect-square object-cover" onDoubleClick={handleLike} />
  <div className="flex items-center gap-4 px-4 py-3">
    <Heart className={liked ? 'w-6 h-6 fill-red-500 text-red-500' : 'w-6 h-6 text-tma-text'} />
    <MessageCircle className="w-6 h-6 text-tma-text" />
    <Share2 className="w-6 h-6 text-tma-text" />
  </div>
</div>`,
};

// ═══════════════════════════════════════════════════════════════════════════
// NFT MARKETPLACE REFERENCE
// ═══════════════════════════════════════════════════════════════════════════

export const NFT_MARKETPLACE_REFERENCE: TMAReference = {
  id: 'nft-marketplace',
  name: 'NFT Marketplace',
  description: 'Digital collectibles marketplace with gallery, auctions, and minting',
  category: 'finance',
  features: [
    'NFT gallery with grid/list views',
    'Collection pages with stats',
    'Auction countdown timers',
    'Bid and buy flow',
    'Minting interface',
    'Wallet integration (TON)',
  ],
  sections: [
    'Featured drops banner',
    'Trending collections',
    'NFT grid gallery',
    'Item detail sheet',
    'Bid/Buy modal',
  ],
  components: [
    'NFTCard',
    'CollectionBanner',
    'AuctionTimer',
    'BidInput',
    'PriceTag',
    'OwnerBadge',
    'RarityBadge',
  ],
  styleNotes: 'Glass/blur effects for overlays. Skeleton loading for images. Animated countdown timers. Gradient borders for rare items. 3D tilt effect on hover/press.',
  codeExample: `// NFT Marketplace TMA Reference
{/* Featured Drop */}
<div className="relative h-48 mx-4 mt-4 rounded-2xl overflow-hidden">
  <img src={featuredDrop.image} className="w-full h-full object-cover" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
  <div className="absolute bottom-0 left-0 right-0 p-4">
    <p className="text-white font-bold text-lg">{featuredDrop.name}</p>
    <div className="flex items-center gap-2 mt-1">
      <span className="text-white/80 text-sm">Ends in</span>
      <div className="flex gap-1 font-mono">
        <span className="bg-white/20 px-2 py-1 rounded text-white text-sm">{hours}h</span>
        <span className="bg-white/20 px-2 py-1 rounded text-white text-sm">{minutes}m</span>
      </div>
    </div>
  </div>
</div>

{/* NFT Grid */}
<div className="grid grid-cols-2 gap-3 px-4 mt-6">
  {nfts.map(nft => (
    <motion.div key={nft.id} whileTap={{ scale: 0.98 }} className="bg-tma-card rounded-xl overflow-hidden">
      <div className="relative aspect-square">
        <img src={nft.image} className="w-full h-full object-cover" />
        {nft.rarity === 'legendary' && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500">
            legendary
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="font-medium text-tma-text truncate">{nft.name}</p>
        <p className="font-semibold text-tma-link mt-1">{nft.price} TON</p>
      </div>
    </motion.div>
  ))}
</div>`,
};

// ═══════════════════════════════════════════════════════════════════════════
// FITNESS TRACKER REFERENCE
// ═══════════════════════════════════════════════════════════════════════════

export const FITNESS_TRACKER_REFERENCE: TMAReference = {
  id: 'fitness-tracker',
  name: 'Fitness Tracker',
  description: 'Health and workout tracking app with goals, stats, and challenges',
  category: 'utility',
  features: [
    'Daily step/calorie goals',
    'Workout logging',
    'Progress charts and stats',
    'Streak and achievements',
    'Social challenges with friends',
    'Heart rate and health metrics',
  ],
  sections: [
    'Today summary ring',
    'Activity stats cards',
    'Workout history list',
    'Weekly chart',
    'Achievements grid',
  ],
  components: [
    'ProgressRing',
    'StatCard',
    'WorkoutCard',
    'WeeklyChart',
    'AchievementBadge',
    'ChallengeCard',
    'HeartRateMonitor',
  ],
  styleNotes: 'Circular progress rings (Apple Watch style). Gradient colors for activity types. Animated counters on load. Celebration confetti on goal completion. Smooth chart animations.',
  codeExample: `// Fitness Tracker TMA Reference
{/* Main Progress Ring */}
<div className="flex justify-center py-8">
  <div className="relative w-48 h-48">
    <svg width={192} height={192}>
      <circle cx={96} cy={96} r={80} fill="none" stroke="var(--tma-hint)" strokeWidth={12} opacity={0.2} />
      <motion.circle
        cx={96} cy={96} r={80} fill="none" stroke="rgb(255, 59, 48)" strokeWidth={12} strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        style={{ strokeDasharray: circumference, transform: 'rotate(-90deg)', transformOrigin: 'center' }}
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <motion.span key={steps} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-3xl font-bold text-tma-text">
        {steps.toLocaleString()}
      </motion.span>
      <span className="text-sm text-tma-hint">steps</span>
    </div>
  </div>
</div>

{/* Stat Cards */}
<div className="grid grid-cols-3 gap-3 px-4">
  <TMACard className="text-center">
    <span className="text-2xl">👣</span>
    <p className="font-bold text-tma-text mt-1">{steps}</p>
    <p className="text-xs text-tma-hint">Steps</p>
    <div className="h-1 bg-tma-hint/20 rounded-full mt-2 overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: progress + '%' }} className="h-full rounded-full bg-red-500" />
    </div>
  </TMACard>
</div>

{/* Weekly Chart */}
<TMACard className="mx-4 mt-6">
  <h3 className="font-semibold text-tma-text mb-4">This Week</h3>
  <div className="flex items-end justify-between h-24 gap-2">
    {weekData.map((day, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-1">
        <motion.div initial={{ height: 0 }} animate={{ height: (day.steps / 10000) * 100 + '%' }} className="w-full bg-tma-button rounded-t" />
        <span className="text-xs text-tma-hint">{day.label}</span>
      </div>
    ))}
  </div>
</TMACard>`,
};

// ═══════════════════════════════════════════════════════════════════════════
// REFERENCE INDEX
// ═══════════════════════════════════════════════════════════════════════════

export const TMA_REFERENCES: Record<string, TMAReference> = {
  'crypto-wallet': CRYPTO_WALLET_REFERENCE,
  'task-manager': TASK_MANAGER_REFERENCE,
  'mini-game': MINI_GAME_REFERENCE,
  'social-network': SOCIAL_NETWORK_REFERENCE,
  'nft-marketplace': NFT_MARKETPLACE_REFERENCE,
  'fitness-tracker': FITNESS_TRACKER_REFERENCE,
};

/**
 * Get reference design based on prompt keywords
 */
export function getMatchingReference(prompt: string): TMAReference | null {
  const lowPrompt = prompt.toLowerCase();
  
  // Crypto/wallet keywords
  if (/кошел|wallet|crypto|крипто|ton|биткоин|bitcoin|defi|токен|token|баланс|balance|транзакц/i.test(lowPrompt)) {
    return CRYPTO_WALLET_REFERENCE;
  }
  
  // Task/todo keywords
  if (/задач|task|todo|список|list|дела|план|reminder|напомина|продуктив|checklist/i.test(lowPrompt)) {
    return TASK_MANAGER_REFERENCE;
  }
  
  // Game keywords
  if (/игр|game|click|tap|тап|клик|очки|score|монет|coin|апгрейд|upgrade|лидерборд|leaderboard/i.test(lowPrompt)) {
    return MINI_GAME_REFERENCE;
  }
  
  // Social network keywords
  if (/социал|social|лента|feed|пост|post|stories|сторис|подписчик|follower|лайк|like|чат|chat|мессенджер/i.test(lowPrompt)) {
    return SOCIAL_NETWORK_REFERENCE;
  }
  
  // NFT marketplace keywords
  if (/nft|нфт|коллекц|collect|маркетплейс|marketplace|аукцион|auction|mint|минт|digital art|цифров/i.test(lowPrompt)) {
    return NFT_MARKETPLACE_REFERENCE;
  }
  
  // Fitness tracker keywords
  if (/фитнес|fitness|трекер|tracker|шаг|step|калори|calorie|тренировк|workout|здоровь|health|спорт|sport/i.test(lowPrompt)) {
    return FITNESS_TRACKER_REFERENCE;
  }
  
  return null;
}

/**
 * Format reference for LLM prompt injection
 */
export function formatReferenceForPrompt(reference: TMAReference): string {
  return `
## Reference Design: ${reference.name}
${reference.description}

### Features to Implement:
${reference.features.map(f => `• ${f}`).join('\n')}

### Recommended Sections:
${reference.sections.join(' → ')}

### Component Architecture:
${reference.components.join(', ')}

### Style Notes:
${reference.styleNotes}

### Code Reference:
\`\`\`tsx
${reference.codeExample}
\`\`\`
`;
}

/**
 * Get all reference summaries for LLM context
 */
export function getAllReferenceSummaries(): string {
  return Object.values(TMA_REFERENCES)
    .map(ref => `• **${ref.name}**: ${ref.description} (${ref.category})`)
    .join('\n');
}
