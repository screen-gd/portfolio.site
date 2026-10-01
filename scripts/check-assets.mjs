import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

// Workers Static Assets rejects individual files larger than 25 MiB.
async function checkAssets(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await checkAssets(path);
    else if ((await stat(path)).size > 25 * 1024 * 1024) {
      throw new Error(`${path} exceeds Cloudflare's 25 MiB asset limit.`);
    }
  }
}

await checkAssets('out');
console.log('All exported assets fit Cloudflare’s 25 MiB limit.');
