import { motion } from 'motion/react';
import { Newspaper, Users, MessageCircle, User } from 'lucide-react';

/**
 * @component BottomNav
 * @description Persistent tab-bar navigation rendered at the bottom of every main-app screen.
 * Visible only after onboarding is complete and hidden on all sub-screens (chat, settings, etc.).
 *
 * Tab order: News | Groups | Social | Profile
 * Active tab is highlighted in #FF9F66 with a spring bounce animation.
 * The active dot indicator uses `layoutId` for smooth shared-element transitions.
 *
 * @iosEquivalent TabView in SwiftUI; UITabBarController in UIKit
 * @see docs/FLOWS.md — Main Tab Navigation
 */
interface BottomNavProps {
  /** Key of the currently active screen — matches one of the four tab IDs */
  activeScreen: string;
  /** Called when the user taps a tab; App.tsx handles the navigation update */
  onNavigate: (screen: string) => void;
}

export function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  /** Tab item definitions — icon and route key */
  const navItems = [
    { id: 'news', icon: Newspaper, label: 'News' },
    { id: 'groups', icon: Users, label: 'Groups' },
    { id: 'social', icon: MessageCircle, label: 'Social' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A]/95 backdrop-blur-lg border-t border-[#2A2A2A] z-50"
    >
      <div className="flex justify-around items-center px-6 py-4 max-w-2xl mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          
          return (
            <motion.button
              key={item.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center gap-1 min-w-[60px]"
            >
              <motion.div
                animate={
                  isActive
                    ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                      }
                    : {}
                }
                transition={{ duration: 0.3 }}
              >
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-[#FF9F66]' : 'text-[#A0A0A0]'
                  }`}
                />
              </motion.div>
              
              <div className="relative flex flex-col items-center">
                <motion.span
                  animate={{
                    color: isActive ? '#FF9F66' : '#A0A0A0',
                    fontWeight: isActive ? 700 : 400
                  }}
                  className="text-xs"
                >
                  {item.label}
                </motion.span>
                
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FF9F66] rounded-full"
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-[#1A1A1A]" />
    </motion.div>
  );
}