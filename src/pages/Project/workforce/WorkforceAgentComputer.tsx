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

import Folder from '@/components/Folder';
import Terminal from '@/components/Terminal';
import useChatStoreAdapter from '@/hooks/useChatStoreAdapter';
import { TaskStatus } from '@/types/constants';

type WorkforceAgentComputerProps = {
  agent: Agent;
  agentType: AgentNameType;
};

export function WorkforceAgentComputer({
  agent,
  agentType,
}: WorkforceAgentComputerProps) {
  const { chatStore } = useChatStoreAdapter();
  const browserImages = (agent.activeWebviewIds || [])
    .filter((img) => img?.img)
    .slice(0, 4);
  const browserImageGridClass =
    browserImages.length === 1
      ? 'grid-cols-1 grid-rows-1'
      : browserImages.length === 2
        ? 'grid-cols-2 grid-rows-1'
        : 'grid-cols-2 grid-rows-2';
  const browserPlaceholderCount =
    browserImages.length >= 3 ? Math.max(0, 4 - browserImages.length) : 0;

  const terminalTasks = (agent.tasks || [])
    .filter((task) => task.terminal && task.terminal.length > 0)
    .slice(0, 4);
  const terminalGridClass =
    terminalTasks.length === 1
      ? 'grid-cols-1 grid-rows-1'
      : terminalTasks.length === 2
        ? 'grid-cols-2 grid-rows-1'
        : 'grid-cols-2 grid-rows-2';
  const terminalPlaceholderCount =
    terminalTasks.length >= 3 ? Math.max(0, 4 - terminalTasks.length) : 0;

  const onOpenFullWorkspace = () => {
    if (!chatStore) return;
    chatStore.setActiveWorkspace(
      chatStore.activeTaskId as string,
      agent.agent_id as string
    );
    window.electronAPI.hideAllWebview();
  };

  return (
    <div
      className="border-border-secondary bg-worker-surface-primary rounded-2xl border border-solid"
      onClick={onOpenFullWorkspace}
      role="presentation"
    >
      <div className="p-2 max-h-[min(360px,40vh)] min-h-[220px] w-full overflow-hidden">
        {browserImages.length > 0 && (
          <div
            className={`gap-1 rounded-xl grid h-[min(320px,38vh)] w-full overflow-hidden ${browserImageGridClass}`}
          >
            {browserImages.map((img, index) => (
              <div
                key={`${img.img}-${index}`}
                className="rounded-lg relative h-full w-full cursor-pointer overflow-hidden"
              >
                <img
                  className="left-0 top-0 absolute h-[250%] w-[250%] origin-top-left scale-[0.4] object-cover"
                  src={img.img}
                  alt={agentType}
                />
              </div>
            ))}
            {Array.from({ length: browserPlaceholderCount }).map((_, index) => (
              <div
                key={`browser-placeholder-${index}`}
                className="rounded-sm bg-surface-primary h-full w-full"
              />
            ))}
          </div>
        )}
        {agentType === 'document_agent' &&
          agent.tasks &&
          agent.tasks.length > 0 && (
            <div className="rounded-lg relative h-[min(320px,38vh)] w-full cursor-pointer overflow-hidden">
              <div className="left-0 top-0 absolute h-[500px] w-[900px] origin-top-left scale-[0.36]">
                <Folder data={agent} />
              </div>
            </div>
          )}
        {agentType === 'developer_agent' && terminalTasks.length > 0 && (
          <div
            className={`gap-1 rounded-xl grid h-[min(320px,38vh)] w-full overflow-hidden ${terminalGridClass}`}
          >
            {terminalTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg relative h-full w-full cursor-pointer overflow-hidden object-cover"
              >
                <div className="left-0 top-0 absolute h-[250%] w-[250%] origin-top-left scale-[0.4]">
                  <Terminal content={task.terminal} />
                </div>
              </div>
            ))}
            {Array.from({ length: terminalPlaceholderCount }).map(
              (_, index) => (
                <div
                  key={`terminal-placeholder-${index}`}
                  className="rounded-lg bg-surface-primary h-full w-full"
                />
              )
            )}
          </div>
        )}
        {browserImages.length === 0 &&
          !(
            agentType === 'document_agent' &&
            agent.tasks &&
            agent.tasks.length > 0
          ) &&
          !(agentType === 'developer_agent' && terminalTasks.length > 0) && (
            <div className="text-text-label rounded-xl bg-surface-tertiary px-4 text-body-sm flex h-[min(200px,28vh)] w-full items-center justify-center text-center">
              {agent.tasks?.some(
                (t) =>
                  t.status !== TaskStatus.COMPLETED &&
                  t.status !== TaskStatus.FAILED &&
                  !t.reAssignTo
              )
                ? 'Live preview will appear when the agent updates the workspace.'
                : 'No preview yet for this agent.'}
            </div>
          )}
      </div>
    </div>
  );
}
