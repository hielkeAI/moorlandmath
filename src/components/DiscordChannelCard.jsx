import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { asArray } from '@/lib/appData';

const WEBHOOK_PATTERN =
  /^https:\/\/(canary\.discord\.com|ptb\.discord\.com|discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[\w-]+$/;

const inputClass =
  'h-11 w-full rounded-xl border border-border bg-background px-4 text-[15px] outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-primary/10';

export default function DiscordChannelCard({ classroomId, classroomName }) {
  const [channel, setChannel] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const rows = asArray(
        await base44.entities.DiscordChannel.filter({ classroom_id: classroomId }, { limit: 1 })
      );
      if (!active) return;
      setChannel(rows[0] || null);
      setUrl(rows[0]?.webhook_url || '');
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [classroomId]);

  const save = async (event) => {
    event.preventDefault();
    const clean = url.trim();
    if (!WEBHOOK_PATTERN.test(clean)) {
      setError('Paste the full webhook URL from Discord — it starts with https://discord.com/api/webhooks/');
      return;
    }
    setBusy(true);
    setError('');
    setStatus('');
    try {
      if (channel) {
        await base44.entities.DiscordChannel.update(channel.id, { webhook_url: clean });
        setChannel({ ...channel, webhook_url: clean });
      } else {
        const created = await base44.entities.DiscordChannel.create({
          classroom_id: classroomId,
          classroom_name: classroomName,
          webhook_url: clean,
        });
        setChannel(created);
      }
      setStatus('Saved — new homework and assessments now post here.');
    } catch (err) {
      setError(err.message || 'Could not save that webhook.');
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    setBusy(true);
    setError('');
    setStatus('');
    try {
      await base44.functions.invoke('notifyDiscord', {
        classroom_id: classroomId,
        title: `Numera · ${classroomName}`,
        detail: 'Test message — homework and assessments will appear here.',
      });
      setStatus('Test sent — check the channel.');
    } catch (err) {
      setError(err?.response?.data?.error || 'Discord did not accept the test message.');
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    if (!channel) return;
    setBusy(true);
    setError('');
    setStatus('');
    try {
      await base44.entities.DiscordChannel.delete(channel.id);
      setChannel(null);
      setUrl('');
      setStatus('Disconnected.');
    } catch (err) {
      setError(err.message || 'Could not disconnect.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="surface p-5">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h2 className="font-display text-base font-semibold tracking-tight">Discord channel</h2>
        {channel && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
            Connected
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Post every new homework and assessment into a Discord channel — useful for revision groups.
        In Discord: channel settings → Integrations → Webhooks → New Webhook → Copy Webhook URL.
      </p>

      {loading ? (
        <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <form onSubmit={save} className="mt-4 space-y-3">
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://discord.com/api/webhooks/…"
            className={inputClass}
            aria-label="Discord webhook URL"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {channel ? 'Update webhook' : 'Connect channel'}
            </button>
            {channel && (
              <>
                <button
                  type="button"
                  onClick={sendTest}
                  disabled={busy}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium disabled:opacity-60"
                >
                  Send test
                </button>
                <button
                  type="button"
                  onClick={disconnect}
                  disabled={busy}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              </>
            )}
          </div>
        </form>
      )}

      {status && (
        <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary">
          <CheckCircle2 className="h-4 w-4" /> {status}
        </p>
      )}
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}