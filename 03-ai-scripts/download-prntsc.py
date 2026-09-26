import urllib.request
import re
import os

import sys

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
if len(sys.argv) >= 3:
    urls = [(sys.argv[1], sys.argv[2])]
else:
    urls = [
        ('https://prnt.sc/H4MgqjNyxVSH', 'assets/screenshots/66-question-card-redesign-01.png')
    ]

os.makedirs('assets/screenshots', exist_ok=True)

for page_url, out_path in urls:
    try:
        req = urllib.request.Request(page_url, headers=headers)
        html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')
        m = re.search(r'<meta property="og:image" content="([^"]+)"', html)
        if not m:
            m = re.search(r'<img[^>]+src="([^"]+)"[^>]+class="[^"]*screenshot[^"]*"', html)
        if not m:
            m = re.search(r'https://image\.prntscr\.com/[^"\']+', html)
        if m:
            img_url = m.group(1) if hasattr(m, 'group') and m.lastindex else m.group(0)
            print(f'Found image: {img_url} for {page_url}')
            img_req = urllib.request.Request(img_url, headers=headers)
            with urllib.request.urlopen(img_req, timeout=15) as resp, open(out_path, 'wb') as f:
                f.write(resp.read())
            print(f'Saved to {out_path} ({os.path.getsize(out_path)} bytes)')
        else:
            print(f'No image regex match for {page_url}')
    except Exception as e:
        print(f'Error fetching {page_url}: {e}')
