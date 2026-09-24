const { execSync } = require('child_process');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split('\n');
for (const line of env) {
  if (line.trim() && !line.startsWith('#') && line.includes('=')) {
    const key = line.split('=')[0];
    const val = line.substring(key.length + 1).replace(/^\"|\"$/g, '').trim();
    if (key === 'DATABASE_URL') continue; // already added
    console.log('Adding ' + key);
    try {
      execSync('npx vercel env add ' + key + ' production', {
        input: val,
        env: { ...process.env, NODE_OPTIONS: '--dns-result-order=ipv4first' }
      });
      console.log('Success for ' + key);
    } catch(e) { console.error(e.message); }
  }
}
