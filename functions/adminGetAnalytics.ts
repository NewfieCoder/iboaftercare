import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only function
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch data with service role
    const [users, profiles, moods, posts, habits, journals] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.UserProfile.list(),
      base44.asServiceRole.entities.MoodLog.list('-created_date', 100),
      base44.asServiceRole.entities.ForumPost.list('-created_date', 100),
      base44.asServiceRole.entities.HabitTracker.list(),
      base44.asServiceRole.entities.JournalEntry.list('-created_date', 100)
    ]);

    const premiumUsers = profiles.filter(p => p.premium).length;
    const activeUsers = users.filter(u => {
      const lastActive = new Date(u.updated_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastActive > weekAgo;
    }).length;

    // Engagement over time (last 7 days)
    const engagementData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayMoods = moods.filter(m => m.created_date?.startsWith(dateStr)).length;
      const dayPosts = posts.filter(p => p.created_date?.startsWith(dateStr)).length;
      const dayJournals = journals.filter(j => j.created_date?.startsWith(dateStr)).length;
      
      engagementData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        activity: dayMoods + dayPosts + dayJournals
      });
    }

    const stats = {
      totalUsers: users.length,
      activeUsers,
      premiumUsers,
      forumPosts: posts.length,
      moodLogs: moods.length,
      habitTrackers: habits.length,
      journalEntries: journals.length,
      engagementData
    };

    return Response.json(stats);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});