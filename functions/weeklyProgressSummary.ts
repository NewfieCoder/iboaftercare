import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all users with profiles
    const profiles = await base44.asServiceRole.entities.UserProfile.list();

    for (const profile of profiles) {
      try {
        // Get user's recent mood logs (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const moodLogs = await base44.asServiceRole.entities.MoodLog.filter({
          created_by: profile.created_by,
        }, '-created_date', 7);

        const journalEntries = await base44.asServiceRole.entities.JournalEntry.filter({
          created_by: profile.created_by,
        }, '-created_date', 3);

        // Generate AI summary
        const moodData = moodLogs.map(m => `Day: ${m.mood_score}/10, Energy: ${m.energy_level}/10, Cravings: ${m.cravings_level}/10`).join('; ');
        const journalData = journalEntries.map(j => j.content.substring(0, 200)).join('; ');

        const summary = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are IboGuide, a supportive aftercare coach. Generate a brief, encouraging weekly progress summary (3-4 sentences) for a user in Ibogaine recovery based on:

Mood logs (last 7 days): ${moodData || 'No mood data logged'}
Recent journal entries: ${journalData || 'No journal entries'}

Focus on:
- Celebrating progress and resilience
- Noting patterns (mood, energy, cravings)
- Gentle encouragement for continued tracking
- Positive, warm tone

Return as JSON with: {summary: string, highlight: string (one key win this week)}`,
          response_json_schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              highlight: { type: "string" }
            }
          }
        });

        // Send email notification
        const user = await base44.asServiceRole.entities.User.filter({ email: profile.created_by });
        if (user.length > 0) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: profile.created_by,
            from_name: "IboAftercare Coach",
            subject: "Your Weekly Recovery Progress 🌱",
            body: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0D9488;">Your Weekly Progress Summary</h2>
                <p style="color: #334155; line-height: 1.6;">${summary.summary}</p>
                
                <div style="background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); padding: 16px; border-radius: 12px; margin: 20px 0;">
                  <h3 style="color: #047857; margin-top: 0;">🌟 This Week's Highlight</h3>
                  <p style="color: #065F46; margin-bottom: 0;">${summary.highlight}</p>
                </div>
                
                <p style="color: #64748B; font-size: 14px;">
                  Keep up the great work! Continue tracking your progress in the IboAftercare app.
                </p>
                
                <a href="https://iboaftercare.base44.app" style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #14B8A6 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 12px;">
                  Open IboAftercare
                </a>
              </div>
            `
          });

          console.log(`Sent weekly summary to: ${profile.created_by}`);
        }
      } catch (userError) {
        console.error(`Error processing user ${profile.created_by}:`, userError.message);
        // Continue with next user
      }
    }

    return Response.json({ 
      success: true, 
      message: `Processed ${profiles.length} users`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Weekly summary error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});