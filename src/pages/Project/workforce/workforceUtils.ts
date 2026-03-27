// ========= Copyright 2025-2026 @ Eigent.ai All Rights Reserved. =========
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ========= Copyright 2025-2026 @ Eigent.ai All Rights Reserved. =========

const agentToolkits: Record<string, string[]> = {
  developer_agent: [
    '# Terminal & Shell ',
    '# Web Deployment ',
    '# Screen Capture ',
  ],
  browser_agent: ['# Web Browser ', '# Search Engines '],
  multi_modal_agent: [
    '# Image Analysis ',
    '# Video Processing ',
    '# Audio Processing ',
    '# Image Generation ',
  ],
  document_agent: [
    '# File Management ',
    '# Data Processing ',
    '# Document Creation ',
  ],
};

export function getWorkforceToolkitLabels(agent: Agent | undefined): string[] {
  if (!agent) return ['No Toolkits'];
  const custom =
    agent.tools
      ?.map((tool) => (tool ? '# ' + String(tool).replace(/_/g, ' ') : ''))
      .filter(Boolean) || [];
  const defaults = agentToolkits[agent.type as keyof typeof agentToolkits];
  if (defaults?.length) return defaults;
  if (custom.length > 0) return custom;
  return ['No Toolkits'];
}

export function getWorkforceTaskIdLabel(taskId: string): string {
  const list = taskId.split('.');
  list.shift();
  return list
    .map((i, index) => Number(i) + (index === list.length - 1 ? '' : '.'))
    .join('');
}
