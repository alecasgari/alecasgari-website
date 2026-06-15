/**
 * Build Alecasgrai-website-news.json with embedded n8n code from docs/*.js
 * Run: node scripts/build-blog-workflow-json.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function readCode(filename) {
  return fs.readFileSync(path.join(ROOT, 'docs', filename), 'utf8');
}

function codeNode(id, name, position, filename) {
  return {
    parameters: { jsCode: readCode(filename) },
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position,
    id,
    name,
  };
}

const AI_USER_PROMPT = `=Expand this LinkedIn post into a full SEO blog article in English.

Idea (includes reference article URLs):
{{ $json.idea }}

LinkedIn post text:
{{ $json.postContent }}

LinkedIn post URL (MUST appear in References section):
{{ $json.LinkedInURL }}

Primary source article URL (the article this post expands — use the main https link from postContent, or the first relevant article URL from idea):
{{ ($json.postContent.match(/https?:\\/\\/[^\\s]+/) || [])[0] || ($json.idea.match(/https?:\\/\\/[^\\s]+/) || [])[0] }}`;

const AI_SYSTEM_MESSAGE =
  'You are a professional English SEO content writer for Alec Asgari. Expand the LinkedIn post into an original, complete blog article in Markdown. Use ## for main sections and ### for subsections. Use bullet lists where helpful. Do NOT invent a featured image path. Do NOT output a publish date — the website sets that automatically from the LinkedIn post timestamp. REQUIRED OUTPUT RULES: 1) slug — URL-safe, no .html. 2) title, excerpt (1-2 sentences), category (Business, Marketing, Leadership, or Technology). 3) tags — 5-7 SEO phrases as array. 4) sourceArticleUrl — exact URL of the external source article from the input. 5) linkedinPostUrl — exact LinkedInURL from input, unchanged. 6) content — full article markdown starting with ## (never #). The article MUST end with a ## References section containing markdown links to BOTH sourceArticleUrl and linkedinPostUrl. Write in Alec\'s voice: practical, leadership and automation focused.';

const AI_SCHEMA_EXAMPLE = `{
  "slug": "ai-vision-leadership-strategy",
  "title": "AI Can Answer Questions — Leaders Must Find What Is Missing",
  "excerpt": "AI is efficient at solving known problems, but true leadership means identifying strategic gaps machines cannot see.",
  "category": "Leadership",
  "tags": ["AI leadership", "business strategy", "future of work"],
  "authorName": "Alec Asgari",
  "sourceArticleUrl": "https://www.europeanbusinessreview.com/ai-is-good-at-finding-answers-leaders-must-find-whats-missing/",
  "linkedinPostUrl": "https://www.linkedin.com/feed/update/urn:li:activity:1234567890/",
  "content": "## Why Answers Are Not Enough\\n\\n...\\n\\n## References\\n\\n- [AI Is Good at Finding Answers — Leaders Must Find What's Missing](https://www.europeanbusinessreview.com/ai-is-good-at-finding-answers-leaders-must-find-whats-missing/)\\n- [Original LinkedIn post by Alec Asgari](https://www.linkedin.com/feed/update/urn:li:activity:1234567890/)"
}`;

const workflow = {
  name: 'Alecasgrai-website-news',
  nodes: [
    {
      parameters: {},
      type: 'n8n-nodes-base.executeWorkflowTrigger',
      typeVersion: 1.1,
      position: [0, 160],
      id: 'e92e53a2-355d-4a22-a08f-86a57c56a691',
      name: 'When Called by LinkedIn Workflow',
    },
    {
      parameters: {
        rule: { interval: [{ triggerAtHour: 15 }] },
      },
      type: 'n8n-nodes-base.scheduleTrigger',
      typeVersion: 1.3,
      position: [0, 0],
      id: 'f92e53a2-355d-4a22-a08f-86a57c56a690',
      name: 'Schedule Trigger',
    },
    {
      parameters: {
        operation: 'get',
        dataTableId: {
          __rl: true,
          value: 'PoTjAci6tutyz60e',
          mode: 'list',
          cachedResultName: 'Alec LinkedIn Automation',
          cachedResultUrl: '/projects/b5aZbTLpIJQPOBLU/datatables/PoTjAci6tutyz60e',
        },
        filters: {
          conditions: [{ keyName: 'StatusWebsite', keyValue: 'Pending' }],
        },
        limit: 1,
      },
      type: 'n8n-nodes-base.dataTable',
      typeVersion: 1.1,
      position: [208, 0],
      id: '3ebdd87e-8932-4c67-9f84-aa2df91b3e50',
      name: 'Get row(s)',
    },
    {
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
          conditions: [
            {
              id: 'has-pending-row',
              leftValue: '={{ $json.id }}',
              rightValue: '',
              operator: { type: 'number', operation: 'exists', singleValue: true },
            },
          ],
          combinator: 'and',
        },
        options: {},
      },
      type: 'n8n-nodes-base.if',
      typeVersion: 2.2,
      position: [320, 0],
      id: 'c1d2e3f4-a5b6-7890-cdef-111122223333',
      name: 'Has Pending Row?',
    },
    {
      parameters: {
        promptType: 'define',
        text: AI_USER_PROMPT,
        hasOutputParser: true,
        options: {
          systemMessage: AI_SYSTEM_MESSAGE,
        },
      },
      type: '@n8n/n8n-nodes-langchain.agent',
      typeVersion: 3.1,
      position: [416, 0],
      id: '400952ef-9184-42cb-8e75-cedb070c962e',
      name: 'AI Agent',
    },
    {
      parameters: {
        jsonSchemaExample: AI_SCHEMA_EXAMPLE,
      },
      type: '@n8n/n8n-nodes-langchain.outputParserStructured',
      typeVersion: 1.3,
      position: [592, 208],
      id: 'edebfa04-01a7-4fa4-8db2-9723c9166536',
      name: 'Structured Output Parser',
    },
    {
      parameters: { modelName: 'models/gemini-flash-lite-latest', options: {} },
      type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
      typeVersion: 1.1,
      position: [272, 208],
      id: '78899849-341b-4d14-8b4b-7f3fc1e9fdcd',
      name: 'Google Gemini Chat Model',
      credentials: {
        googlePalmApi: { id: 'Ch0TqKEZFBkZpqUH', name: 'Google Gemini(PaLM) Api account' },
      },
    },
    codeNode('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Normalize Blog Data', [624, 0], 'n8n-normalize-blog-data.js'),
    {
      parameters: {
        dataTableId: {
          __rl: true,
          value: 'omroE3fdUwu4SW1t',
          mode: 'list',
          cachedResultName: 'alecasgari-website-blog-posts',
          cachedResultUrl: '/projects/b5aZbTLpIJQPOBLU/datatables/omroE3fdUwu4SW1t',
        },
        columns: {
          mappingMode: 'defineBelow',
          value: {
            title: "={{ $('Normalize Blog Data').item.json.output.title }}",
            slug: "={{ $('Normalize Blog Data').item.json.output.slug }}",
            excerpt: "={{ $('Normalize Blog Data').item.json.output.excerpt }}",
            category: "={{ $('Normalize Blog Data').item.json.output.category }}",
            date: "={{ $('Normalize Blog Data').item.json.output.date }}",
            featured_image: "={{ $('Normalize Blog Data').item.json.featured_image }}",
            content: "={{ $('Normalize Blog Data').item.json.output.content }}",
            tags: "={{ $('Normalize Blog Data').item.json.tags_json }}",
            meta_description: "={{ $('Normalize Blog Data').item.json.output.excerpt }}",
            status: 'pending',
            linkedin_row_id: "={{ $('Normalize Blog Data').item.json.linkedin_row_id }}",
          },
          matchingColumns: [],
          schema: [
            { id: 'title', displayName: 'title', type: 'string', display: true, required: false, defaultMatch: false, readOnly: false, removed: false },
            { id: 'slug', displayName: 'slug', type: 'string', display: true, required: false, defaultMatch: false, readOnly: false, removed: false },
            { id: 'excerpt', displayName: 'excerpt', type: 'string', display: true, required: false, defaultMatch: false, readOnly: false, removed: false },
            { id: 'category', displayName: 'category', type: 'string', display: true, required: false, defaultMatch: false, readOnly: false, removed: false },
            { id: 'date', displayName: 'date', type: 'dateTime', display: true, required: false, defaultMatch: false, readOnly: false, removed: false },
            { id: 'content', displayName: 'content', type: 'string', display: true, required: false, defaultMatch: false, readOnly: false, removed: false },
            { id: 'featured_image', displayName: 'featured_image', type: 'string', display: true, required: false, defaultMatch: false, readOnly: false, removed: false },
            { id: 'tags', displayName: 'tags', type: 'string', display: true, required: false, defaultMatch: false, readOnly: false, removed: false },
            { id: 'meta_description', displayName: 'meta_description', type: 'string', display: true, required: false, defaultMatch: false, readOnly: false, removed: false },
            { id: 'status', displayName: 'status', type: 'string', display: true, required: false, defaultMatch: false, readOnly: false, removed: false },
            { id: 'linkedin_row_id', displayName: 'linkedin_row_id', type: 'number', display: true, required: false, defaultMatch: false, readOnly: false, removed: false },
          ],
          attemptToConvertTypes: false,
          convertFieldsToString: false,
        },
        options: {},
      },
      type: 'n8n-nodes-base.dataTable',
      typeVersion: 1.1,
      position: [832, 0],
      id: '7ac6b9b5-5150-49f3-8243-7cfad2c4d421',
      name: 'Insert row',
    },
    {
      parameters: {
        url: "={{ $('Normalize Blog Data').item.json.imageLink }}",
        options: { response: { response: { responseFormat: 'file' } } },
      },
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position: [1040, 0],
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      name: 'Download Featured Image',
    },
    codeNode('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Prepare Blog Image for GitHub', [1248, 0], 'n8n-prepare-blog-image.js'),
    {
      parameters: {
        resource: 'file',
        owner: { __rl: true, value: 'alecasgari', mode: 'list', cachedResultName: 'alecasgari', cachedResultUrl: 'https://github.com/alecasgari' },
        repository: { __rl: true, value: 'alecasgari-website', mode: 'list', cachedResultName: 'alecasgari-website', cachedResultUrl: 'https://github.com/alecasgari/alecasgari-website' },
        filePath: '=images/blog/{{ $json.slug }}.jpg',
        fileContent: "={{ $('Prepare Blog Image for GitHub').first().json.base64_image }}",
        commitMessage: "=Upload blog featured image {{ $('Prepare Blog Image for GitHub').first().json.slug }}",
      },
      type: 'n8n-nodes-base.github',
      typeVersion: 1.1,
      position: [1456, 0],
      id: 'd4e5f6a7-b8c9-0123-def0-234567890123',
      name: 'Upload Blog Image',
      credentials: { githubApi: { id: 'BEgFUtA5fFbIXcNj', name: 'GitHub account' } },
    },
    codeNode('e5f6a7b8-c9d0-1234-ef01-345678901234', 'Prepare Blog HTML for GitHub', [1664, 0], 'n8n-prepare-blog-html.js'),
    {
      parameters: {
        resource: 'file',
        owner: { __rl: true, value: 'alecasgari', mode: 'list', cachedResultName: 'alecasgari', cachedResultUrl: 'https://github.com/alecasgari' },
        repository: { __rl: true, value: 'alecasgari-website', mode: 'list', cachedResultName: 'alecasgari-website', cachedResultUrl: 'https://github.com/alecasgari/alecasgari-website' },
        filePath: "=blog/{{ $('Prepare Blog HTML for GitHub').first().json.slug }}.html",
        fileContent: "={{ $('Prepare Blog HTML for GitHub').first().json.base64_html }}",
        commitMessage: "=Auto-publish blog post {{ $('Prepare Blog HTML for GitHub').first().json.slug }}",
      },
      type: 'n8n-nodes-base.github',
      typeVersion: 1.1,
      position: [1872, 0],
      id: 'f6a7b8c9-d0e1-2345-f012-456789012345',
      name: 'Upload Blog HTML',
      credentials: { githubApi: { id: 'BEgFUtA5fFbIXcNj', name: 'GitHub account' } },
    },
    {
      parameters: {
        resource: 'file',
        operation: 'get',
        owner: { __rl: true, value: 'alecasgari', mode: 'list', cachedResultName: 'alecasgari', cachedResultUrl: 'https://github.com/alecasgari' },
        repository: { __rl: true, value: 'alecasgari-website', mode: 'list', cachedResultName: 'alecasgari-website', cachedResultUrl: 'https://github.com/alecasgari/alecasgari-website' },
        filePath: '=data/blog.json',
        asBinaryProperty: false,
        additionalParameters: {},
      },
      type: 'n8n-nodes-base.github',
      typeVersion: 1.1,
      position: [2080, 0],
      id: 'a7b8c9d0-e1f2-3456-0123-567890123456',
      name: 'Get blog.json',
      credentials: { githubApi: { id: 'BEgFUtA5fFbIXcNj', name: 'GitHub account' } },
    },
    codeNode('b8c9d0e1-f2a3-4567-1234-678901234567', 'Merge blog JSON', [2288, 0], 'n8n-merge-blog-json.js'),
    {
      parameters: {
        resource: 'file',
        operation: 'edit',
        owner: { __rl: true, value: 'alecasgari', mode: 'list', cachedResultName: 'alecasgari', cachedResultUrl: 'https://github.com/alecasgari' },
        repository: { __rl: true, value: 'alecasgari-website', mode: 'list', cachedResultName: 'alecasgari-website', cachedResultUrl: 'https://github.com/alecasgari/alecasgari-website' },
        filePath: '=data/blog.json',
        fileContent: "={{ $('Merge blog JSON').first().json.base64_blog_json }}",
        commitMessage: "=Update blog.json for {{ $('Merge blog JSON').first().json.slug }}",
      },
      type: 'n8n-nodes-base.github',
      typeVersion: 1.1,
      position: [2496, 0],
      id: 'c9d0e1f2-a3b4-5678-2345-789012345678',
      name: 'Upload blog.json',
      credentials: { githubApi: { id: 'BEgFUtA5fFbIXcNj', name: 'GitHub account' } },
    },
    {
      parameters: {
        resource: 'file',
        operation: 'get',
        owner: { __rl: true, value: 'alecasgari', mode: 'list', cachedResultName: 'alecasgari', cachedResultUrl: 'https://github.com/alecasgari' },
        repository: { __rl: true, value: 'alecasgari-website', mode: 'list', cachedResultName: 'alecasgari-website', cachedResultUrl: 'https://github.com/alecasgari/alecasgari-website' },
        filePath: '=data/blog-content.json',
        asBinaryProperty: false,
        additionalParameters: {},
      },
      type: 'n8n-nodes-base.github',
      typeVersion: 1.1,
      position: [2704, 0],
      id: 'd0e1f2a3-b4c5-6789-3456-890123456789',
      name: 'Get blog-content.json',
      credentials: { githubApi: { id: 'BEgFUtA5fFbIXcNj', name: 'GitHub account' } },
    },
    codeNode('e1f2a3b4-c5d6-7890-4567-901234567890', 'Merge blog content JSON', [2912, 0], 'n8n-merge-blog-content-json.js'),
    {
      parameters: {
        resource: 'file',
        operation: 'edit',
        owner: { __rl: true, value: 'alecasgari', mode: 'list', cachedResultName: 'alecasgari', cachedResultUrl: 'https://github.com/alecasgari' },
        repository: { __rl: true, value: 'alecasgari-website', mode: 'list', cachedResultName: 'alecasgari-website', cachedResultUrl: 'https://github.com/alecasgari/alecasgari-website' },
        filePath: '=data/blog-content.json',
        fileContent: "={{ $('Merge blog content JSON').first().json.base64_blog_content_json }}",
        commitMessage: "=Update blog-content.json for {{ $('Merge blog content JSON').first().json.slug }}",
      },
      type: 'n8n-nodes-base.github',
      typeVersion: 1.1,
      position: [3120, 0],
      id: 'f2a3b4c5-d6e7-8901-5678-012345678901',
      name: 'Upload blog-content.json',
      credentials: { githubApi: { id: 'BEgFUtA5fFbIXcNj', name: 'GitHub account' } },
    },
    {
      parameters: {
        operation: 'update',
        dataTableId: {
          __rl: true,
          value: 'PoTjAci6tutyz60e',
          mode: 'list',
          cachedResultName: 'Alec LinkedIn Automation',
          cachedResultUrl: '/projects/b5aZbTLpIJQPOBLU/datatables/PoTjAci6tutyz60e',
        },
        filters: {
          conditions: [{ keyName: 'id', keyValue: "={{ $('Get row(s)').first().json.id }}" }],
        },
        columns: {
          mappingMode: 'defineBelow',
          value: { StatusWebsite: 'Published' },
          matchingColumns: [],
          schema: [
            { id: 'StatusWebsite', displayName: 'StatusWebsite', type: 'string', display: true, required: false, defaultMatch: false, readOnly: false, removed: false },
          ],
        },
        options: {},
      },
      type: 'n8n-nodes-base.dataTable',
      typeVersion: 1.1,
      position: [3328, 0],
      id: 'a3b4c5d6-e7f8-9012-6789-123456789012',
      name: 'Update LinkedIn Status',
    },
    {
      parameters: {
        operation: 'update',
        dataTableId: {
          __rl: true,
          value: 'omroE3fdUwu4SW1t',
          mode: 'list',
          cachedResultName: 'alecasgari-website-blog-posts',
          cachedResultUrl: '/projects/b5aZbTLpIJQPOBLU/datatables/omroE3fdUwu4SW1t',
        },
        filters: {
          conditions: [{ keyName: 'id', keyValue: "={{ $('Insert row').first().json.id }}" }],
        },
        columns: {
          mappingMode: 'defineBelow',
          value: { status: 'published' },
          matchingColumns: [],
          schema: [
            { id: 'status', displayName: 'status', type: 'string', display: true, required: false, defaultMatch: false, readOnly: false, removed: false },
          ],
        },
        options: {},
      },
      type: 'n8n-nodes-base.dataTable',
      typeVersion: 1.1,
      position: [3536, 0],
      id: 'b4c5d6e7-f8a9-0123-7890-234567890123',
      name: 'Update Blog Status',
    },
  ],
  connections: {
    'When Called by LinkedIn Workflow': { main: [[{ node: 'Get row(s)', type: 'main', index: 0 }]] },
    'Schedule Trigger': { main: [[{ node: 'Get row(s)', type: 'main', index: 0 }]] },
    'Get row(s)': { main: [[{ node: 'Has Pending Row?', type: 'main', index: 0 }]] },
    'Has Pending Row?': { main: [[{ node: 'AI Agent', type: 'main', index: 0 }], []] },
    'Structured Output Parser': { ai_outputParser: [[{ node: 'AI Agent', type: 'ai_outputParser', index: 0 }]] },
    'Google Gemini Chat Model': { ai_languageModel: [[{ node: 'AI Agent', type: 'ai_languageModel', index: 0 }]] },
    'AI Agent': { main: [[{ node: 'Normalize Blog Data', type: 'main', index: 0 }]] },
    'Normalize Blog Data': { main: [[{ node: 'Insert row', type: 'main', index: 0 }]] },
    'Insert row': { main: [[{ node: 'Download Featured Image', type: 'main', index: 0 }]] },
    'Download Featured Image': { main: [[{ node: 'Prepare Blog Image for GitHub', type: 'main', index: 0 }]] },
    'Prepare Blog Image for GitHub': { main: [[{ node: 'Upload Blog Image', type: 'main', index: 0 }]] },
    'Upload Blog Image': { main: [[{ node: 'Prepare Blog HTML for GitHub', type: 'main', index: 0 }]] },
    'Prepare Blog HTML for GitHub': { main: [[{ node: 'Upload Blog HTML', type: 'main', index: 0 }]] },
    'Upload Blog HTML': { main: [[{ node: 'Get blog.json', type: 'main', index: 0 }]] },
    'Get blog.json': { main: [[{ node: 'Merge blog JSON', type: 'main', index: 0 }]] },
    'Merge blog JSON': { main: [[{ node: 'Upload blog.json', type: 'main', index: 0 }]] },
    'Upload blog.json': { main: [[{ node: 'Get blog-content.json', type: 'main', index: 0 }]] },
    'Get blog-content.json': { main: [[{ node: 'Merge blog content JSON', type: 'main', index: 0 }]] },
    'Merge blog content JSON': { main: [[{ node: 'Upload blog-content.json', type: 'main', index: 0 }]] },
    'Upload blog-content.json': { main: [[{ node: 'Update LinkedIn Status', type: 'main', index: 0 }]] },
    'Update LinkedIn Status': { main: [[{ node: 'Update Blog Status', type: 'main', index: 0 }]] },
  },
  pinData: {},
  active: true,
  settings: { executionOrder: 'v1', binaryMode: 'separate' },
  versionId: 'f2600b5c-5d2e-4c25-b0fe-489635820751',
  meta: {
    templateCredsSetupCompleted: true,
    instanceId: 'a55157a0954f95a04f20b1e0e82243dda61031940e83e11c00d94baf8c58fe50',
  },
  id: 'oURBW02ng40sp6Dd',
  tags: [],
};

const outPath = path.join(ROOT, 'Alecasgrai-website-news.json');
fs.writeFileSync(outPath, JSON.stringify(workflow, null, 2), 'utf8');
console.log('Wrote', outPath, 'with', workflow.nodes.length, 'nodes');
