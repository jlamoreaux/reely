"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function GuidelinesPage() {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  
  const acceptGuidelines = useMutation(api.sponsorships.acceptGuidelines);
  
  const handleAccept = async () => {
    if (!userId) return;
    
    await acceptGuidelines({
      userId,
      version: "1.0",
    });
    setHasAccepted(true);
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sponsored Content Guidelines
        </h1>
        <p className="text-gray-600">
          Guidelines for creating authentic sponsored content on Reelly
        </p>
        
        {hasAccepted && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
            ✓ You have accepted the sponsorship guidelines
          </div>
        )}
      </div>
      
      {/* Core Principles */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Core Principles
        </h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="font-semibold text-gray-900">Authenticity First</h3>
              <p className="text-gray-600 mt-1">
                All sponsored content must maintain the same authentic, unedited nature as regular content. 
                No scripted promotions or heavily produced advertisements.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <span className="text-2xl">🏷️</span>
            <div>
              <h3 className="font-semibold text-gray-900">Clear Disclosure</h3>
              <p className="text-gray-600 mt-1">
                Sponsored content must be clearly labeled with #sponsored or #ad in the description. 
                Transparency builds trust with your audience.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <span className="text-2xl">🤝</span>
            <div>
              <h3 className="font-semibold text-gray-900">Genuine Recommendations</h3>
              <p className="text-gray-600 mt-1">
                Only partner with brands you genuinely use and believe in. Your audience trusts your 
                authentic voice - don't compromise it for sponsorship deals.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Requirements */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Content Requirements
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-sage-500 mt-1">✓</span>
            <p className="text-gray-700">
              <strong>No Scripts:</strong> Speak naturally about the product or service in your own words
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-sage-500 mt-1">✓</span>
            <p className="text-gray-700">
              <strong>Real Experience:</strong> Share genuine experiences and honest opinions
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-sage-500 mt-1">✓</span>
            <p className="text-gray-700">
              <strong>In-App Recording:</strong> All content must be recorded through the Reelly app
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-sage-500 mt-1">✓</span>
            <p className="text-gray-700">
              <strong>No Editing:</strong> Maintain our no-edit policy for all sponsored content
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-sage-500 mt-1">✓</span>
            <p className="text-gray-700">
              <strong>FTC Compliance:</strong> Follow all FTC guidelines for influencer marketing
            </p>
          </div>
        </div>
      </div>
      
      {/* Prohibited Content */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Prohibited Sponsorships
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <span className="text-red-600 font-semibold">❌ Not Allowed</span>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <li>• Tobacco or vaping products</li>
              <li>• Alcohol (if audience includes minors)</li>
              <li>• Weapons or firearms</li>
              <li>• Adult content or services</li>
              <li>• Gambling or betting services</li>
            </ul>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <span className="text-red-600 font-semibold">⚠️ Restricted</span>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <li>• Dietary supplements (need disclaimers)</li>
              <li>• Financial services (need disclaimers)</li>
              <li>• Medical products or services</li>
              <li>• Political campaigns</li>
              <li>• Cryptocurrency or NFTs</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Best Practices */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Best Practices
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-sage-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              1. Maintain Your Voice
            </h3>
            <p className="text-gray-600 text-sm">
              Don't change your personality or speaking style for sponsors. Your audience follows 
              you for who you are.
            </p>
          </div>
          
          <div className="p-4 bg-sage-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              2. Balance Content
            </h3>
            <p className="text-gray-600 text-sm">
              Keep sponsored content to less than 20% of your total posts. Your audience values 
              organic content.
            </p>
          </div>
          
          <div className="p-4 bg-sage-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              3. Choose Quality Partners
            </h3>
            <p className="text-gray-600 text-sm">
              Be selective with sponsorships. It's better to have fewer, high-quality partnerships 
              than many that don't align with your values.
            </p>
          </div>
          
          <div className="p-4 bg-sage-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              4. Engage Authentically
            </h3>
            <p className="text-gray-600 text-sm">
              Respond to comments about sponsored products honestly. If someone asks a question, 
              give your genuine opinion.
            </p>
          </div>
        </div>
      </div>
      
      {/* Consequences */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Violations & Consequences
        </h2>
        <div className="space-y-3">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-gray-700">
              <strong>First Violation:</strong> Warning and content removal
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-gray-700">
              <strong>Second Violation:</strong> 30-day suspension from sponsored content
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-gray-700">
              <strong>Third Violation:</strong> Permanent removal from sponsorship program
            </p>
          </div>
        </div>
      </div>
      
      {/* Agreement */}
      {!hasAccepted && (
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Accept Guidelines
          </h2>
          <p className="text-gray-600 mb-6">
            By accepting these guidelines, you agree to follow all sponsorship rules and maintain 
            the authentic nature of Reelly content.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleAccept}
              className="px-6 py-3 bg-sage-400 text-white rounded-lg hover:bg-sage-500 transition-colors"
            >
              I Accept the Guidelines
            </button>
            <span className="text-sm text-gray-500">
              Version 1.0 - Last updated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
      
      {/* Resources */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Additional Resources
        </h2>
        <div className="space-y-2">
          <a href="#" className="flex items-center gap-2 text-sage-600 hover:text-sage-700">
            <span>📚</span> FTC Endorsement Guidelines
          </a>
          <a href="#" className="flex items-center gap-2 text-sage-600 hover:text-sage-700">
            <span>🎯</span> Brand Partnership Best Practices
          </a>
          <a href="#" className="flex items-center gap-2 text-sage-600 hover:text-sage-700">
            <span>💼</span> Sample Sponsorship Agreement Template
          </a>
          <a href="#" className="flex items-center gap-2 text-sage-600 hover:text-sage-700">
            <span>❓</span> Sponsorship FAQ
          </a>
        </div>
      </div>
    </div>
  );
}