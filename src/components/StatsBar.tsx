import React from 'react';
import { motion } from 'motion/react';

export const StatsBar: React.FC = () => {
  const stats = [
    {
      value: '980+',
      label: 'Accounts Recovered',
      highlight: false
    },
    {
      value: '48h',
      label: 'Average Turnaround',
      highlight: true
    },
    {
      value: '$10m+',
      label: 'Ad Spend Secured',
      highlight: false
    },
    {
      value: '100%',
      label: 'Confidential Process',
      highlight: false
    }
  ];

  return (
    <section className="relative z-20 -mt-2 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-white/[0.08] bg-[#0D1313] py-6 sm:py-7 px-4 sm:px-8 shadow-2xl shadow-black/50 overflow-hidden"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 w-full divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06] gap-y-6 sm:gap-y-0">
            {stats.map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center text-center px-4 ${
                  idx > 0 && idx % 2 === 0 ? 'border-t sm:border-t-0 pt-4 sm:pt-0' : ''
                }`}
              >
                <span
                  className={`text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight ${
                    item.highlight ? 'text-[#B7FF35]' : 'text-[#F2F5EF]'
                  }`}
                >
                  {item.value}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#68736D] uppercase font-bold tracking-widest font-mono mt-1.5">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

