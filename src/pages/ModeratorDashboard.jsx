import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Flag, Ban, Trash2, Eye, Filter, UserX, Shield } from "lucide-react";
import { toast } from "sonner";

export default function ModeratorDashboard() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const currentUser = await base44.auth.me();
    setUser(currentUser);

    if (!["admin", "moderator"].includes(currentUser?.role)) {
      toast.error("Access denied");
      return;
    }

    const { data } = await base44.functions.invoke('adminGetForumContent');
    setPosts(data?.posts || []);

    const moderationRules = await base44.entities.ModerationRule.list();
    setRules(moderationRules);
    setLoading(false);
  }

  async function handleFlag(postId, currentStatus) {
    try {
      await base44.functions.invoke('adminModeratePost', {
        action: 'update',
        postId,
        updateData: { is_flagged: !currentStatus }
      });
      toast.success(currentStatus ? "Post unflagged" : "Post flagged");
      loadData();
    } catch (e) {
      toast.error("Failed to update post");
    }
  }

  async function handleDelete(postId) {
    if (!confirm("Delete this post permanently?")) return;
    try {
      await base44.functions.invoke('adminModeratePost', {
        action: 'delete',
        postId
      });
      toast.success("Post deleted");
      loadData();
    } catch (e) {
      toast.error("Failed to delete post");
    }
  }

  async function handleBanUser(email, duration) {
    const ban_expires = duration === "permanent" ? null : new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString();
    
    try {
      await base44.functions.invoke('adminUpdateUser', {
        email,
        updates: {
          forum_banned: true,
          forum_ban_expires: ban_expires
        }
      });
      toast.success(`User banned ${duration === "permanent" ? "permanently" : `for ${duration} days`}`);
    } catch (e) {
      toast.error("Failed to ban user");
    }
  }

  const filteredPosts = posts.filter(post => {
    if (filter === "flagged") return post.is_flagged;
    return true;
  });

  if (!user || !["admin", "moderator"].includes(user.role)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400">Moderator access required.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Moderator Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Oversee community forum, manage posts, and enforce rules
        </p>
      </div>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">Forum Posts</TabsTrigger>
          <TabsTrigger value="rules">Moderation Rules</TabsTrigger>
        </TabsList>

        {/* Forum Posts */}
        <TabsContent value="posts" className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className="rounded-xl"
            >
              All Posts ({posts.length})
            </Button>
            <Button
              variant={filter === "flagged" ? "default" : "outline"}
              onClick={() => setFilter("flagged")}
              className="rounded-xl gap-2"
            >
              <Flag className="w-4 h-4" />
              Flagged ({posts.filter(p => p.is_flagged).length})
            </Button>
          </div>

          <div className="space-y-3">
            {filteredPosts.map(post => (
              <Card key={post.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.title && (
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {post.title}
                        </h3>
                      )}
                      <Badge>{post.category}</Badge>
                      {post.is_flagged && (
                        <Badge variant="destructive" className="gap-1">
                          <Flag className="w-3 h-3" />
                          Flagged
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>By: {post.anonymous_username}</span>
                      <span>•</span>
                      <span>{new Date(post.created_date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{post.likes_count} likes</span>
                      <span>•</span>
                      <span>{post.replies_count} replies</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFlag(post.id, post.is_flagged)}
                    className="rounded-xl gap-2"
                  >
                    <Flag className="w-3 h-3" />
                    {post.is_flagged ? "Unflag" : "Flag"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(post.id)}
                    className="rounded-xl gap-2 text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const duration = prompt("Ban duration in days (or 'permanent'):");
                      if (duration) {
                        handleBanUser(
                          post.created_by,
                          duration === "permanent" ? "permanent" : parseInt(duration)
                        );
                      }
                    }}
                    className="rounded-xl gap-2 text-orange-600"
                  >
                    <UserX className="w-3 h-3" />
                    Ban User
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Moderation Rules */}
        <TabsContent value="rules" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              Active Moderation Rules
            </h3>
            {rules.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                No moderation rules yet. Admins can create rules.
              </p>
            ) : (
              <div className="space-y-3">
                {rules.map(rule => (
                  <div
                    key={rule.id}
                    className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {rule.rule_name}
                      </h4>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <p>Type: {rule.rule_type}</p>
                      <p>Action: {rule.action}</p>
                      {rule.keywords && (
                        <p>Keywords: {rule.keywords.join(", ")}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}