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
import Workflow from '@/components/WorkFlow';
import { Button } from '@/components/ui/button';
import useChatStoreAdapter from '@/hooks/useChatStoreAdapter';
import { cn } from '@/lib/utils';
import { useWorkerList } from '@/store/authStore';
import { ChatTaskStatus, TaskStatus } from '@/types/constants';
import { Code2, LayoutGrid } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { useTranslation } from 'react-i18next';
import { WorkforceAgentComputer } from './WorkforceAgentComputer';
import { WorkforceAgentStripCard } from './WorkforceAgentStripCard';
import { WorkforceSubtaskList } from './WorkforceSubtaskList';
import { WorkforceTaskLogs } from './WorkforceTaskLogs';

export type WorkforceProjectWorkspaceProps = {
  headerActions?: ReactNode;
  fileInputRef?:
    | RefObject<HTMLInputElement | null>
    | RefObject<HTMLInputElement>;
  onFileUpload?: (event: ChangeEvent<HTMLInputElement>) => void;
  isChatBoxVisible: boolean;
};

type DetailTab = 'subtasks' | 'logs';

const ALLOWED_AGENT_TYPES: AgentNameType[] = [
  'developer_agent',
  'browser_agent',
  'document_agent',
  'multi_modal_agent',
];

function isStripAgentDisabled(agent: Agent): boolean {
  return (
    !ALLOWED_AGENT_TYPES.includes(agent.type as AgentNameType) ||
    (agent.tasks?.length ?? 0) === 0
  );
}

function resolveAgentForWorkspace(
  activeWorkspace: string | null | undefined,
  taskAssigning: Agent[] | undefined
): Agent | null {
  if (
    activeWorkspace == null ||
    activeWorkspace === '' ||
    !taskAssigning?.length
  )
    return null;
  if (activeWorkspace === 'documentWorkSpace') {
    return taskAssigning.find((a) => a.type === 'document_agent') ?? null;
  }
  return taskAssigning.find((a) => a.agent_id === activeWorkspace) ?? null;
}

function workspaceAgentCardSelected(
  activeWorkspace: string | null | undefined,
  agent: Agent
): boolean {
  if (activeWorkspace === 'documentWorkSpace') {
    return agent.type === 'document_agent';
  }
  return activeWorkspace === agent.agent_id;
}

export function WorkforceProjectWorkspace({
  headerActions,
  fileInputRef,
  onFileUpload,
  isChatBoxVisible,
}: WorkforceProjectWorkspaceProps) {
  const { t } = useTranslation();
  const { chatStore } = useChatStoreAdapter();
  const workerList = useWorkerList();

  const [detailTab, setDetailTab] = useState<DetailTab>('subtasks');
  const [selectedTask, setSelectedTask] = useState<TaskInfo | null>(null);

  const activeTaskId = chatStore?.activeTaskId as string | undefined;
  const activeTask = activeTaskId ? chatStore?.tasks?.[activeTaskId] : null;
  const taskAssigning = activeTask?.taskAssigning;
  const activeWorkspace = activeTask?.activeWorkspace;

  const assignedAgents = useMemo(() => taskAssigning || [], [taskAssigning]);

  /** Chat open + task running / paused / finished: horizontal strip + agent content below. Pending stays vertical-only. */
  const isChatWorkforceDetailMode = useMemo(
    () =>
      isChatBoxVisible &&
      !!activeTask &&
      (activeTask.status === ChatTaskStatus.RUNNING ||
        activeTask.status === ChatTaskStatus.PAUSE ||
        activeTask.status === ChatTaskStatus.FINISHED),
    [isChatBoxVisible, activeTask]
  );

  const baseWorker = useMemo<Agent[]>(
    () => [
      {
        tasks: [],
        agent_id: 'developer_agent',
        name: t('layout.developer-agent'),
        type: 'developer_agent',
        log: [],
        activeWebviewIds: [],
      },
      {
        tasks: [],
        agent_id: 'browser_agent',
        name: t('layout.browser-agent'),
        type: 'browser_agent',
        log: [],
        activeWebviewIds: [],
      },
      {
        tasks: [],
        agent_id: 'multi_modal_agent',
        name: t('layout.multi-modal-agent'),
        type: 'multi_modal_agent',
        log: [],
        activeWebviewIds: [],
      },
      {
        tasks: [],
        agent_id: 'document_agent',
        name: t('layout.document-agent'),
        type: 'document_agent',
        log: [],
        activeWebviewIds: [],
      },
    ],
    [t]
  );

  const stripAgentList = useMemo(() => {
    if (!chatStore) return [];
    const base = [...baseWorker, ...workerList].filter(
      (worker) => !taskAssigning?.find((agent) => agent.type === worker.type)
    );
    return [...base, ...(taskAssigning || [])];
  }, [chatStore, baseWorker, workerList, taskAssigning]);

  const resolvedAgent = useMemo(
    () => resolveAgentForWorkspace(activeWorkspace, taskAssigning),
    [activeWorkspace, taskAssigning]
  );

  useEffect(() => {
    if (!resolvedAgent?.tasks?.length) {
      setSelectedTask(null);
      return;
    }
    const running = resolvedAgent.tasks.find(
      (task) => task.status === TaskStatus.RUNNING
    );
    setSelectedTask(running || resolvedAgent.tasks[0] || null);
  }, [resolvedAgent?.agent_id, resolvedAgent?.tasks]);

  const onWorkspaceChange = useCallback(
    (value: string) => {
      if (!chatStore?.activeTaskId) return;
      if (value === '' || value === 'workflow') {
        chatStore.setActiveWorkspace(chatStore.activeTaskId, 'workflow');
        window.electronAPI.hideAllWebview();
        return;
      }
      if (value === 'documentWorkSpace') {
        chatStore.setNuwFileNum(chatStore.activeTaskId, 0);
      }
      chatStore.setActiveWorkspace(chatStore.activeTaskId, value);
      window.electronAPI.hideAllWebview();
    },
    [chatStore]
  );

  const selectAgentFromStrip = useCallback(
    (agent: Agent) => {
      onWorkspaceChange(agent.agent_id);
    },
    [onWorkspaceChange]
  );

  useEffect(() => {
    if (!isChatBoxVisible || !chatStore?.activeTaskId) return;
    if (
      activeWorkspace != null &&
      activeWorkspace !== '' &&
      activeWorkspace !== 'workflow'
    ) {
      return;
    }
    const first =
      stripAgentList.find((a) => !isStripAgentDisabled(a)) ?? stripAgentList[0];
    if (!first) return;
    chatStore.setActiveWorkspace(chatStore.activeTaskId, first.agent_id);
    window.electronAPI.hideAllWebview();
  }, [isChatBoxVisible, activeWorkspace, stripAgentList, chatStore]);

  const workflowLabel = 'Workflow';

  const showAgentDetail =
    activeWorkspace !== 'workflow' &&
    activeWorkspace !== 'inbox' &&
    resolvedAgent !== null;

  const headerRow = (
    <div className="top-0 sticky z-20 shrink-0">
      <div className="gap-2 px-2 py-1.5 flex w-full items-center justify-between">
        <span className="text-text-heading px-1 text-body-md font-semibold shrink-0">
          AI Worker Team
        </span>
        <div className="gap-2 min-w-0 flex flex-1 items-center justify-end">
          {headerActions}
          {fileInputRef && onFileUpload && (
            <input
              type="file"
              ref={fileInputRef as RefObject<HTMLInputElement>}
              onChange={onFileUpload}
              multiple
              className="hidden"
            />
          )}
        </div>
      </div>
    </div>
  );

  const verticalStrip = (
    <div
      className={cn(
        'scrollbar gap-2 border-border-tertiary py-2 pl-2 pr-1 flex w-full shrink-0 flex-col overflow-x-hidden overflow-y-auto border-solid',
        'min-h-0'
      )}
    >
      {stripAgentList.map((agent) => (
        <WorkforceAgentStripCard
          key={agent.agent_id}
          mode="agent"
          agent={agent}
          selected={workspaceAgentCardSelected(activeWorkspace, agent)}
          disabled={isStripAgentDisabled(agent)}
          onSelect={() => selectAgentFromStrip(agent)}
          workflowLabel={workflowLabel}
          orientation="vertical"
        />
      ))}
    </div>
  );

  const horizontalStrip = (
    <div className="scrollbar border-border-tertiary bg-surface-secondary top-0 gap-2 px-2 py-2 sticky z-20 flex w-full shrink-0 flex-row overflow-x-auto overflow-y-hidden border-b border-solid">
      {stripAgentList.map((agent) => (
        <WorkforceAgentStripCard
          key={agent.agent_id}
          mode="agent"
          agent={agent}
          selected={workspaceAgentCardSelected(activeWorkspace, agent)}
          disabled={isStripAgentDisabled(agent)}
          onSelect={() => selectAgentFromStrip(agent)}
          workflowLabel={workflowLabel}
          orientation="horizontal"
        />
      ))}
    </div>
  );

  const agentContentBelowStrip = (
    <div className="min-h-0 w-full flex-1 overflow-y-auto">
      {activeWorkspace === 'workflow' && (
        <div className="py-2 flex h-full min-h-[280px] w-full flex-1 items-center justify-center">
          <div className="relative flex h-full min-h-[280px] w-full max-w-full flex-col">
            <div className="inset-0 rounded-xl pointer-events-none absolute bg-transparent" />
            <div className="relative z-10 h-full min-h-[240px] w-full">
              <Workflow taskAssigning={assignedAgents} />
            </div>
          </div>
        </div>
      )}
      {activeWorkspace === 'inbox' && (
        <div className="p-2 flex min-h-[280px] w-full flex-1 items-center justify-center">
          <div className="blur-bg rounded-xl bg-surface-secondary relative h-full min-h-[240px] w-full">
            <div className="relative z-10 h-full w-full">
              <Folder />
            </div>
          </div>
        </div>
      )}
      {activeWorkspace === 'documentWorkSpace' && !resolvedAgent && (
        <div className="p-2 flex min-h-[280px] w-full flex-1 items-center justify-center">
          <div className="blur-bg rounded-xl bg-surface-secondary relative h-full min-h-[240px] w-full">
            <div className="relative z-10 h-full w-full">
              <Folder />
            </div>
          </div>
        </div>
      )}
      {showAgentDetail && resolvedAgent && (
        <div className="gap-0 min-h-0 px-2 pb-6 pt-3 flex w-full flex-col">
          <WorkforceAgentComputer
            agent={resolvedAgent}
            agentType={resolvedAgent.type}
          />
          <div className="bg-surface-secondary top-0 border-border-tertiary py-3 backdrop-blur-md sticky z-10 border-b">
            <div className="bg-menutabs-bg-default border-border-tertiary gap-0.5 p-1 mx-auto flex w-fit rounded-full border border-solid">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDetailTab('subtasks')}
                className={
                  detailTab === 'subtasks'
                    ? 'bg-surface-primary px-4 font-semibold text-text-heading shadow-sm rounded-full'
                    : 'px-4 text-text-body rounded-full'
                }
              >
                <LayoutGrid className="mr-1.5 h-4 w-4 shrink-0" />
                Subtasks
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDetailTab('logs')}
                className={
                  detailTab === 'logs'
                    ? 'bg-surface-primary px-4 font-semibold text-text-heading shadow-sm rounded-full'
                    : 'px-4 text-text-body rounded-full'
                }
              >
                <Code2 className="mr-1.5 h-4 w-4 shrink-0" />
                Logs
              </Button>
            </div>
          </div>
          {detailTab === 'subtasks' ? (
            <WorkforceSubtaskList
              agent={resolvedAgent}
              selectedTaskId={selectedTask?.id ?? null}
              onSelectTask={setSelectedTask}
            />
          ) : (
            <WorkforceTaskLogs
              selectedTask={selectedTask}
              agentType={resolvedAgent.type}
            />
          )}
        </div>
      )}
    </div>
  );

  const workflowCanvas = (agents: Agent[]) => (
    <div className="py-2 flex h-full min-h-[320px] w-full flex-1 items-center justify-center">
      <div className="relative flex h-full min-h-[320px] w-full max-w-full flex-col">
        <div className="inset-0 rounded-xl pointer-events-none absolute bg-transparent" />
        <div className="relative z-10 h-full min-h-[280px] w-full">
          <Workflow taskAssigning={agents} />
        </div>
      </div>
    </div>
  );

  if (!chatStore) {
    return <div className="text-text-body p-4">{t('triggers.loading')}</div>;
  }

  if (!activeTask || !activeWorkspace) {
    if (!isChatBoxVisible) {
      return (
        <div className="min-h-0 flex h-full w-full flex-1 flex-col overflow-hidden">
          {headerRow}
          <div className="min-h-0 w-full flex-1 overflow-y-auto">
            {workflowCanvas([])}
          </div>
        </div>
      );
    }
    return (
      <div
        className={cn(
          'min-h-0 flex h-full flex-1 flex-col overflow-hidden',
          'mx-auto w-full max-w-[600px]'
        )}
      >
        {headerRow}
        <div className="min-h-0 flex w-full flex-1 flex-row justify-start overflow-hidden">
          {verticalStrip}
        </div>
      </div>
    );
  }

  const shellWidthClass = cn(
    isChatBoxVisible &&
      (isChatWorkforceDetailMode
        ? 'w-full max-w-none'
        : 'mx-auto max-w-[600px] w-full')
  );

  return (
    <div
      className={cn(
        'min-h-0 flex h-full flex-1 flex-col overflow-hidden',
        !isChatBoxVisible ? 'w-full' : shellWidthClass
      )}
    >
      {headerRow}

      {!isChatBoxVisible ? (
        <div className="min-h-0 w-full flex-1 overflow-y-auto">
          {workflowCanvas(assignedAgents)}
        </div>
      ) : isChatWorkforceDetailMode ? (
        <div className="min-h-0 flex w-full flex-1 flex-col overflow-hidden">
          {horizontalStrip}
          {agentContentBelowStrip}
        </div>
      ) : (
        <div className="min-h-0 flex w-full flex-1 flex-row justify-start overflow-hidden">
          {verticalStrip}
        </div>
      )}
    </div>
  );
}
