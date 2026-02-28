import { motion } from 'motion/react';
import { Gamepad2, Mail } from 'lucide-react';
import { toast } from 'sonner';

/**
 * @component WelcomeScreen
 * @description First screen shown to new users. Presents social auth options
 * (Google, Steam, PlayStation, Xbox) and an email-based onboarding path.
 *
 * Auth buttons currently simulate a redirect with a 2-second delay then call onNext.
 * In production, each button should initiate its respective OAuth flow.
 *
 * Visual design: animated radial blobs in the background, glowing Gamepad2 logo,
 * gradient-animated title text.
 *
 * @param onNext - Called when any auth path completes; advances to OnboardingEmail
 * @iosEquivalent WelcomeView.swift using ASWebAuthenticationSession for OAuth
 * @see docs/XCODE_MIGRATION.md — Section 9 (OAuth / Auth Providers)
 */
interface WelcomeScreenProps {
  onNext: () => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  /**
   * Simulates an OAuth sign-in flow for a given platform.
   * Shows a "Connecting…" toast, waits 1.5s, shows a success toast, then calls onNext.
   * @param platform - Display name of the auth provider (e.g. 'Google', 'Steam')
   */
  const handleSocialAuth = (platform: string) => {
    toast.success(`Connecting to ${platform}...`, {
      description: 'This will redirect you to sign in',
      duration: 2500
    });
    // Simulate auth delay
    setTimeout(() => {
      toast.success(`${platform} connected!`);
      setTimeout(onNext, 500);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] via-[#1A1A1A] to-[#000000] flex flex-col items-center justify-between p-8 text-center overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute top-0 right-0 w-96 h-96 bg-[#FF9F66] rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4
        }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-[#66BAFF] rounded-full blur-3xl"
      />

      <div className="flex-1 flex flex-col items-center justify-center gap-8 relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 200,
            delay: 0.2
          }}
          className="relative"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(255, 159, 102, 0.3)',
                '0 0 40px rgba(255, 159, 102, 0.5)',
                '0 0 20px rgba(255, 159, 102, 0.3)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="w-40 h-40 rounded-full bg-gradient-to-br from-[#FF9F66] to-[#FF7733] flex items-center justify-center"
          >
            <Gamepad2 className="w-20 h-20 text-[#1A1A1A]" strokeWidth={2.5} />
          </motion.div>
        </motion.div>
        
        {/* Title */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.h1
            className="text-5xl font-bold mb-2"
            style={{
              background: 'linear-gradient(to right, #FF9F66, #FFB380, #FF9F66)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            animate={{
              backgroundPosition: ['0%', '100%', '0%']
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            Game Mate
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-[#A0A0A0] text-lg"
          >
            Your Gaming Community Hub
          </motion.p>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="w-full space-y-4 relative z-10"
      >
        {/* Divider with text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="text-[#A0A0A0] text-sm mb-4"
        >
          Sign in with your gaming account
        </motion.div>

        {/* Social Auth Buttons */}
        <div className="space-y-3">
          {/* Google */}
          <motion.button
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.7 }}
            whileHover={{ scale: 1.02, backgroundColor: '#2A2A2A' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSocialAuth('Google')}
            className="w-full bg-[#2A2A2A] border border-[#3A3A3A] py-3.5 rounded-xl font-bold text-[#F5F5F5] flex items-center justify-center gap-3 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>

          {/* Steam */}
          <motion.button
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.8 }}
            whileHover={{ scale: 1.02, backgroundColor: '#2A2A2A' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSocialAuth('Steam')}
            className="w-full bg-[#2A2A2A] border border-[#3A3A3A] py-3.5 rounded-xl font-bold text-[#F5F5F5] flex items-center justify-center gap-3 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="url(#steam-gradient)"/>
              <path d="M11.9999 5.5C15.5899 5.5 18.4999 8.41 18.4999 12C18.4999 15.59 15.5899 18.5 11.9999 18.5C8.40994 18.5 5.49994 15.59 5.49994 12C5.49994 8.41 8.40994 5.5 11.9999 5.5ZM11.9999 4C7.57994 4 3.99994 7.58 3.99994 12C3.99994 16.42 7.57994 20 11.9999 20C16.4199 20 19.9999 16.42 19.9999 12C19.9999 7.58 16.4199 4 11.9999 4Z" fill="#171A21"/>
              <circle cx="15.5" cy="9.5" r="2.5" fill="#171A21"/>
              <circle cx="9" cy="14" r="3" fill="#171A21"/>
              <defs>
                <linearGradient id="steam-gradient" x1="2" y1="2" x2="22" y2="22">
                  <stop offset="0%" stopColor="#1B2838"/>
                  <stop offset="100%" stopColor="#2A475E"/>
                </linearGradient>
              </defs>
            </svg>
            Continue with Steam
          </motion.button>

          {/* PlayStation */}
          <motion.button
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.9 }}
            whileHover={{ scale: 1.02, backgroundColor: '#2A2A2A' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSocialAuth('PlayStation')}
            className="w-full bg-[#2A2A2A] border border-[#3A3A3A] py-3.5 rounded-xl font-bold text-[#F5F5F5] flex items-center justify-center gap-3 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#003087">
              <path d="M8.985 2.596v17.548l3.015 1.556V6.688c0-.67.349-1.024.827-1.024.474 0 .815.354.815 1.024v11.68l6.319-2.788c1.628-.744 2.539-1.867 2.539-3.668 0-1.776-.913-2.788-2.541-3.532L8.985 2.596z"/>
              <path d="M0 12.68v2.736c0 .668.347 1.024.824 1.024.477 0 .815-.356.815-1.024V9.108L6.158 7.35v13.116l3.015 1.535V0L0 12.68z"/>
              <path d="M19.5 16.675c-.548 0-1.131-.135-1.601-.352l-4.421-2.058v2.485l2.845 1.339c.474.223.967.34 1.432.34.888 0 1.433-.447 1.433-1.168 0-.673-.456-1.046-1.379-1.046l-.816-.001v-1.488h.816c.906 0 1.379-.349 1.379-1.044 0-.72-.527-1.168-1.379-1.168-.446 0-.901.119-1.354.341L13.978 11.8V9.315l4.394 2.059c.469.216 1.052.352 1.6.352 1.694 0 2.848-1.024 2.848-2.487 0-1.488-1.154-2.512-2.848-2.512-.548 0-1.131.136-1.6.352L8.985 2.596l-.001 17.549 3.015 1.556V9.108l4.394 2.058v2.736l-4.394-2.058v2.485l4.421 2.058c.47.217 1.053.352 1.601.352 1.694 0 2.848-1.024 2.848-2.487s-1.154-2.512-2.848-2.512z"/>
            </svg>
            Continue with PlayStation
          </motion.button>

          {/* Xbox */}
          <motion.button
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 2.0 }}
            whileHover={{ scale: 1.02, backgroundColor: '#2A2A2A' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSocialAuth('Xbox')}
            className="w-full bg-[#2A2A2A] border border-[#3A3A3A] py-3.5 rounded-xl font-bold text-[#F5F5F5] flex items-center justify-center gap-3 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#107C10">
              <path d="M4.102 21.033A11.947 11.947 0 0 0 12 24a11.96 11.96 0 0 0 7.902-2.967c1.877-1.912-4.316-8.709-7.902-11.417-3.582 2.708-9.779 9.505-7.898 11.417zm11.16-14.406c2.5 2.961 7.484 10.313 6.076 12.912A11.942 11.942 0 0 0 24 12.004a11.95 11.95 0 0 0-3.57-8.536 12.607 12.607 0 0 0-5.168 3.159zM12 .002C9.896-.031 7.849.467 6.046 1.471c1.117 1.295 2.482 2.733 3.956 4.296C11.121 4.528 12.041 3.448 12 .002zM2.661 19.54c-1.408-2.6 3.577-9.951 6.077-12.912-2.04-1.383-3.94-2.596-5.168-3.159A11.947 11.947 0 0 0 0 12.003c0 2.852.995 5.471 2.661 7.537zm15.343-14.057c-1.117-1.295-2.481-2.732-3.954-4.296C12.925 2.423 12.003 3.503 12.043 6.949c1.119-1.295 2.481-2.733 3.955-4.297 1.231.802 2.315 1.764 3.006 2.831z"/>
            </svg>
            Continue with Xbox
          </motion.button>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1 }}
          className="flex items-center gap-4 my-6"
        >
          <div className="flex-1 h-px bg-[#3A3A3A]" />
          <span className="text-[#A0A0A0] text-sm">or</span>
          <div className="flex-1 h-px bg-[#3A3A3A]" />
        </motion.div>

        {/* Email Option */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="w-full bg-gradient-to-r from-[#FF9F66] to-[#FF7733] text-[#1A1A1A] py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
        >
          <Mail className="w-5 h-5" />
          Continue with Email
        </motion.button>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3 }}
          className="text-[#A0A0A0] text-xs mt-4"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
}