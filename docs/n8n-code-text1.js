// n8n Code node — نام: Code - Text1
// بعد از node «Analyze audio» — JSON parse + project_id + normalize category

let rawText = $input.first().json.candidates[0].content.parts[0].text;

if (rawText.includes('```')) {
  rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
}

const ALLOWED_CATEGORIES = [
  'AI Automation',
  'System Integration',
  'Web Development',
  'Marketing',
  'Graphic Design',
];

const CATEGORY_ALIASES = {
  'CRM Setup': 'System Integration',
  'Email Marketing': 'Marketing',
  'Data Migration': 'System Integration',
  Consulting: 'System Integration',
};

function normalizeCategory(value) {
  const category = String(value || '').trim();
  if (ALLOWED_CATEGORIES.includes(category)) return category;
  if (CATEGORY_ALIASES[category]) return CATEGORY_ALIASES[category];

  const lower = category.toLowerCase();
  const exactIgnoreCase = ALLOWED_CATEGORIES.find((item) => item.toLowerCase() === lower);
  if (exactIgnoreCase) return exactIgnoreCase;

  return 'System Integration';
}

try {
  const parsedData = JSON.parse(rawText);
  parsedData.project_id = Math.floor(1000000 + Math.random() * 9000000).toString();
  parsedData.category = normalizeCategory(parsedData.category);
  return parsedData;
} catch (error) {
  return { error: 'JSON format invalid', message: error.message, raw: rawText };
}
