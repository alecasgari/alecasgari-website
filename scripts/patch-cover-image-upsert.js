/**
 * Patch Alec Project Writer (7).json — GitHub cover image upsert (sha).
 * Run: node scripts/patch-cover-image-upsert.js
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const WORKFLOW = path.join(ROOT, 'Alec Project Writer (7).json');

function readCode(filename) {
  return fs.readFileSync(path.join(ROOT, 'docs', filename), 'utf8');
}

function uuid() {
  return crypto.randomUUID();
}

const wf = JSON.parse(fs.readFileSync(WORKFLOW, 'utf8'));

if (wf.nodes.some((n) => n.name === 'Get cover image sha')) {
  console.log('Already patched — Get cover image sha exists.');
  process.exit(0);
}

const uploadImageNode = wf.nodes.find((n) => n.name === 'Upload image1');
if (!uploadImageNode) {
  throw new Error('Upload image1 node not found');
}

const getProjectsJsonNode = wf.nodes.find((n) => n.name === 'Get projects.json');
if (!getProjectsJsonNode) {
  throw new Error('Get projects.json node not found');
}

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

const c = wf.connections;
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

fs.writeFileSync(WORKFLOW, JSON.stringify(wf, null, 2) + '\n', 'utf8');
console.log('Patched', WORKFLOW);
