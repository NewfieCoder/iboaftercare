import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MessageCircle, Flag, Plus, Loader2, Users, Shield } from "lucide-react";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import PullToRefresh from "@/components/PullToRefresh";

const categories = [
  "Integration Stories",
  "Daily Check-ins",
  "Challenges & Support",
  "Wellness Tips",
  "Milestones",
  "General"
];

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [postsData, profiles] = await Promise.all([
      base44.entities.ForumPost.filter({ is_flagged: false }, "-created_date", 50),
      base44.entities.UserProfile.list()
    ]);
    setPosts(postsData);
    if (profiles.length > 0) setProfile(profiles[0]);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <PullToRefresh onRefresh={loadData} />
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Community Forum</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Share experiences, support each other, and connect with others on the recovery journey.
        </p>
      </div>

      {/* Community Guidelines Banner */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
          <strong>Community Guidelines:</strong> Be respectful, kind, and supportive. No medical advice, personal attacks, or sharing of personal health information. Posts are anonymous for your privacy.
        </div>
      </div>

      {showNewPost ? (
        <NewPostForm
          onCancel={() => setShowNewPost(false)}
          onSuccess={() => {
            setShowNewPost(false);
            loadData();
          }}
          profile={profile}
        />
      ) : (
        <Button
          onClick={() => setShowNewPost(true)}
          className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 gap-2"
        >
          <Plus className="w-4 h-4" /> Share a Post
        </Button>
      )}

      {/* Category Filter */}
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="w-full rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Categories</SelectItem>
          {categories.map(cat => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Posts */}
      <div className="space-y-4">
        {posts
          .filter(p => selectedCategory === "All" || p.category === selectedCategory)
          .map(post => (
            <PostCard key={post.id} post={post} onUpdate={loadData} />
          ))}
        {posts.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            No posts yet. Be the first to share!
          </div>
        )}
      </div>

      <DisclaimerBanner compact />
    </div>
  );
}

function NewPostForm({ onCancel, onSuccess, profile }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!content.trim()) return;
    setSubmitting(true);

    // Generate anonymous username (e.g., "Phoenix47", "Seeker23")
    const adjectives = ["Phoenix", "Seeker", "Voyager", "Warrior", "Guide", "Healer", "Spirit", "Light"];
    const username = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${Math.floor(Math.random() * 99)}`;

    await base44.entities.ForumPost.create({
      title,
      content,
      category,
      anonymous_username: username,
      likes_count: 0,
      replies_count: 0,
      is_flagged: false
    });

    setSubmitting(false);
    onSuccess();
  }

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 space-y-4">
      <h3 className="font-semibold text-slate-900 dark:text-white">New Post</h3>
      <Input
        placeholder="Title (optional)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="rounded-xl"
      />
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-full rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categories.map(cat => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        placeholder="Share your thoughts, experiences, or questions..."
        value={content}
        onChange={e => setContent(e.target.value)}
        className="rounded-xl min-h-[120px]"
      />
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
          className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
        </Button>
        <Button onClick={onCancel} variant="outline" className="rounded-xl">
          Cancel
        </Button>
      </div>
    </div>
  );
}

function PostCard({ post, onUpdate }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  async function loadReplies() {
    setLoadingReplies(true);
    const data = await base44.entities.ForumReply.filter({ post_id: post.id }, "-created_date");
    setReplies(data);
    setLoadingReplies(false);
  }

  async function handleLike() {
    await base44.entities.ForumPost.update(post.id, {
      likes_count: (post.likes_count || 0) + 1
    });
    onUpdate();
  }

  async function handleFlag() {
    await base44.entities.ForumPost.update(post.id, { is_flagged: true });
    onUpdate();
  }

  async function toggleReplies() {
    if (!showReplies && replies.length === 0) {
      await loadReplies();
    }
    setShowReplies(!showReplies);
  }

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {post.anonymous_username[0]}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{post.anonymous_username}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(post.created_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <span className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2 py-1 rounded-full">
          {post.category}
        </span>
      </div>

      {post.title && (
        <h3 className="font-semibold text-slate-900 dark:text-white">{post.title}</h3>
      )}
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
        >
          <Heart className="w-4 h-4" />
          {post.likes_count || 0}
        </button>
        <button
          onClick={toggleReplies}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {post.replies_count || 0}
        </button>
        <button
          onClick={handleFlag}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors ml-auto"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {showReplies && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
          {loadingReplies ? (
            <div className="text-center py-4">
              <Loader2 className="w-5 h-5 text-violet-500 animate-spin mx-auto" />
            </div>
          ) : (
            <>
              {replies.map(reply => (
                <div key={reply.id} className="flex gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-300 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {reply.anonymous_username[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white text-xs">
                      {reply.anonymous_username}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
                      {reply.content}
                    </p>
                  </div>
                </div>
              ))}
              <ReplyForm postId={post.id} onSuccess={() => { loadReplies(); onUpdate(); }} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ReplyForm({ postId, onSuccess }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!content.trim()) return;
    setSubmitting(true);

    const adjectives = ["Phoenix", "Seeker", "Voyager", "Warrior", "Guide", "Healer", "Spirit", "Light"];
    const username = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${Math.floor(Math.random() * 99)}`;

    await base44.entities.ForumReply.create({
      post_id: postId,
      content,
      anonymous_username: username,
      likes_count: 0
    });

    // Update post reply count
    const post = await base44.entities.ForumPost.filter({ id: postId });
    if (post.length > 0) {
      await base44.entities.ForumPost.update(postId, {
        replies_count: (post[0].replies_count || 0) + 1
      });
    }

    setContent("");
    setSubmitting(false);
    onSuccess();
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Write a reply..."
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSubmit()}
        className="flex-1 rounded-xl text-sm"
      />
      <Button
        onClick={handleSubmit}
        disabled={!content.trim() || submitting}
        size="sm"
        className="rounded-xl bg-violet-600 hover:bg-violet-700"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reply"}
      </Button>
    </div>
  );
}