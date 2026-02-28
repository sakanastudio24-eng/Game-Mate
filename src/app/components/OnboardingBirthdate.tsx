import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Calendar, Shield } from 'lucide-react';

/**
 * @component OnboardingBirthdate
 * @description Onboarding step 2 of 3. Collects date of birth for age verification
 * and requires the user to accept the Terms of Service and Privacy Policy.
 * The Next button is disabled until `acceptTerms` is true.
 *
 * Progress indicator: 2 of 3 bars filled (orange).
 *
 * @param onNext - Called when ToS is accepted and the user taps Next
 * @iosEquivalent OnboardingBirthdateView.swift with DatePicker (.wheels style) + Toggle
 * @see docs/FLOWS.md — Onboarding Flow
 */
interface OnboardingBirthdateProps {
  onNext: () => void;
}

export function OnboardingBirthdate({ onNext }: OnboardingBirthdateProps) {
  /** Controlled date-of-birth input (MM/DD/YYYY string format) */
  const [birthdate, setBirthdate] = useState('02/24/1999');
  /** Must be true for the Next button to be active */
  const [acceptTerms, setAcceptTerms] = useState(false);

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

      <div className="flex-1">
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-[#FF9F66]" />
            <h3 className="text-[#1A1A1A] text-2xl font-bold">When Were You Born?</h3>
          </div>
          <p className="text-[#A0A0A0] mb-4">We need this to verify your age</p>
          <div className="flex gap-2 mb-8">
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
              className="h-1 bg-[#D0D0D0] rounded-full"
            />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <label className="block text-[#1A1A1A] text-xs font-bold mb-3 uppercase tracking-wide">
            Date of Birth
          </label>
          <div className="relative">
            <input
              type="text"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              placeholder="MM/DD/YYYY"
              className="w-full bg-[#E8E8E8] text-[#1A1A1A] px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF9F66] transition-all"
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
          </div>
        </motion.div>

        <motion.label
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-start gap-3 cursor-pointer group"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                acceptTerms ? 'bg-[#FF9F66]' : 'bg-[#D0D0D0] group-hover:bg-[#C0C0C0]'
              }`}
              onClick={() => setAcceptTerms(!acceptTerms)}
            >
              <motion.div
                initial={false}
                animate={{ scale: acceptTerms ? 1 : 0, rotate: acceptTerms ? 0 : -180 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <svg className="w-6 h-6 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
          <div className="pt-3">
            <p className="text-[#1A1A1A] leading-relaxed mb-2">
              I agree to the{' '}
              <span className="text-[#FF9F66] font-bold">Terms of Service</span>
              {' '}and{' '}
              <span className="text-[#FF9F66] font-bold">Privacy Policy</span>
            </p>
            <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
              <Shield className="w-4 h-4" />
              <span>Your data is secure and encrypted</span>
            </div>
          </div>
        </motion.label>
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.button
          whileHover={{ scale: acceptTerms ? 1.05 : 1, rotate: acceptTerms ? 5 : 0 }}
          whileTap={{ scale: acceptTerms ? 0.95 : 1 }}
          onClick={acceptTerms ? onNext : undefined}
          disabled={!acceptTerms}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
            acceptTerms
              ? 'bg-gradient-to-br from-[#FF9F66] to-[#FF7733]'
              : 'bg-[#D0D0D0] opacity-50'
          }`}
        >
          <ChevronRight className="w-10 h-10 text-[#1A1A1A]" strokeWidth={3} />
        </motion.button>
        <p className="text-[#A0A0A0] text-sm">Step 2 of 3</p>
      </motion.div>
    </motion.div>
  );
}