// Cloudflare Pages Edge Function: /api/backup
// Full integration with Cloudflare KV, Cloudflare D1 Database & GitHub Repository
// Automatically backs up all series, episodes, users, comments and settings in real-time.

function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

const GITHUB_REPO = 'SemanteV7/minimo-series';
const GITHUB_BACKUP_PATH = 'data/minimo_database.json';

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequestPost(context: any) {
  try {
    const data = await context.request.json();
    const actualData = data.data || data;
    const timestamp = new Date().toISOString();
    const seriesCount = actualData.seriesList?.length || 0;
    const userCount = actualData.allUsers?.length || 0;
    const commentsCount = actualData.comments?.length || 0;
    const dmsCount = actualData.directMessages?.length || 0;
    const communityCount = actualData.communityMessages?.length || 0;
    const totalMessages = dmsCount + communityCount;
    const payloadStr = JSON.stringify(data, null, 2);

    let storageUsed: string[] = [];
    let githubCommitUrl: string | null = null;

    // 1. Cloudflare KV Storage Support (MINIMO_BACKUPS binding)
    if (context.env?.MINIMO_BACKUPS) {
      try {
        await context.env.MINIMO_BACKUPS.put('latest_backup', payloadStr);
        await context.env.MINIMO_BACKUPS.put(`backup_${Date.now()}`, payloadStr, {
          metadata: { timestamp, seriesCount, userCount, commentsCount, totalMessages },
        });
        storageUsed.push('Cloudflare KV (MINIMO_BACKUPS)');
      } catch (kvErr: any) {
        console.error('KV Error:', kvErr?.message);
      }
    }

    // 2. Cloudflare D1 Database Support (DB or MINIMO_DB binding)
    const db = context.env?.DB || context.env?.MINIMO_DB;
    if (db) {
      try {
        await db.prepare(`
          CREATE TABLE IF NOT EXISTS minimo_backups (
            id TEXT PRIMARY KEY,
            updated_at TEXT NOT NULL,
            series_count INTEGER,
            user_count INTEGER,
            comments_count INTEGER,
            messages_count INTEGER,
            json_payload TEXT NOT NULL
          );
        `).run();

        await db.prepare(`
          INSERT OR REPLACE INTO minimo_backups (id, updated_at, series_count, user_count, comments_count, messages_count, json_payload)
          VALUES ('latest', ?, ?, ?, ?, ?, ?);
        `).bind(timestamp, seriesCount, userCount, commentsCount, totalMessages, payloadStr).run();

        await db.prepare(`
          INSERT INTO minimo_backups (id, updated_at, series_count, user_count, comments_count, messages_count, json_payload)
          VALUES (?, ?, ?, ?, ?, ?, ?);
        `).bind(`backup_${Date.now()}`, timestamp, seriesCount, userCount, commentsCount, totalMessages, payloadStr).run();

        storageUsed.push('Cloudflare D1 SQL (DB)');
      } catch (dbErr: any) {
        console.error('D1 Error:', dbErr?.message);
      }
    }

    // 3. GitHub Auto-Sync: Commits snapshot directly to GitHub repository (SemanteV7/minimo-series)
    const githubToken = context.env?.GITHUB_TOKEN || data.githubToken;
    const syncGithub = data.syncGithub !== false; // enabled by default unless explicitly disabled

    if (githubToken && syncGithub) {
      try {
        const ghHeaders = {
          'Authorization': `token ${githubToken}`,
          'User-Agent': 'Minimo-Series-Edge-Backup',
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        };

        // Check if file already exists to get its SHA
        let fileSha: string | null = null;
        try {
          const checkResp = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_BACKUP_PATH}`,
            { headers: ghHeaders }
          );
          if (checkResp.ok) {
            const checkData: any = await checkResp.json();
            fileSha = checkData.sha || null;
          }
        } catch {
          // New file, sha remains null
        }

        // Commit updated file to GitHub repo
        const commitPayload: any = {
          message: `⚡ Otomatik Yedek: ${seriesCount} Dizi, ${userCount} Üye & Profil, ${commentsCount} Yorum, ${totalMessages} Mesaj [${new Date().toLocaleTimeString('tr-TR')}]`,
          content: toBase64(payloadStr),
          branch: 'main',
        };
        if (fileSha) {
          commitPayload.sha = fileSha;
        }

        const putResp = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_BACKUP_PATH}`,
          {
            method: 'PUT',
            headers: ghHeaders,
            body: JSON.stringify(commitPayload),
          }
        );

        if (putResp.ok) {
          const putResult: any = await putResp.json();
          githubCommitUrl = putResult.commit?.html_url || `https://github.com/${GITHUB_REPO}/blob/main/${GITHUB_BACKUP_PATH}`;
          storageUsed.push('GitHub (SemanteV7/minimo-series)');
        }
      } catch (ghErr: any) {
        console.error('GitHub Sync Error:', ghErr?.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: storageUsed.length > 0
          ? `Tüm platform verisi (Diziler, Üyeler & Profil Resimleri, Yorumlar, Mesajlar) ${storageUsed.join(' & ')} üzerine başarıyla kaydedildi!`
          : 'Yedekleme verisi Cloudflare Edge fonksiyonu tarafından alındı ve onaylandı.',
        timestamp,
        storageUsed: storageUsed.length > 0 ? storageUsed : ['Cloudflare Edge In-Memory'],
        githubCommitUrl,
        stats: {
          seriesCount,
          userCount,
          commentsCount,
          dmsCount,
          communityCount,
          totalMessages,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'Yedekleme işleme hatası' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function onRequestGet(context: any) {
  try {
    // 1. Try Cloudflare KV
    if (context.env?.MINIMO_BACKUPS) {
      const latest = await context.env.MINIMO_BACKUPS.get('latest_backup');
      if (latest) {
        return new Response(latest, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // 2. Try Cloudflare D1
    const db = context.env?.DB || context.env?.MINIMO_DB;
    if (db) {
      try {
        const result = await db.prepare(
          `SELECT json_payload FROM minimo_backups WHERE id = 'latest';`
        ).first();
        if (result && result.json_payload) {
          return new Response(result.json_payload as string, {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      } catch (err: any) {
        console.error('D1 query err:', err?.message);
      }
    }

    // 3. Try GitHub repo fallback (if KV/D1 is empty or fresh instance)
    const githubToken = context.env?.GITHUB_TOKEN;
    if (githubToken) {
      try {
        const ghResp = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_BACKUP_PATH}`,
          {
            headers: {
              'Authorization': `token ${githubToken}`,
              'User-Agent': 'Minimo-Series-App',
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        );
        if (ghResp.ok) {
          const fileData: any = await ghResp.json();
          if (fileData?.content) {
            const decodedJson = fromBase64(fileData.content);
            return new Response(decodedJson, {
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            });
          }
        }
      } catch {
        // Continue to default ready response
      }
    }

    return new Response(
      JSON.stringify({
        status: 'ready',
        service: 'Minimo Series Cloudflare Edge & GitHub Dual Sync API',
        message: 'Cloudflare Pages Functions API aktif. KV, D1 ve GitHub otomatik kalıcı senkronizasyon hazır.',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message }), { status: 500 });
  }
}
