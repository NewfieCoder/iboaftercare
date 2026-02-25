import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Plus, Trash2, BookOpen, Sparkles, Shield } from "lucide-react";
import { toast } from "sonner";

export default function EditorDashboard() {
  const [user, setUser] = useState(null);
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStudy, setEditingStudy] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    source: "Other",
    summary: "",
    key_findings: "",
    category: "outcomes",
    premium_only: false,
    citation: "",
    url: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const currentUser = await base44.auth.me();
    setUser(currentUser);

    if (!["admin", "editor"].includes(currentUser?.role)) {
      toast.error("Access denied");
      return;
    }

    const studyRefs = await base44.entities.StudyReference.list('-created_date');
    setStudies(studyRefs);
    setLoading(false);
  }

  async function handleSaveStudy(e) {
    e.preventDefault();
    
    const studyData = {
      ...formData,
      key_findings: formData.key_findings.split('\n').filter(f => f.trim())
    };

    try {
      if (editingStudy) {
        await base44.entities.StudyReference.update(editingStudy.id, studyData);
        toast.success("Study updated");
      } else {
        await base44.entities.StudyReference.create(studyData);
        toast.success("Study created");
      }
      
      setFormData({
        title: "",
        source: "Other",
        summary: "",
        key_findings: "",
        category: "outcomes",
        premium_only: false,
        citation: "",
        url: ""
      });
      setEditingStudy(null);
      loadData();
    } catch (e) {
      toast.error("Failed to save study");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this study?")) return;
    try {
      await base44.entities.StudyReference.delete(id);
      toast.success("Study deleted");
      loadData();
    } catch (e) {
      toast.error("Failed to delete study");
    }
  }

  function handleEdit(study) {
    setEditingStudy(study);
    setFormData({
      title: study.title,
      source: study.source,
      summary: study.summary,
      key_findings: study.key_findings.join('\n'),
      category: study.category,
      premium_only: study.premium_only || false,
      citation: study.citation || "",
      url: study.url || ""
    });
  }

  if (!user || !["admin", "editor"].includes(user.role)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400">Editor access required.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Editor Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Curate content, add research studies, and manage resource library
        </p>
      </div>

      <Tabs defaultValue="studies" className="space-y-6">
        <TabsList>
          <TabsTrigger value="studies">Study References</TabsTrigger>
          <TabsTrigger value="ai-tips">AI Tips & Sources</TabsTrigger>
        </TabsList>

        {/* Study References */}
        <TabsContent value="studies" className="space-y-6">
          {/* Add/Edit Form */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {editingStudy ? "Edit Study" : "Add New Study"}
            </h3>
            <form onSubmit={handleSaveStudy} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Stanford Veterans Ibogaine Study"
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Source</Label>
                  <Select value={formData.source} onValueChange={v => setFormData({...formData, source: v})}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stanford">Stanford</SelectItem>
                      <SelectItem value="Ambio">Ambio</SelectItem>
                      <SelectItem value="GITA">GITA</SelectItem>
                      <SelectItem value="SAMHSA">SAMHSA</SelectItem>
                      <SelectItem value="Davis et al">Davis et al</SelectItem>
                      <SelectItem value="Beond">Beond</SelectItem>
                      <SelectItem value="Nature Medicine">Nature Medicine</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre-treatment">Pre-Treatment</SelectItem>
                      <SelectItem value="post-treatment">Post-Treatment</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="outcomes">Outcomes</SelectItem>
                      <SelectItem value="wellness">Wellness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Summary</Label>
                <Textarea
                  value={formData.summary}
                  onChange={e => setFormData({...formData, summary: e.target.value})}
                  placeholder="Brief overview of the study..."
                  required
                  className="rounded-xl min-h-24"
                />
              </div>

              <div>
                <Label>Key Findings (one per line)</Label>
                <Textarea
                  value={formData.key_findings}
                  onChange={e => setFormData({...formData, key_findings: e.target.value})}
                  placeholder="88% reduction in PTSD symptoms&#10;Benefits sustained at 1-month"
                  required
                  className="rounded-xl min-h-24"
                />
              </div>

              <div>
                <Label>Citation</Label>
                <Input
                  value={formData.citation}
                  onChange={e => setFormData({...formData, citation: e.target.value})}
                  placeholder="Stanford Medicine (2023)"
                  className="rounded-xl"
                />
              </div>

              <div>
                <Label>URL (optional)</Label>
                <Input
                  value={formData.url}
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  placeholder="https://..."
                  className="rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="premium"
                  checked={formData.premium_only}
                  onChange={e => setFormData({...formData, premium_only: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="premium" className="cursor-pointer">
                  Premium Content Only
                </Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="rounded-xl gap-2">
                  {editingStudy ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingStudy ? "Update Study" : "Add Study"}
                </Button>
                {editingStudy && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingStudy(null);
                      setFormData({
                        title: "",
                        source: "Other",
                        summary: "",
                        key_findings: "",
                        category: "outcomes",
                        premium_only: false,
                        citation: "",
                        url: ""
                      });
                    }}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* Studies List */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Published Studies ({studies.length})
            </h3>
            <div className="space-y-3">
              {studies.map(study => (
                <div
                  key={study.id}
                  className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                        {study.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {study.source} • {study.category} {study.premium_only && "• Premium"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(study)}
                        className="rounded-xl"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(study.id)}
                        className="rounded-xl text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {study.summary}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* AI Tips */}
        <TabsContent value="ai-tips">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              AI Source Tips (Editor View)
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              The AI agent already incorporates sources from Ambio, Stanford, GITA, SAMHSA, and Davis et al.
              Studies added here automatically become available for AI citations.
            </p>
            <div className="p-4 bg-teal-50 dark:bg-teal-900/30 rounded-xl">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                💡 Tip: When adding studies, use clear summaries and actionable key findings.
                The AI will naturally cite these in responses to users.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}