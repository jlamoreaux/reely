"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function EarningsPage() {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [tipsEnabled, setTipsEnabled] = useState(true);
  
  const tipStats = useQuery(
    api.tips.getTipStats,
    userId ? { userId } : "skip"
  );
  
  const recentTips = useQuery(
    api.tips.getReceivedTips,
    userId ? { userId, limit: 10 } : "skip"
  );
  
  const toggleTips = useMutation(api.tips.toggleTips);
  
  const handleToggleTips = async () => {
    if (!userId) return;
    
    await toggleTips({
      userId,
      enabled: !tipsEnabled,
    });
    setTipsEnabled(!tipsEnabled);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings & Tips</h1>
          <p className="text-gray-600 mt-1">
            Track your monetization and manage tip settings
          </p>
        </div>
        
        {/* Tips Toggle */}
        <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3">
          <span className="text-gray-700">Accept Tips</span>
          <button
            onClick={handleToggleTips}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              tipsEnabled ? "bg-sage-400" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                tipsEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
      
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">💰</span>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              +{((tipStats?.thisMonth || 0) - (tipStats?.lastMonth || 0) > 0 ? "+" : "")}
              {(((tipStats?.thisMonth || 0) - (tipStats?.lastMonth || 0)) / (tipStats?.lastMonth || 1) * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-gray-600 text-sm">Total Earnings</p>
          <p className="text-2xl font-bold text-gray-900">
            ${tipStats?.totalAmount || 0}
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <span className="text-3xl mb-2 block">📅</span>
          <p className="text-gray-600 text-sm">This Month</p>
          <p className="text-2xl font-bold text-gray-900">
            ${tipStats?.thisMonth || 0}
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <span className="text-3xl mb-2 block">💸</span>
          <p className="text-gray-600 text-sm">Average Tip</p>
          <p className="text-2xl font-bold text-gray-900">
            ${tipStats?.averageTip?.toFixed(2) || 0}
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <span className="text-3xl mb-2 block">👥</span>
          <p className="text-gray-600 text-sm">Unique Tippers</p>
          <p className="text-2xl font-bold text-gray-900">
            {tipStats?.uniqueTippers || 0}
          </p>
        </div>
      </div>
      
      {/* Earnings Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Earnings Breakdown
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💵</span>
              <div>
                <p className="font-semibold text-gray-900">Tips</p>
                <p className="text-sm text-gray-600">Direct tips from viewers</p>
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">
              ${tipStats?.totalAmount || 0}
            </p>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎬</span>
              <div>
                <p className="font-semibold text-gray-900">Creator Fund</p>
                <p className="text-sm text-gray-600">Based on views and engagement</p>
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">$0</p>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤝</span>
              <div>
                <p className="font-semibold text-gray-900">Sponsorships</p>
                <p className="text-sm text-gray-600">Brand partnerships</p>
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">$0</p>
          </div>
        </div>
      </div>
      
      {/* Recent Tips */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Tips
        </h2>
        <div className="space-y-3">
          {recentTips && recentTips.length > 0 ? (
            recentTips.map((tip) => (
              <div
                key={tip._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sage-200 rounded-full flex items-center justify-center">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {tip.senderName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {tip.message || tip.videoTitle}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(tip.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    +${tip.amount}
                  </p>
                  <p className="text-xs text-gray-500">{tip.currency}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">💸</span>
              <p>No tips received yet</p>
              <p className="text-sm mt-1">Share great content to start earning!</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Payout Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Payout Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Payment Method</p>
              <p className="text-sm text-gray-600">Connect your bank account or card</p>
            </div>
            <button className="px-4 py-2 bg-sage-400 text-white rounded-lg hover:bg-sage-500 transition-colors">
              Connect Stripe
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Payout Schedule</p>
              <p className="text-sm text-gray-600">Automatic monthly payouts</p>
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-lg">
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Daily</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Minimum Payout</p>
              <p className="text-sm text-gray-600">Minimum amount before payout</p>
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-lg">
              <option>$10</option>
              <option>$50</option>
              <option>$100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}