import os
import re

auth_files = [
    r'c:\laragon\www\TapCard\app\login\page.tsx',
    r'c:\laragon\www\TapCard\app\(auth)\register\page.tsx',
    r'c:\laragon\www\TapCard\app\forgot-password\page.tsx',
    r'c:\laragon\www\TapCard\app\reset-password\page.tsx'
]

# auth replacements
for file_path in auth_files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace the Link containing Card Setu text with Image logo
        pattern = r'<Link href="/" style={{.*?}}>\s*Card Setu\s*</Link>'
        replacement = '<Link href="/" style={{ display: \'flex\', justifyContent: \'center\' }}>\n              <img src="/logo-dark.png" alt="Card Setu Logo" style={{ height: \'48px\', width: \'auto\' }} />\n            </Link>'
        
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

# dashboard layout replacement
dash_layout = r'c:\laragon\www\TapCard\app\dashboard\layout.tsx'
if os.path.exists(dash_layout):
    with open(dash_layout, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pattern = r'<h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">\s*Card Setu\s*</h1>'
    replacement = '<img src="/logo-dark.png" alt="Card Setu Logo" className="h-8 w-auto" />'
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    with open(dash_layout, 'w', encoding='utf-8') as f:
        f.write(content)

print("Logo replacements completed successfully.")
