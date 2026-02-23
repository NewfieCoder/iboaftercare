import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, ExternalLink } from "lucide-react";
import { toast } from "sonner";


const sampleStudies = [
  {
    title: "Stanford Veterans Ibogaine Study - TBI/PTSD Outcomes",
    source: "Stanford",
    summary: "Clinical trial showing 81-88% reduction in PTSD/TBI symptoms post-Ibogaine, sustained at 1-month follow-up. Integration coaching and mindfulness practices correlated with better outcomes.",
    key_findings: [
      "88% reduction in PTSD symptoms",
      "81% reduction in TBI symptoms",
      "Benefits sustained at 1-month",
      "Integration support critical for maintaining gains"
    ],
    category: "outcomes",
    premium_only: false,
    citation: "Stanford Medicine study on Special Operations veterans (2023)",
    url: "https://med.stanford.edu"
  },
  {
    title: "Ambio Integration Protocol - Gray Day & Holistic Aftercare",
    source: "Ambio",
    summary: "Ambio Life Sciences' comprehensive integration approach emphasizing rest ('Gray Day'), gentle therapies (massage, yoga), nutrition for neuroregeneration (omega-3s, anti-inflammatory diet), and processing insights through journaling and counseling.",
    key_findings: [
      "Gray Day rest essential post-treatment",
      "Omega-3s support brain healing",
      "Avoid stimulants during integration",
      "Gentle movement aids emotional processing"
    ],
    category: "integration",
    premium_only: false,
    citation: "Ambio Life Sciences Integration Model",
    url: ""
  },
  {
    title: "GITA Pre-Screening Guidelines",
    source: "GITA",
    summary: "Global Ibogaine Therapy Alliance safety protocols for pre-treatment medical screening, including EKG requirements, liver/kidney function tests, and contraindications for safe administration.",
    key_findings: [
      "EKG mandatory pre-treatment",
      "Liver function tests required",
      "Screen for cardiac issues",
      "Mental health evaluation recommended"
    ],
    category: "safety",
    premium_only: false,
    citation: "GITA Safety Guidelines (2023)",
    url: ""
  },
  {
    title: "Davis et al. - Long-term Effects and Integration Challenges",
    source: "Davis et al",
    summary: "Research on persisting effects post-Ibogaine: increased gratitude, authenticity, and life satisfaction. Study highlights integration challenges and need for ongoing support to sustain benefits.",
    key_findings: [
      "Sustained increases in gratitude/authenticity",
      "Integration challenges common",
      "Counseling support improves outcomes",
      "Relapse prevention requires structure"
    ],
    category: "outcomes",
    premium_only: true,
    citation: "Davis et al., Journal of Psychopharmacology (2022)",
    url: ""
  }
];

export default function StudyLibrary() {
  const [profile, setProfile] = useState(null);
  const [studies, setStudies] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const profiles = await base44.entities.UserProfile.list();
    const studyRefs = await base44.entities.StudyReference.list();
    
    if (profiles.length > 0) setProfile(profiles[0]);
    
    // Seed sample studies if none exist
    if (studyRefs.length === 0) {
      for (const study of sampleStudies) {
        await base44.entities.StudyReference.create(study);
      }
      const newStudies = await base44.entities.StudyReference.list();
      setStudies(newStudies);
    } else {
      setStudies(studyRefs);
    }
    
    setLoading(false);
  }

  const filteredStudies = studies.filter(study => {
    const matchesSearch = search === "" || 
      study.title.toLowerCase().includes(search.toLowerCase()) ||
      study.summary.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter === "all" || study.category === filter;
    
    return matchesSearch && matchesFilter;
  });

  const categories = ["all", "pre-treatment", "post-treatment", "integration", "safety", "outcomes", "wellness"];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Research Library
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Evidence-based studies and guidelines from Stanford, Ambio, GITA, SAMHSA, and more
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search studies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={filter === cat ? "default" : "outline"}
              onClick={() => setFilter(cat)}
              className="rounded-full text-xs capitalize"
            >
              {cat.replace("-", " ")}
            </Button>
          ))}
        </div>
      </div>

      {/* Studies Grid */}
      <div className="space-y-4">
        {filteredStudies.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400">No studies found matching your criteria.</p>
          </Card>
        ) : (
          filteredStudies.map(study => (
            <Card key={study.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {study.title}
                    </h3>

                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge>{study.source}</Badge>
                    <Badge variant="outline" className="capitalize">{study.category}</Badge>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                {study.summary}
              </p>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Key Findings:
                </h4>
                <ul className="space-y-1">
                  {study.key_findings.map((finding, idx) => (
                    <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-teal-600 mt-1">•</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {study.citation}
                </p>
                {study.url && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-teal-600"
                    onClick={() => window.open(study.url, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Source
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>


    </div>
  );
}