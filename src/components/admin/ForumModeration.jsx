import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Flag, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function ForumModeration({ adminEmail }) {
  const [posts, setPosts] = useState([]);
  const [replies, setReplies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, flagged

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const { data } = await base44.functions.invoke('adminGetForumContent');
      setPosts(data?.posts || []);
      setReplies(data?.replies || []);
      setLoading(false);
    } catch (e) {
      toast.error("Failed to load forum content");
      setLoading(false);
    }
  }

  async function deletePost(id) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await base44.functions.invoke('adminModeratePost', {
        action: 'delete',
        postId: id
      });
      toast.success("Post deleted");
      loadPosts();
    } catch (e) {
      toast.error("Failed to delete post");
    }
  }

  async function toggleFlag(id, currentStatus) {
    try {
      await base44.functions.invoke('adminModeratePost', {
        action: 'update',
        postId: id,
        updateData: { is_flagged: !currentStatus }
      });
      toast.success(currentStatus ? "Post unflagged" : "Post flagged for review");
      loadPosts();
    } catch (e) {
      toast.error("Failed to update post");
    }
  }

  async function deleteReply(id) {
    if (!confirm("Delete this reply?")) return;
    try {
      await base44.asServiceRole.entities.ForumReply.delete(id);
      toast.success("Reply deleted");
      loadPosts();
    } catch (e) {
      toast.error("Failed to delete reply");
    }
  }

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
                         p.content?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "flagged" && p.is_flagged);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Forum Moderation</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review and moderate community posts
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="rounded-xl"
          >
            All Posts
          </Button>
          <Button
            variant={filter === "flagged" ? "default" : "outline"}
            onClick={() => setFilter("flagged")}
            className="rounded-xl"
          >
            Flagged
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{posts.length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Posts</p>
        </div>
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
          <p className="text-2xl font-bold text-rose-600">{posts.filter(p => p.is_flagged).length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Flagged</p>
        </div>
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
          <p className="text-2xl font-bold text-violet-600">{replies.length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Replies</p>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 divide-y divide-slate-200 dark:divide-slate-700">
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No posts found.
          </div>
        ) : (
          filteredPosts.map(post => {
            const postReplies = replies.filter(r => r.post_id === post.id);
            return (
              <div key={post.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-900/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {post.is_flagged && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
                          <Flag className="w-3 h-3" />
                          Flagged
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                        {post.category}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                      {post.title || "Untitled Post"}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>By: {post.anonymous_username}</span>
                      <span>Posted: {new Date(post.created_date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {postReplies.length} replies
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFlag(post.id, post.is_flagged)}
                      className="rounded-lg"
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deletePost(post.id)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Replies */}
                {postReplies.length > 0 && (
                  <div className="ml-6 mt-3 space-y-2 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                    {postReplies.slice(0, 3).map(reply => (
                      <div key={reply.id} className="flex items-start justify-between text-sm">
                        <div className="flex-1">
                          <p className="text-slate-600 dark:text-slate-400">{reply.content}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            {reply.anonymous_username} • {new Date(reply.created_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteReply(reply.id)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    {postReplies.length > 3 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        +{postReplies.length - 3} more replies
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}