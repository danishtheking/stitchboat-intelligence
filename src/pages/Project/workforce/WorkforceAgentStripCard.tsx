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

import { TaskState } from '@/components/TaskState';
import { agentMap } from '@/components/WorkFlow/agents';
import { cn } from '@/lib/utils';
import { TaskStatus } from '@/types/constants';
import { GitBranch } from 'lucide-react';
import { getWorkforceToolkitLabels } from './workforceUtils';

type WorkforceAgentStripCardProps = {
  mode: 'workflow' | 'agent';
  agent?: Agent;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  workflowLabel: string;
  /** Stacked layout for narrow strip beside chat */
  orientation?: 'horizontal' | 'vertical';
};

export function WorkforceAgentStripCard({
  mode,
  agent,
  selected,
  disabled,
  onSelect,
  workflowLabel,
  orientation = 'horizontal',
}: WorkforceAgentStripCardProps) {
  const isWorkflow = mode === 'workflow';
  const typeKey = agent?.type as keyof typeof agentMap | undefined;
  const palette = typeKey && agentMap[typeKey] ? agentMap[typeKey] : null;
  const name = isWorkflow
    ? workflowLabel
    : palette?.name || agent?.name || 'Agent';
  const titleClass = isWorkflow
    ? 'text-text-primary'
    : palette?.textColor || 'text-text-primary';
  const toolkits = !isWorkflow && agent ? getWorkforceToolkitLabels(agent) : [];

  const taskList = !isWorkflow && agent ? agent.tasks || [] : [];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'rounded-xl px-3 py-2.5 shrink-0 border border-solid text-left transition-all duration-200',
        orientation === 'vertical'
          ? 'min-w-0 w-full max-w-full'
          : 'max-w-[260px] min-w-[200px]',
        selected
          ? 'border-border-primary bg-surface-primary shadow-sm'
          : 'border-worker-border-default bg-worker-surface-primary/80 hover:bg-worker-surface-secondary',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      )}
    >
      <div className="gap-1.5 mb-1.5 flex items-start justify-between">
        <div
          className={`min-w-0 text-body-sm font-bold leading-snug ${titleClass} truncate`}
        >
          {isWorkflow && (
            <span className="text-icon-secondary mr-1 translate-y-0.5 inline-flex align-middle">
              <GitBranch size={14} />
            </span>
          )}
          {name}
        </div>
      </div>
      {!isWorkflow && (
        <>
          <div className="text-text-label mb-2 text-label-xs font-normal leading-tight line-clamp-2">
            {toolkits.map((t, i) => (
              <span key={i} className="mr-1.5">
                {t}
              </span>
            ))}
          </div>
          {taskList.length > 0 && (
            <div className="pointer-events-none flex justify-start">
              <TaskState
                all={taskList.length}
                done={
                  taskList.filter(
                    (task) =>
                      task.status === TaskStatus.COMPLETED && !task.reAssignTo
                  ).length
                }
                reAssignTo={taskList.filter((task) => task.reAssignTo).length}
                progress={
                  taskList.filter(
                    (task) =>
                      task.status !== TaskStatus.FAILED &&
                      task.status !== TaskStatus.COMPLETED &&
                      task.status !== TaskStatus.SKIPPED &&
                      task.status !== TaskStatus.WAITING &&
                      task.status !== TaskStatus.EMPTY &&
                      !task.reAssignTo
                  ).length
                }
                skipped={
                  taskList.filter(
                    (task) =>
                      (task.status === TaskStatus.SKIPPED ||
                        task.status === TaskStatus.WAITING ||
                        task.status === TaskStatus.EMPTY) &&
                      !task.reAssignTo
                  ).length
                }
                failed={
                  taskList.filter((task) => task.status === TaskStatus.FAILED)
                    .length
                }
                clickable={false}
              />
            </div>
          )}
        </>
      )}
    </button>
  );
}
