import re

file_path = r'c:\laragon\www\TapCard\app\dashboard\cards\CardForm.tsx'

with open(file_path, 'r', encoding='utf-8') as file:
    content = file.read()

# Fix proprietor.name
content = content.replace('value={proprietor.name}', "value={proprietor.name || ''}")
# Fix proprietor.designation
content = content.replace('value={proprietor.designation}', "value={proprietor.designation || ''}")
# Fix proprietor.email
content = content.replace('value={proprietor.email}', "value={proprietor.email || ''}")
# Fix proprietor.phone
content = content.replace('value={proprietor.phone}', "value={proprietor.phone || ''}")
# Fix proprietor.whatsapp
content = content.replace('value={proprietor.whatsapp}', "value={proprietor.whatsapp || ''}")
# Fix proprietor.dob
content = content.replace('value={proprietor.dob}', "value={proprietor.dob || ''}")

with open(file_path, 'w', encoding='utf-8') as file:
    file.write(content)

print("Values updated successfully.")
