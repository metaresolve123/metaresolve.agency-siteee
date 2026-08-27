import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, CheckCircle2, ArrowRight, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { PlatformType } from '../types';

interface BanAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToForm: (platform: PlatformType) => void;
}

export const BanAssessmentModal: React.FC<BanAssessmentModalProps> = ({
  isOpen,
  onClose,
  onProceedToForm,
}) => {
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState<PlatformType>('instagram');
  const [banDuration, setBanDuration] = useState<string>('less_than_30d');
  const [automatedAppealsTried, setAutomatedAppealsTried] = useState<string>('1_to_2');
  const [banType, setBanType] = useState<string>('unacceptable_business');
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateFeasibility = () => {
    let score = 92;
    if (banDuration === 'more_than_90d') score -= 12;
    if (banDuration === 'more_than_180d') score -= 22;
    if (automatedAppealsTried === 'more_than_5') score -= 8;
    if (banType === 'counterfeit_ip') score -= 6;
    if (platform === 'whatsapp') score += 4;
    return Math.max(68, Math.min(97, score));
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsCalculating(true);
      setTimeout(() => {
        setIsCalculating(false);
        setStep(4);
      }, 1000);
    }
  };

  const handleReset = () => {
    setStep(1);
    setPlatform('instagram');
    setBanDuration('less_than_30d');
    setAutomatedAppealsTried('1_to_2');
    setBanType('unacceptable_business');
  };

  if (!isOpen) return null;

  const finalScore = calculateFeasibility();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="w-full max-w-lg rounded-2xl bg-[#141A19] border border-white/10 p-6 sm:p-8 shadow-2xl shadow-black relative overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#18201E] border border-[#B7FF35]/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#B7FF35]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F2F5EF]">Ban Feasibility Diagnostic</h3>
              <p className="text-[10px] font-mono text-[#68736D]">30-Second Algorithmic Scoring</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#18201E] text-[#A0AAA3] hover:text-[#F2F5EF] hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        {step < 4 && (
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  step >= s ? 'bg-[#B7FF35]' : 'bg-[#0D1313]'
                }`}
              />
            ))}
          </div>
        )}

        {/* Step 1: Platform & Duration */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="text-base font-bold text-[#F2F5EF]">
              Step 1: Which network is restricted?
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'instagram', label: 'Instagram' },
                { id: 'facebook', label: 'Facebook / Meta' },
                { id: 'tiktok', label: 'TikTok' },
                { id: 'telegram', label: 'Telegram (TG)' },
                { id: 'x', label: 'X (Twitter)' },
                { id: 'whatsapp', label: 'WhatsApp' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPlatform(item.id as PlatformType)}
                  className={`p-3 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer ${
                    platform === item.id
                      ? 'bg-[#B7FF35] text-[#090D0D] font-bold border-[#B7FF35]'
                      : 'bg-[#0D1313] text-[#F2F5EF] border-white/5 hover:border-white/20'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-mono text-[#A0AAA3] mb-2">
                How long has the account been locked?
              </label>
              <select
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#0D1313] border border-white/10 text-xs text-[#F2F5EF] focus:border-[#B7FF35] focus:outline-none"
              >
                <option value="less_than_30d">Under 30 days (Optimal window)</option>
                <option value="30_to_90d">30 to 90 days ago</option>
                <option value="more_than_90d">90 to 180 days ago</option>
                <option value="more_than_180d">Over 6 months ago</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Policy reason */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="text-base font-bold text-[#F2F5EF]">
              Step 2: What was the stated policy trigger?
            </h4>
            <div className="space-y-2">
              {[
                { id: 'unacceptable_business', label: 'Unacceptable Business Practices / Policy Alert' },
                { id: 'impersonation_false', label: 'Impersonation / False Identity Check' },
                { id: 'community_standards', label: 'Community Guidelines or Spam Detection' },
                { id: 'counterfeit_ip', label: 'Copyright or Trademark Counter-Claim' },
                { id: 'unknown_sudden', label: 'Sudden ban without clear explanation' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setBanType(item.id)}
                  className={`w-full p-3 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer ${
                    banType === item.id
                      ? 'bg-[#B7FF35] text-[#090D0D] font-bold border-[#B7FF35]'
                      : 'bg-[#0D1313] text-[#F2F5EF] border-white/5 hover:border-white/20'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Prior Appeals */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="text-base font-bold text-[#F2F5EF]">
              Step 3: Have you already sent self-service appeals?
            </h4>
            <div className="space-y-2">
              {[
                { id: 'none', label: 'No standard appeals sent yet (Clean docket)' },
                { id: '1_to_2', label: '1 - 2 automated form submissions' },
                { id: 'more_than_5', label: 'Multiple rejected canned form submissions' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAutomatedAppealsTried(item.id)}
                  className={`w-full p-3 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer ${
                    automatedAppealsTried === item.id
                      ? 'bg-[#B7FF35] text-[#090D0D] font-bold border-[#B7FF35]'
                      : 'bg-[#0D1313] text-[#F2F5EF] border-white/5 hover:border-white/20'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Final Diagnostic Result */}
        {step === 4 && (
          <div className="text-center py-2 space-y-4">
            <div className="w-20 h-20 rounded-full bg-[#B7FF35]/15 border border-[#B7FF35] mx-auto flex items-center justify-center">
              <span className="text-3xl font-extrabold text-[#B7FF35] font-mono">
                {finalScore}%
              </span>
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#B7FF35] font-bold">
                ESTIMATED RECOVERY FEASIBILITY: HIGH
              </div>
              <h4 className="text-xl font-extrabold text-[#F2F5EF] mt-1">
                Your Case Qualifies For Fast-Track Reinstatement
              </h4>
              <p className="text-xs text-[#A0AAA3] mt-2 leading-relaxed max-w-sm mx-auto">
                Based on your {platform} profile parameters, our Tier-3 caseworker protocol can submit a verified partner escalation immediately.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0D1313] border border-white/5 text-left text-xs font-mono space-y-1 text-[#A0AAA3]">
              <div className="flex justify-between">
                <span>Recommended Route:</span>
                <span className="text-[#F2F5EF] font-bold">Direct Partner Rep Appeal</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Turnaround:</span>
                <span className="text-[#B7FF35] font-bold">24 - 48 Hours</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  onClose();
                  onProceedToForm(platform);
                }}
                className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#B7FF35] hover:bg-[#C7FF45] text-[#090D0D] flex items-center justify-center gap-2 shadow-lg shadow-[#B7FF35]/20 cursor-pointer"
              >
                <span>Proceed to Priority Intake</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleReset}
                className="w-full py-2.5 text-xs font-mono text-[#68736D] hover:text-[#F2F5EF] flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Recalculate with different details</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Bottom Action Controls for Steps 1-3 */}
        {step < 4 && (
          <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="text-xs font-mono text-[#A0AAA3] hover:text-[#F2F5EF]"
              >
                Back
              </button>
            ) : (
              <span />
            )}

            <button
              onClick={handleNextStep}
              disabled={isCalculating}
              className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#B7FF35] hover:bg-[#C7FF45] text-[#090D0D] flex items-center gap-1.5 shadow-md shadow-[#B7FF35]/15 cursor-pointer"
            >
              {isCalculating ? (
                <span>Computing Score...</span>
              ) : (
                <>
                  <span>{step === 3 ? 'Generate Assessment' : 'Continue'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
