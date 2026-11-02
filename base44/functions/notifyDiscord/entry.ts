import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const DISCORD_WEBHOOK = /^https:\/\/(canary\.discord\.com|ptb\.discord\.com|discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[\w-]+$/;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const classroomId = typeof body.classroom_id === 'string' ? body.classroom_id : '';
    if (!classroomId) return Response.json({ error: 'classroom_id is required' }, { status: 400 });

    const classroom = await base44.asServiceRole.entities.Classroom.get(classroomId).catch((e) =>
      e.status === 404 ? null : Promise.reject(e)
    );
    if (!classroom) return Response.json({ error: 'Class not found' }, { status: 404 });
    if (classroom.created_by_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const channels = await base44.asServiceRole.entities.DiscordChannel.filter(
      { classroom_id: classroomId, created_by_id: user.id },
      { limit: 1 }
    );
    const channel = channels.items[0];
    if (!channel || !channel.webhook_url) {
      return Response.json({ error: 'No Discord channel connected for this class' }, { status: 404 });
    }
    if (!DISCORD_WEBHOOK.test(channel.webhook_url)) {
      return Response.json({ error: 'Saved webhook is not a Discord webhook URL' }, { status: 400 });
    }

    const title = String(body.title || 'New work set').slice(0, 200);
    const detail = String(body.detail || '').slice(0, 500);

    const response = await fetch(channel.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Numera',
        embeds: [
          {
            title,
            description: detail,
            color: 0x5b5bf0,
            footer: { text: classroom.name },
          },
        ],
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return Response.json({ error: 'Discord rejected that message' }, { status: 502 });
    }

    return Response.json({ sent: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}