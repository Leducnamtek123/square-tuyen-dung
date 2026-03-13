import os
import json

base_dir = "c:/Users/leduc/Documents/square-tuyen-dung/frontend/src/i18n"
locales_dir = os.path.join(base_dir, "locales")

domains = [
    "common",
    "admin",
    "employer",
    "jobSeeker",
    "auth",
    "public",
    "errors",
    "chat",
    "candidate",
    "interview"
]

languages = ["en", "vi"]

# Create directories and files
for lang in languages:
    lang_dir = os.path.join(locales_dir, lang)
    os.makedirs(lang_dir, exist_ok=True)
    
    for domain in domains:
        file_path = os.path.join(lang_dir, f"{domain}.json")
        if not os.path.exists(file_path):
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump({}, f, ensure_ascii=False, indent=2)

# Generate index.js
index_js_content = f"""import i18n from 'i18next';
import {{ initReactI18next }} from 'react-i18next';

// English
{chr(10).join(f"import en_{domain} from './locales/en/{domain}.json';" for domain in domains)}

// Vietnamese
{chr(10).join(f"import vi_{domain} from './locales/vi/{domain}.json';" for domain in domains)}

const resources = {{
  en: {{
    {chr(10).join(f"    {domain}: en_{domain}," for domain in domains)}
  }},
  vi: {{
    {chr(10).join(f"    {domain}: vi_{domain}," for domain in domains)}
  }}
}};

i18n.use(initReactI18next).init({{
  resources,
  lng: 'vi', // default language
  fallbackLng: 'en',
  ns: {json.dumps(domains)},
  defaultNS: 'common',
  interpolation: {{
    escapeValue: false, // react already safes from xss
  }},
  returnNull: false,
}});

export default i18n;
"""

with open(os.path.join(base_dir, "index.js"), "w", encoding="utf-8") as f:
    f.write(index_js_content)

print("Scaffolded i18n successfully.")
