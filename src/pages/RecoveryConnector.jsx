import { ExternalLink, Users, Heart, Calendar, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DisclaimerBanner from "@/components/DisclaimerBanner";

const recoveryPrograms = [
  {
    name: "SMART Recovery",
    description: "Science-based mutual support groups for addiction recovery",
    website: "https://www.smartrecovery.org",
    findMeetings: "https://meetings.smartrecovery.org",
    phone: null,
    features: ["Evidence-based approach", "Online & in-person meetings", "Free resources", "4-Point Program"]
  },
  {
    name: "Narcotics Anonymous",
    description: "12-step fellowship for recovery from drug addiction",
    website: "https://www.na.org",
    findMeetings: "https://www.na.org/meetingsearch/",
    phone: null,
    features: ["Worldwide meetings", "Anonymous support", "Sponsorship program", "12 Steps & 12 Traditions"]
  },
  {
    name: "Alcoholics Anonymous",
    description: "12-step program for alcohol recovery",
    website: "https://www.aa.org",
    findMeetings: "https://www.aa.org/find-aa",
    phone: null,
    features: ["Local & virtual meetings", "24/7 support", "Big Book resources", "Global community"]
  },
  {
    name: "Refuge Recovery",
    description: "Buddhist-inspired recovery program",
    website: "https://refugerecovery.org",
    findMeetings: "https://refugerecovery.org/meetings",
    phone: null,
    features: ["Mindfulness-based", "Meditation practices", "Non-theistic approach", "Compassion-focused"]
  },
  {
    name: "SAMHSA National Helpline",
    description: "Free, confidential treatment referral and information service",
    website: "https://www.samhsa.gov/find-help/national-helpline",
    findMeetings: null,
    phone: "1-800-662-4357",
    features: ["24/7 availability", "Free & confidential", "Treatment referrals", "Information services"]
  }
];

export default function RecoveryConnector() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Recovery Support Connector
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Connect with established recovery programs and support communities
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
            <strong>Community Support Works:</strong> Research shows that peer support significantly improves long-term recovery outcomes. These programs offer evidence-based approaches and compassionate communities for your journey.
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {recoveryPrograms.map((program, idx) => (
          <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  {program.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {program.description}
                </p>
              </div>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {program.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              {program.website && (
                <Button
                  variant="outline"
                  className="rounded-xl gap-2"
                  onClick={() => window.open(program.website, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </Button>
              )}
              {program.findMeetings && (
                <Button
                  className="rounded-xl gap-2 bg-gradient-to-r from-emerald-600 to-teal-600"
                  onClick={() => window.open(program.findMeetings, '_blank')}
                >
                  <MapPin className="w-4 h-4" />
                  Find Meetings
                </Button>
              )}
              {program.phone && (
                <Button
                  className="rounded-xl gap-2 bg-gradient-to-r from-blue-600 to-indigo-600"
                  onClick={() => window.location.href = `tel:${program.phone}`}
                >
                  <Phone className="w-4 h-4" />
                  Call {program.phone}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          Finding the Right Program
        </h3>
        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <p>
            <strong>Try Different Approaches:</strong> Each program has a unique philosophy. SMART Recovery is science-based, while NA/AA follow the 12-step model. Refuge Recovery offers a Buddhist perspective.
          </p>
          <p>
            <strong>Attend Multiple Meetings:</strong> Every meeting has its own culture. Visit several before deciding what fits best for you.
          </p>
          <p>
            <strong>Online Options Available:</strong> Most programs offer virtual meetings, making it easier to participate from anywhere.
          </p>
        </div>
      </Card>

      <DisclaimerBanner compact />
    </div>
  );
}