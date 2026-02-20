import { Shield, Lock, Eye, Download, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function Privacy() {
  async function exportData() {
    const [profile, moods, journals, habits, goals] = await Promise.all([
      base44.entities.UserProfile.list(),
      base44.entities.MoodLog.list(),
      base44.entities.JournalEntry.list(),
      base44.entities.HabitTracker.list(),
      base44.entities.Goal.list(),
    ]);

    const data = {
      profile: profile[0] || {},
      moods,
      journals,
      habits,
      goals,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `iboaftercare-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Last updated: February 2026
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={exportData}
          className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
        >
          <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
            <Download className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-slate-900 dark:text-white">Export Data</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Download your data</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
        <a
          href="mailto:support@iboaftercare.app"
          className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
        >
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-slate-900 dark:text-white">Contact Us</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Privacy questions</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </a>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        <Section
          icon={Lock}
          title="Data Collection & Storage"
          content={
            <>
              <p>IboAftercare Coach collects only the information you voluntarily provide:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Account information (name, email)</li>
                <li>Recovery profile (treatment date, goals, challenges)</li>
                <li>Progress tracking data (mood logs, journal entries, habits)</li>
                <li>AI chat conversation history</li>
              </ul>
              <p className="mt-3">
                <strong>What we DON'T collect:</strong> Medical records, treatment provider details beyond facility name, 
                payment information (handled by Stripe), location tracking, or third-party data sharing for advertising.
              </p>
            </>
          }
        />

        <Section
          icon={Shield}
          title="Data Security"
          content={
            <>
              <p>Your data is protected through:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Industry-standard encryption (TLS/SSL) for data in transit</li>
                <li>Encrypted storage at rest on secure servers</li>
                <li>Regular security audits and updates</li>
                <li>Limited access controls - only you can view your data</li>
              </ul>
            </>
          }
        />

        <Section
          icon={Eye}
          title="AI & Data Usage"
          content={
            <>
              <p>
                Conversations with IboGuide (AI coach) are processed to provide personalized support. 
                AI interactions may be used in aggregate (anonymized) to improve response quality, 
                but are NEVER shared with third parties or used for advertising.
              </p>
              <p className="mt-3">
                <strong>AI Safety:</strong> Our AI is designed to detect crisis situations and redirect to professional help. 
                It does not store medical records or provide diagnoses.
              </p>
            </>
          }
        />

        <Section
          icon={Download}
          title="Your Rights (GDPR/CCPA Compliance)"
          content={
            <>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Access:</strong> View all your stored data anytime</li>
                <li><strong>Export:</strong> Download your data in JSON format (see above)</li>
                <li><strong>Delete:</strong> Permanently erase all your data via Settings → Delete Account</li>
                <li><strong>Rectify:</strong> Correct or update your information at any time</li>
                <li><strong>Withdraw consent:</strong> Stop using the app - your data won't be used further</li>
              </ul>
              <p className="mt-3">
                <strong>Data Retention:</strong> Your data is retained as long as your account is active. 
                After deletion, data is permanently removed within 30 days (except anonymized analytics).
              </p>
            </>
          }
        />

        <Section
          icon={Trash2}
          title="Community Forum Privacy"
          content={
            <>
              <p>
                Forum posts are <strong>anonymous</strong> - you're assigned a random username (e.g., "Phoenix47"). 
                We do NOT link forum activity to your account profile publicly.
              </p>
              <p className="mt-3">
                Posts may be moderated for safety (removing harmful content). If you share personal information 
                in posts, it's your responsibility - we recommend keeping forum posts general and supportive.
              </p>
            </>
          }
        />

        <Section
          icon={Lock}
          title="Third-Party Services"
          content={
            <>
              <p>We use limited third-party services:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Stripe:</strong> Payment processing (premium subscriptions) - they handle all payment data securely, we never see card numbers</li>
                <li><strong>Authentication providers:</strong> Google/Apple Sign-In (if used) - only email/name shared with us</li>
                <li><strong>AI providers:</strong> OpenAI/similar for IboGuide responses - conversations processed per their privacy policies (no personal health data shared)</li>
              </ul>
            </>
          }
        />

        <Section
          icon={Shield}
          title="HIPAA & Medical Data"
          content={
            <>
              <p>
                <strong>Important:</strong> IboAftercare Coach is NOT a medical service and is not HIPAA-covered. 
                While we implement privacy best practices similar to HIPAA standards, this app is for 
                informational and supportive purposes only.
              </p>
              <p className="mt-3">
                Do NOT share sensitive medical records, diagnoses, or treatment plans within the app. 
                For medical care, consult licensed healthcare providers.
              </p>
            </>
          }
        />

        <Section
          icon={Eye}
          title="Changes to This Policy"
          content={
            <p>
              We may update this policy periodically. Major changes will be communicated via email 
              or in-app notification. Continued use after updates constitutes acceptance.
            </p>
          }
        />
      </div>

      {/* Footer */}
      <div className="bg-teal-50 dark:bg-teal-950/30 rounded-2xl p-5 border border-teal-200 dark:border-teal-800">
        <p className="text-sm text-teal-900 dark:text-teal-200 leading-relaxed">
          <strong>Questions or concerns?</strong> Contact us at{" "}
          <a href="mailto:privacy@iboaftercare.app" className="underline">
            privacy@iboaftercare.app
          </a>
          . We take privacy seriously and will respond within 48 hours.
        </p>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, content }) {
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
          <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      </div>
      <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3">
        {content}
      </div>
    </div>
  );
}