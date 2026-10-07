const http = require('http');

const pagesToAudit = [
  { path: '/', title: 'ResumeIQ AI', expectContent: 'ATS Resume Analyzer' },
  { path: '/login', title: 'Login', expectContent: 'Sign In' },
  { path: '/signup', title: 'Sign Up', expectContent: 'Create your account' },
  { path: '/dashboard', title: 'Dashboard', expectContent: 'Candidate Overview' },
  { path: '/analyze', title: 'Analyze', expectContent: 'Upload' },
  { path: '/resumes', title: 'Resumes', expectContent: 'My Resumes' },
  { path: '/tailor', title: 'Tailor', expectContent: 'Resume Tailor' },
  { path: '/editor', title: 'Editor', expectContent: 'Bullet Improver' },
  { path: '/cover-letter', title: 'Cover Letter', expectContent: 'Cover Letter' },
  { path: '/reports', title: 'Reports', expectContent: 'Reports' },
  { path: '/billing', title: 'Billing', expectContent: 'Subscription' },
  { path: '/pricing', title: 'Pricing', expectContent: 'Plans' },
  { path: '/settings', title: 'Settings', expectContent: 'Settings' },
  { path: '/recruiter', title: 'Recruiter', expectContent: 'Recruiter' },
  { path: '/copilot', title: 'AI Hiring Copilot', expectContent: 'AI Hiring Copilot' },
];

function fetchPage(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          length: data.length,
          isHtml: data.includes('<!DOCTYPE html>') || data.includes('<html'),
          hasNoCrash: !data.includes('Application error') && !data.includes('Internal Server Error'),
          bodySnippet: data.slice(0, 500)
        });
      });
    }).on('error', (err) => {
      resolve({ path, status: 0, error: err.message });
    });
  });
}

(async () => {
  console.log('==================================================');
  console.log('FRONTEND COMPREHENSIVE ROUTE AUDIT (localhost:3000)');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  for (const page of pagesToAudit) {
    const res = await fetchPage(page.path);
    const isOk = res.status === 200 && res.isHtml && res.hasNoCrash;
    
    if (isOk) {
      passed++;
      console.log(`  [OK] ${page.path.padEnd(16)} Status: ${res.status} | Bytes: ${res.length.toString().padStart(6)} | Verified HTML render`);
    } else {
      failed++;
      console.log(`  [X]  ${page.path.padEnd(16)} Status: ${res.status} | Error: ${res.error || 'Failed validation'}`);
    }
  }

  console.log('\n==================================================');
  console.log(`FRONTEND AUDIT: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) process.exit(1);
  process.exit(0);
})();
