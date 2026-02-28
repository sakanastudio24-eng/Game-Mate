import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Gamepad2, Users, Trophy, Zap, Target, Heart, Swords, Globe, Flag, Star, Crown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

/**
 * @component OnboardingPreferences
 * @description Onboarding step 3 of 3. Collects the user's gaming preferences:
 *   - Genre selection (up to 5 from 8 options) via a 2-column grid of toggle chips
 *   - Play style selection (1 of 4) via a vertical list of radio-style rows
 *
 * Both selections are required before the Next button activates.
 * Attempting to select more than 5 genres shows an error toast.
 * Progress indicator: all 3 bars filled (orange).
 *
 * @param onNext - Called after valid selections are confirmed
 * @iosEquivalent OnboardingPreferencesView.swift with LazyVGrid + custom selection state
 * @see docs/FLOWS.md — Onboarding Flow
 */
interface OnboardingPreferencesProps {
  onNext: () => void;
}

/** Genre options: id maps to a route/analytics key; icon is a Lucide component */
const GAME_GENRES = [
  { id: 'fps', label: 'FPS', icon: Target },
  { id: 'rpg', label: 'RPG', icon: Swords },
  { id: 'moba', label: 'MOBA', icon: Flag },
  { id: 'battle-royale', label: 'Battle Royale', icon: Trophy },
  { id: 'mmo', label: 'MMO', icon: Globe },
  { id: 'sports', label: 'Sports', icon: Star },
  { id: 'racing', label: 'Racing', icon: Zap },
  { id: 'strategy', label: 'Strategy', icon: Crown },
];

/** Play style options: single-selection, each with an icon, label, and description */
const PLAY_STYLES = [
  { id: 'casual', label: 'Casual', description: 'Play for fun', icon: Heart },
  { id: 'competitive', label: 'Competitive', description: 'Climb the ranks', icon: Trophy },
  { id: 'social', label: 'Social', description: 'Make friends', icon: Users },
  { id: 'achievement', label: 'Achievement Hunter', description: 'Complete everything', icon: Sparkles },
];

export function OnboardingPreferences({ onNext }: OnboardingPreferencesProps) {
  /** IDs of currently selected genres (max 5) */
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  /** ID of the selected play style (empty string = none selected) */
  const [selectedPlayStyle, setSelectedPlayStyle] = useState<string>('');

  /**
   * Toggle a genre chip on/off.
   * Shows an error toast if the user attempts to exceed the 5-genre limit.
   * @param genreId - The id field from a GAME_GENRES entry
   */
  const handleGenreToggle = (genreId: string) => {
    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter(id => id !== genreId));
    } else {
      if (selectedGenres.length < 5) {
        setSelectedGenres([...selectedGenres, genreId]);
      } else {
        toast.error('Maximum 5 genres', {
          description: 'Please deselect a genre first',
          duration: 2000
        });
      }
    }
  };

  /**
   * Set the active play style (single-selection behaviour).
   * @param styleId - The id field from a PLAY_STYLES entry
   */
  const handlePlayStyleSelect = (styleId: string) => {
    setSelectedPlayStyle(styleId);
  };

  /**
   * Validate both selections before proceeding.
   * Shows targeted error toasts if either section is empty.
   * Calls onNext() when both are valid.
   */
  const handleContinue = () => {
    if (selectedGenres.length === 0) {
      toast.error('Select at least one genre', {
        description: 'Help us personalize your experience',
        duration: 2000
      });
      return;
    }
    if (!selectedPlayStyle) {
      toast.error('Select your play style', {
        description: 'How do you like to play?',
        duration: 2000
      });
      return;
    }
    onNext();
  };

  /** True when the form is valid: at least 1 genre and 1 play style selected */
  const canContinue = selectedGenres.length > 0 && selectedPlayStyle !== '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#F5F5F5] flex flex-col p-8"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <p className="text-[#A0A0A0] text-sm mb-4">Welcome to Game Mate</p>
        <h2 className="text-[#1A1A1A] text-4xl font-bold">Create Account</h2>
      </motion.div>

      <div className="flex-1 overflow-y-auto pb-4">
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Gamepad2 className="w-6 h-6 text-[#FF9F66]" />
            <h3 className="text-[#1A1A1A] text-2xl font-bold">What Do You Like to Play?</h3>
          </div>
          <p className="text-[#A0A0A0] mb-4">Select up to 5 genres (minimum 1)</p>
          <div className="flex gap-2 mb-6">
            <motion.div
              initial={{ width: 48 }}
              animate={{ width: 48 }}
              className="h-1 bg-[#FF9F66] rounded-full"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="h-1 bg-[#FF9F66] rounded-full"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="h-1 bg-[#FF9F66] rounded-full"
            />
          </div>
        </motion.div>

        {/* Game Genres Grid */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3 mb-10"
        >
          {GAME_GENRES.map((genre, index) => {
            const Icon = genre.icon;
            const isSelected = selectedGenres.includes(genre.id);
            return (
              <motion.button
                key={genre.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.6 + index * 0.05,
                  type: 'spring',
                  damping: 15
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGenreToggle(genre.id)}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#FF9F66] to-[#FF7733] text-[#1A1A1A]'
                    : 'bg-[#E8E8E8] text-[#1A1A1A] hover:bg-[#D8D8D8]'
                }`}
              >
                <Icon className="w-8 h-8" strokeWidth={2.5} />
                <span className="font-bold text-sm">{genre.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Play Style Section */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-[#FF9F66]" />
            <h3 className="text-[#1A1A1A] text-2xl font-bold">How Do You Play?</h3>
          </div>
          <p className="text-[#A0A0A0] mb-6">Choose your primary play style</p>
        </motion.div>

        {/* Play Styles List */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="space-y-3"
        >
          {PLAY_STYLES.map((style, index) => {
            const Icon = style.icon;
            const isSelected = selectedPlayStyle === style.id;
            return (
              <motion.button
                key={style.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  delay: 1.2 + index * 0.1,
                  type: 'spring',
                  damping: 15
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePlayStyleSelect(style.id)}
                className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#FF9F66] to-[#FF7733] text-[#1A1A1A]'
                    : 'bg-[#E8E8E8] text-[#1A1A1A] hover:bg-[#D8D8D8]'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-[#1A1A1A]/10' : 'bg-[#D8D8D8]'
                }`}>
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-lg">{style.label}</div>
                  <div className={`text-sm ${isSelected ? 'text-[#1A1A1A]/70' : 'text-[#A0A0A0]'}`}>
                    {style.description}
                  </div>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#FF9F66]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="flex flex-col items-center gap-4 mt-6"
      >
        <motion.button
          whileHover={{ scale: canContinue ? 1.05 : 1, rotate: canContinue ? 5 : 0 }}
          whileTap={{ scale: canContinue ? 0.95 : 1 }}
          onClick={handleContinue}
          disabled={!canContinue}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
            canContinue
              ? 'bg-gradient-to-br from-[#FF9F66] to-[#FF7733]'
              : 'bg-[#D0D0D0] opacity-50'
          }`}
        >
          <ChevronRight className="w-10 h-10 text-[#1A1A1A]" strokeWidth={3} />
        </motion.button>
        <p className="text-[#A0A0A0] text-sm">Step 3 of 3</p>
      </motion.div>
    </motion.div>
  );
}