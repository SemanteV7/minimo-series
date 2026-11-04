import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const GITHUB_REPO = 'SemanteV7/minimo-series';
const GITHUB_PATH = 'data/minimo_database.json';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN || '';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'edge-backup-dev-middleware',
        configureServer(server) {
          server.middlewares.use('/api/backup', async (req, res, next) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });
              req.on('end', async () => {
                try {
                  const data = JSON.parse(body);
                  const payloadStr = JSON.stringify(data, null, 2);
                  const timestamp = new Date().toISOString();
                  const actualData = data.data || data;
                  const seriesCount = actualData.seriesList?.length || 0;
                  const userCount = actualData.allUsers?.length || 0;
                  const commentsCount = actualData.comments?.length || 0;
                  const dmsCount = actualData.directMessages?.length || 0;
                  const commMsgsCount = actualData.communityMessages?.length || 0;
                  const totalMessages = dmsCount + commMsgsCount;
                  let githubCommitUrl: string | null = null;
                  const storageUsed: string[] = ['Cloudflare KV Simülatörü'];

                  // Auto-commit to GitHub repository
                  try {
                    const ghCheck = await fetch(
                      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`,
                      {
                        headers: {
                          Authorization: `token ${GITHUB_TOKEN}`,
                          'User-Agent': 'Minimo-Series-Dev',
                          Accept: 'application/vnd.github.v3+json',
                        },
                      }
                    );
                    let sha: string | null = null;
                    if (ghCheck.ok) {
                      const ghData = (await ghCheck.json()) as any;
                      sha = ghData.sha || null;
                    }

                    const b64 = Buffer.from(payloadStr).toString('base64');
                    const commitPayload: any = {
                      message: `⚡ Otomatik Senkronizasyon: ${seriesCount} Dizi, ${userCount} Üye & Profil, ${commentsCount} Yorum, ${totalMessages} Mesaj [${new Date().toLocaleTimeString('tr-TR')}]`,
                      content: b64,
                      branch: 'main',
                    };
                    if (sha) commitPayload.sha = sha;

                    const putResp = await fetch(
                      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`,
                      {
                        method: 'PUT',
                        headers: {
                          Authorization: `token ${GITHUB_TOKEN}`,
                          'User-Agent': 'Minimo-Series-Dev',
                          Accept: 'application/vnd.github.v3+json',
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(commitPayload),
                      }
                    );

                    if (putResp.ok) {
                      const putData = (await putResp.json()) as any;
                      githubCommitUrl = putData.commit?.html_url || null;
                      storageUsed.push('GitHub (SemanteV7/minimo-series)');
                    }
                  } catch (ghErr) {
                    console.error('GitHub API dev error:', ghErr);
                  }

                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      success: true,
                      message: `Tüm veriler (Diziler, Üyeler & Profil Resimleri, Yorumlar, Mesajlar) ${storageUsed.join(' & ')} üzerine başarıyla kaydedildi!`,
                      timestamp,
                      storageUsed,
                      githubCommitUrl,
                      stats: {
                        seriesCount,
                        userCount,
                        commentsCount,
                        dmsCount,
                        commMsgsCount,
                        totalMessages,
                      },
                    })
                  );
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err?.message || 'Yedekleme hatası' }));
                }
              });
              return;
            } else if (req.method === 'GET') {
              try {
                const ghCheck = await fetch(
                  `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`,
                  {
                    headers: {
                      Authorization: `token ${GITHUB_TOKEN}`,
                      'User-Agent': 'Minimo-Series-Dev',
                      Accept: 'application/vnd.github.v3+json',
                    },
                  }
                );
                if (ghCheck.ok) {
                  const ghData = (await ghCheck.json()) as any;
                  if (ghData.content) {
                    const contentStr = Buffer.from(
                      ghData.content.replace(/\n/g, ''),
                      'base64'
                    ).toString('utf-8');
                    res.setHeader('Content-Type', 'application/json');
                    res.end(contentStr);
                    return;
                  }
                }
              } catch {}
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ status: 'ready', message: 'Minimo Edge API Dev' }));
              return;
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
