import { Share2, Copy, Camera, Download, ArrowLeft, Scan, Palette } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface QRCodeScreenProps {
  onBack: () => void;
}

export function QRCodeScreen({ onBack }: QRCodeScreenProps) {
  /** Active content tab */
  const [activeTab, setActiveTab] = useState<'scan' | 'mycode'>('mycode');
  /** Currently selected QR accent colour (one of 5 presets) */
  const [qrColor, setQrColor] = useState('#FF9F66');
  /** Username used to build the shareable profile URL */
  const username = 'PlayerMaker34';
  /** Full profile deep-link URL */
  const profileUrl = `https://gamemate.app/user/${username}`;

  /** Colour presets for QR code customisation */
  const qrColors = [
    { name: 'Orange', color: '#FF9F66' },
    { name: 'Blue', color: '#66BAFF' },
    { name: 'Green', color: '#66FF9F' },
    { name: 'Purple', color: '#9B59B6' },
    { name: 'Black', color: '#1A1A1A' }
  ];

  /**
   * Copies the profile URL to the system clipboard and shows a success toast.
   * @iosEquivalent UIPasteboard.general.string = profileUrl
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success('Profile link copied!', {
      duration: 2000
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Game Mate Profile',
        text: `Check out my Game Mate profile!`,
        url: profileUrl
      });
    } else {
      toast.success('Sharing profile...', {
        duration: 1500
      });
    }
  };

  const handleDownload = () => {
    toast.success('QR code downloaded!', {
      duration: 2000
    });
  };

  const handleScan = () => {
    toast.success('Opening camera to scan...', {
      duration: 2000
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#1A1A1A] text-[#F5F5F5]"
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#1A1A1A]/95 backdrop-blur-lg z-10 border-b border-[#2A2A2A]">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="w-12 h-12 bg-[#2A2A2A] rounded-full flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <h1 className="text-3xl font-bold">QR Code</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('mycode')}
              className={`flex-1 py-3 rounded-2xl font-bold transition-all ${
                activeTab === 'mycode'
                  ? 'bg-gradient-to-r from-[#FF9F66] to-[#FF7733] text-[#1A1A1A]'
                  : 'bg-[#2A2A2A] text-[#A0A0A0]'
              }`}
            >
              My Code
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('scan')}
              className={`flex-1 py-3 rounded-2xl font-bold transition-all ${
                activeTab === 'scan'
                  ? 'bg-gradient-to-r from-[#FF9F66] to-[#FF7733] text-[#1A1A1A]'
                  : 'bg-[#2A2A2A] text-[#A0A0A0]'
              }`}
            >
              Scan
            </motion.button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* My Code Tab */}
        {activeTab === 'mycode' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            {/* QR Code Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-[#2A2A2A] rounded-3xl p-8 mb-6 max-w-md w-full"
            >
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF9F66] to-[#FF7733] p-1">
                  <div className="w-full h-full rounded-full bg-[#F5F5F5] flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF9F66] to-[#FF7733]" />
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-center mb-2">{username}</h2>
              <p className="text-sm text-[#A0A0A0] text-center mb-6">Scan to connect with me!</p>
              
              <div className="bg-[#F5F5F5] p-6 rounded-3xl flex justify-center">
                <QRCodeSVG
                  value={profileUrl}
                  size={240}
                  level="H"
                  includeMargin={false}
                  fgColor={qrColor}
                />
              </div>
            </motion.div>

            {/* Color Customization */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-md mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-5 h-5 text-[#A0A0A0]" />
                <h3 className="font-bold">QR Color</h3>
              </div>
              <div className="flex gap-3">
                {qrColors.map((color) => (
                  <motion.button
                    key={color.color}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQrColor(color.color)}
                    className={`w-12 h-12 rounded-full transition-all ${
                      qrColor === color.color ? 'ring-4 ring-[#F5F5F5] ring-offset-2 ring-offset-[#1A1A1A]' : ''
                    }`}
                    style={{ backgroundColor: color.color }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-3 w-full max-w-md"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="bg-[#2A2A2A] py-4 rounded-2xl font-bold flex flex-col items-center gap-2"
              >
                <Share2 className="w-6 h-6 text-[#FF9F66]" />
                <span className="text-sm">Share</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="bg-[#2A2A2A] py-4 rounded-2xl font-bold flex flex-col items-center gap-2"
              >
                <Copy className="w-6 h-6 text-[#66BAFF]" />
                <span className="text-sm">Copy</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="bg-[#2A2A2A] py-4 rounded-2xl font-bold flex flex-col items-center gap-2"
              >
                <Download className="w-6 h-6 text-[#66FF9F]" />
                <span className="text-sm">Save</span>
              </motion.button>
            </motion.div>

            {/* Info Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-md mt-6 bg-[#2A2A2A] rounded-2xl p-4"
            >
              <h3 className="font-bold mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-[#A0A0A0]">
                Share your QR code at gaming events to quickly connect with other players!
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Scan Tab */}
        {activeTab === 'scan' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            {/* Scanner View */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative bg-[#2A2A2A] rounded-3xl p-8 mb-6 max-w-md w-full aspect-square flex items-center justify-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF9F66]/20 to-[#FF7733]/20" />
              
              {/* Scanner Frame */}
              <div className="relative w-64 h-64">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#FF9F66] rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#FF9F66] rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#FF9F66] rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#FF9F66] rounded-br-2xl" />
                
                <motion.div
                  animate={{ y: [0, 200, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-x-0 h-1 bg-[#FF9F66] opacity-50"
                />
                
                <div className="flex items-center justify-center h-full">
                  <Scan className="w-16 h-16 text-[#A0A0A0]" />
                </div>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center text-[#A0A0A0] mb-6"
            >
              Position the QR code within the frame to scan
            </motion.p>

            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleScan}
              className="bg-gradient-to-r from-[#FF9F66] to-[#FF7733] text-[#1A1A1A] px-8 py-4 rounded-2xl font-bold flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Open Camera
            </motion.button>

            {/* Recent Scans */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-md mt-8"
            >
              <h3 className="font-bold mb-4">Recent Scans</h3>
              <div className="space-y-3">
                {[
                  { name: 'PlayerHater', time: '2 minutes ago' },
                  { name: 'GamerPro', time: '1 hour ago' },
                  { name: 'PlayerLover', time: '3 hours ago' }
                ].map((scan, index) => (
                  <motion.div
                    key={scan.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-[#2A2A2A] rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9F66] to-[#FF7733]" />
                    <div className="flex-1">
                      <h4 className="font-bold">{scan.name}</h4>
                      <p className="text-sm text-[#A0A0A0]">{scan.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}