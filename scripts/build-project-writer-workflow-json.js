/**
 * Build Alec Project Writer (7).json from (6) + image branch upgrades.
 * Run: node scripts/build-project-writer-workflow-json.js
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const SOURCE = fs.existsSync(path.join(ROOT, 'Alec Project Writer (6).json'))
  ? path.join(ROOT, 'Alec Project Writer (6).json')
  : path.join(ROOT, 'Alec Project Writer (7).json');
const OUTPUT = path.join(ROOT, 'Alec Project Writer (7).json');

function readCode(filename) {
  return fs.readFileSync(path.join(ROOT, 'docs', filename), 'utf8');
}

function uuid() {
  return crypto.randomUUID();
}

function cloneSheetGetNode(baseNode, id, name, position, lookupExpression) {
  const node = JSON.parse(JSON.stringify(baseNode));
  node.id = id;
  node.name = name;
  node.position = position;
  node.parameters.filtersUI.values[0].lookupValue = lookupExpression;
  return node;
}

const wf = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
wf.name = 'Alec Project Writer (7)';

// --- Disable video branch nodes ---
const videoNodes = [
  'Upload a video1',
  'Download Pexels Video',
  'Video text',
  'Youtube Text1',
  'Youtube Link1',
];
for (const node of wf.nodes) {
  if (videoNodes.includes(node.name)) {
    node.disabled = true;
  }
}

// --- Prepare image for GitHub1 ---
const prepareImageNode = wf.nodes.find((n) => n.name === 'Prepare image for GitHub1');
prepareImageNode.parameters.jsCode = readCode('n8n-prepare-image-for-github.js');

// --- Prepare HTML: dual project source for AI publish path ---
const prepareHtmlNode = wf.nodes.find((n) => n.name === 'Prepare HTML for GitHub');
prepareHtmlNode.parameters.jsCode = prepareHtmlNode.parameters.jsCode.replace(
  "const projectData = $('Get Project for photo').first().json;",
  `function getProjectRowForHtml() {
  try {
    const manual = $('Get Project for photo').first();
    if (manual?.json?.project_id) return manual.json;
  } catch (e) {}
  try {
    const ai = $('Get Project for AI publish').first();
    if (ai?.json?.project_id) return ai.json;
  } catch (e) {}
  throw new Error('Project row not found from Get Project for photo or Get Project for AI publish.');
}
const projectData = getProjectRowForHtml();`
);

// --- Switch callback router ---
const switchNode = wf.nodes.find((n) => n.name === 'Switch');
switchNode.parameters.rules.values = [
  {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
      conditions: [
        {
          leftValue: "={{ $('Telegram Trigger1').item.json.callback_query.data }}",
          rightValue: 'image-pexels-yes_',
          operator: { type: 'string', operation: 'startsWith' },
          id: uuid(),
        },
      ],
      combinator: 'and',
    },
    renameOutput: true,
    outputKey: 'Pexels',
  },
  {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
      conditions: [
        {
          leftValue: "={{ $('Telegram Trigger1').item.json.callback_query.data }}",
          rightValue: 'image-pexels-yes',
          operator: { type: 'string', operation: 'equals' },
          id: uuid(),
        },
      ],
      combinator: 'and',
    },
    renameOutput: true,
    outputKey: 'Pexels legacy',
  },
  {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
      conditions: [
        {
          leftValue: "={{ $('Telegram Trigger1').item.json.callback_query.data }}",
          rightValue: 'img-openai-use_',
          operator: { type: 'string', operation: 'startsWith' },
          id: uuid(),
        },
      ],
      combinator: 'and',
    },
    renameOutput: true,
    outputKey: 'OpenAI use',
  },
  {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
      conditions: [
        {
          leftValue: "={{ $('Telegram Trigger1').item.json.callback_query.data }}",
          rightValue: 'img-openai_',
          operator: { type: 'string', operation: 'startsWith' },
          id: uuid(),
        },
      ],
      combinator: 'and',
    },
    renameOutput: true,
    outputKey: 'OpenAI generate',
  },
  {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
      conditions: [
        {
          leftValue: "={{ $('Telegram Trigger1').item.json.callback_query.data }}",
          rightValue: 'img-manual_',
          operator: { type: 'string', operation: 'startsWith' },
          id: uuid(),
        },
      ],
      combinator: 'and',
    },
    renameOutput: true,
    outputKey: 'Manual photo',
  },
  {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 3 },
      conditions: [
        {
          leftValue: "={{ $('Telegram Trigger1').item.json.callback_query.data }}",
          rightValue: 'confirm_',
          operator: { type: 'string', operation: 'startsWith' },
          id: uuid(),
        },
      ],
      combinator: 'and',
    },
    renameOutput: true,
    outputKey: 'Confirm',
  },
];

const getProject1 = wf.nodes.find((n) => n.name === 'Get Project1');
const telegramCreds = wf.nodes.find((n) => n.name === 'Send Ask Image1').credentials;

const newNodes = [
  {
    parameters: {
      chatId:
        '={{ $if($("Telegram Trigger1").isExecuted, $("Telegram Trigger1").item.json.message?.from?.id || $("Telegram Trigger1").item.json.callback_query?.from?.id, "") }}',
      text: '=Project ID: {{ $json.project_id }}\n\n*{{ $json.project_title }}*\n\nTags (for Pexels):\n{{ $json.tags }}\n\nChoose a cover image:',
      replyMarkup: 'inlineKeyboard',
      inlineKeyboard: {
        rows: [
          {
            row: {
              buttons: [
                {
                  text: 'Upload my photo',
                  additionalFields: { callback_data: '=img-manual_{{ $json.project_id }}' },
                },
              ],
            },
          },
          {
            row: {
              buttons: [
                {
                  text: 'Pexels stock',
                  additionalFields: { callback_data: '=image-pexels-yes_{{ $json.project_id }}' },
                },
              ],
            },
          },
          {
            row: {
              buttons: [
                {
                  text: 'AI generate',
                  additionalFields: { callback_data: '=img-openai_{{ $json.project_id }}' },
                },
              ],
            },
          },
        ],
      },
      additionalFields: { appendAttribution: false },
    },
    type: 'n8n-nodes-base.telegram',
    typeVersion: 1.2,
    position: [1152, 368],
    id: uuid(),
    name: 'Send Image Source Menu',
    credentials: telegramCreds,
  },
  cloneSheetGetNode(
    getProject1,
    uuid(),
    'Get Project for manual photo',
    [704, 480],
    "={{ $('Telegram Trigger1').item.json.callback_query.data.replace('img-manual_', '') }}"
  ),
  cloneSheetGetNode(
    getProject1,
    uuid(),
    'Get Project for Pexels',
    [704, 80],
    "={{ $('Telegram Trigger1').item.json.callback_query.data.replace('image-pexels-yes_', '') }}"
  ),
  cloneSheetGetNode(
    getProject1,
    uuid(),
    'Get Project for OpenAI',
    [704, 240],
    "={{ $('Telegram Trigger1').item.json.callback_query.data.replace('img-openai_', '') }}"
  ),
  cloneSheetGetNode(
    getProject1,
    uuid(),
    'Get Project for AI publish',
    [464, 720],
    "={{ $('Telegram Trigger1').item.json.callback_query.data.replace('img-openai-use_', '') }}"
  ),
  {
    parameters: { jsCode: readCode('n8n-prepare-pexels-tags.js') },
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [928, 80],
    id: uuid(),
    name: 'Prepare Pexels tags',
  },
  {
    parameters: {
      chatId: "={{ $('Telegram Trigger1').item.json.callback_query.from.id }}",
      text: "=Project ID: {{ $json.project_id }}\n\nSearching Pexels for:\n{{ Array.isArray($json.tags) ? $json.tags.join(', ') : $json.tags }}\n\nWhen you receive image options, pick one and *reply to this message* with that photo.",
      replyMarkup: 'forceReply',
      forceReply: { force_reply: true },
      additionalFields: { appendAttribution: false },
    },
    type: 'n8n-nodes-base.telegram',
    typeVersion: 1.2,
    position: [1152, 80],
    id: uuid(),
    name: 'Send Pexels pick hint',
    credentials: telegramCreds,
  },
  {
    parameters: { jsCode: readCode('n8n-build-openai-image-prompt.js') },
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [928, 240],
    id: uuid(),
    name: 'Build OpenAI image prompt',
  },
  {
    parameters: {
      resource: 'image',
      operation: 'generate',
      modelId: {
        __rl: true,
        mode: 'list',
        value: 'gpt-image-1-mini',
      },
      prompt: '={{ $json.image_prompt }}',
      options: {
        size: '1536x1024',
        quality: 'medium',
      },
    },
    type: '@n8n/n8n-nodes-langchain.openAi',
    typeVersion: 2.3,
    position: [1152, 240],
    id: uuid(),
    name: 'Generate an image',
    credentials: {
      openAiApi: {
        id: 'kQILD8OnuaQsXV0d',
        name: 'OpenAi account',
      },
    },
  },
  {
    parameters: { jsCode: readCode('n8n-cache-ai-image-preview.js') },
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [1376, 240],
    id: uuid(),
    name: 'Cache AI image for preview',
  },
  {
    parameters: {
      operation: 'sendPhoto',
      chatId: "={{ $('Telegram Trigger1').item.json.callback_query.from.id }}",
      binaryData: true,
      binaryPropertyName: 'data',
      replyMarkup: 'inlineKeyboard',
      inlineKeyboard: {
        rows: [
          {
            row: {
              buttons: [
                {
                  text: 'Use this image',
                  additionalFields: { callback_data: '=img-openai-use_{{ $json.project_id }}' },
                },
              ],
            },
          },
          {
            row: {
              buttons: [
                {
                  text: 'Regenerate',
                  additionalFields: { callback_data: '=img-openai_{{ $json.project_id }}' },
                },
              ],
            },
          },
        ],
      },
      additionalFields: {
        appendAttribution: false,
        caption:
          '=AI cover preview for *{{ $json.project_title }}*\n\nProject ID: {{ $json.project_id }}\n\nUse this image or regenerate?',
      },
    },
    type: 'n8n-nodes-base.telegram',
    typeVersion: 1.2,
    position: [1600, 240],
    id: uuid(),
    name: 'Send AI image preview',
    credentials: telegramCreds,
  },
  {
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
        conditions: [
          {
            id: uuid(),
            leftValue: "={{ $('Telegram Trigger1').item.json.callback_query.data }}",
            rightValue: 'img-openai-use_',
            operator: { type: 'string', operation: 'startsWith' },
          },
        ],
        combinator: 'and',
      },
      options: {},
    },
    type: 'n8n-nodes-base.if',
    typeVersion: 2.2,
    position: [1264, 320],
    id: uuid(),
    name: 'Route AI image',
  },
];

wf.nodes.push(...newNodes);

// n8n import expects the same envelope as a normal export from (6).
wf.pinData = wf.pinData || {};
wf.id = uuid();
wf.versionId = uuid();
wf.active = false;

// --- Connections ---
const c = wf.connections;

c['Append image link1'].main[0] = [{ node: 'Send Image Source Menu', type: 'main', index: 0 }];

c.Switch.main = [
  [{ node: 'Get Project for Pexels', type: 'main', index: 0 }],
  [{ node: 'Wait', type: 'main', index: 0 }],
  [{ node: 'Get Project for AI publish', type: 'main', index: 0 }],
  [{ node: 'Get Project for OpenAI', type: 'main', index: 0 }],
  [{ node: 'Get Project for manual photo', type: 'main', index: 0 }],
  [{ node: 'Get Project1', type: 'main', index: 0 }],
];

c['Get Project for manual photo'] = {
  main: [[{ node: 'Send Ask Image1', type: 'main', index: 0 }]],
};
c['Get Project for Pexels'] = {
  main: [[{ node: 'Prepare Pexels tags', type: 'main', index: 0 }]],
};
c['Prepare Pexels tags'] = {
  main: [[{ node: 'Send Pexels pick hint', type: 'main', index: 0 }]],
};
c['Send Pexels pick hint'] = {
  main: [[{ node: 'Call Alec Project Writer Serch in PEXELS1', type: 'main', index: 0 }]],
};
c['Get Project for OpenAI'] = {
  main: [[{ node: 'Build OpenAI image prompt', type: 'main', index: 0 }]],
};
c['Build OpenAI image prompt'] = {
  main: [[{ node: 'Generate an image', type: 'main', index: 0 }]],
};
c['Generate an image'] = {
  main: [[{ node: 'Route AI image', type: 'main', index: 0 }]],
};
c['Route AI image'] = {
  main: [
    [{ node: 'Prepare image for GitHub1', type: 'main', index: 0 }],
    [{ node: 'Cache AI image for preview', type: 'main', index: 0 }],
  ],
};
c['Cache AI image for preview'] = {
  main: [[{ node: 'Send AI image preview', type: 'main', index: 0 }]],
};
c['Send AI image preview'] = { main: [[]] };
c['Get Project for AI publish'] = {
  main: [[{ node: 'Build OpenAI image prompt', type: 'main', index: 0 }]],
};

c['Send Image Source Menu'] = { main: [[]] };

// --- Cover image upsert (GitHub requires sha when file already exists) ---
const uploadImageNode = wf.nodes.find((n) => n.name === 'Upload image1');
const getProjectsJsonNode = wf.nodes.find((n) => n.name === 'Get projects.json');

const getCoverShaNode = JSON.parse(JSON.stringify(getProjectsJsonNode));
getCoverShaNode.id = uuid();
getCoverShaNode.name = 'Get cover image sha';
getCoverShaNode.position = [776, uploadImageNode.position[1]];
getCoverShaNode.parameters.operation = 'get';
getCoverShaNode.parameters.filePath = '=projects/{{ $json.slug }}.jpg';
getCoverShaNode.onError = 'continueRegularOutput';
delete getCoverShaNode.webhookId;

const attachShaNode = {
  parameters: { jsCode: readCode('n8n-attach-cover-image-sha.js') },
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [880, uploadImageNode.position[1]],
  id: uuid(),
  name: 'Attach cover image sha',
};

const routeCoverNode = {
  parameters: {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
      conditions: [
        {
          id: uuid(),
          leftValue: '={{ $json.file_sha }}',
          rightValue: '',
          operator: { type: 'string', operation: 'notEmpty' },
        },
      ],
      combinator: 'and',
    },
    options: {},
  },
  type: 'n8n-nodes-base.if',
  typeVersion: 2.2,
  position: [984, uploadImageNode.position[1]],
  id: uuid(),
  name: 'Route cover image upload',
};

const uploadEditNode = JSON.parse(JSON.stringify(uploadImageNode));
uploadEditNode.id = uuid();
uploadEditNode.name = 'Upload cover image edit';
uploadEditNode.position = [1188, uploadImageNode.position[1] - 48];
uploadEditNode.parameters.operation = 'edit';

uploadImageNode.name = 'Upload cover image create';
uploadImageNode.position = [1188, uploadImageNode.position[1] + 48];
uploadImageNode.parameters.operation = 'create';

wf.nodes.push(getCoverShaNode, attachShaNode, routeCoverNode, uploadEditNode);

c['Prepare image for GitHub1'] = {
  main: [[{ node: 'Get cover image sha', type: 'main', index: 0 }]],
};
c['Get cover image sha'] = {
  main: [[{ node: 'Attach cover image sha', type: 'main', index: 0 }]],
};
c['Attach cover image sha'] = {
  main: [[{ node: 'Route cover image upload', type: 'main', index: 0 }]],
};
c['Route cover image upload'] = {
  main: [
    [{ node: 'Upload cover image edit', type: 'main', index: 0 }],
    [{ node: 'Upload cover image create', type: 'main', index: 0 }],
  ],
};
c['Upload cover image create'] = {
  main: [[{ node: 'Prepare HTML for GitHub', type: 'main', index: 0 }]],
};
c['Upload cover image edit'] = {
  main: [[{ node: 'Prepare HTML for GitHub', type: 'main', index: 0 }]],
};
delete c['Upload image1'];

fs.writeFileSync(OUTPUT, JSON.stringify(wf, null, 2) + '\n', 'utf8');
console.log('Wrote', OUTPUT);
console.log('Nodes:', wf.nodes.length);
console.log('');
console.log('IMPORT THIS FILE IN n8n (not the .js script):');
console.log(' ', path.basename(OUTPUT));
console.log('');
console.log('Build command: node scripts/build-project-writer-workflow-json.js');
console.log('');
console.log('After import:');
console.log('1. Check node "Generate an image" — credential OpenAi account, model gpt-image-1-mini.');
console.log('2. Deactivate "Alec Project Writer (6)" before activating (7).');
console.log('3. Subworkflow "Send Images and Video" — remove video buttons manually.');
