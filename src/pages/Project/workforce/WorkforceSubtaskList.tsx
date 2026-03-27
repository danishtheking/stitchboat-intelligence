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

import { TaskState, TaskStateType } from '@/components/TaskState';
import ShinyText from '@/components/ui/ShinyText/ShinyText';
import useChatStoreAdapter from '@/hooks/useChatStoreAdapter';
import { getToolkitIcon } from '@/lib/toolkitIcons';
import {
  AgentStatusValue,
  ChatTaskStatus,
  TaskStatus,
} from '@/types/constants';
import {
  Circle,
  CircleCheckBig,
  CircleSlash,
  CircleSlash2,
  LoaderCircle,
  TriangleAlert,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getWorkforceTaskIdLabel } from './workforceUtils';

type WorkforceSubtaskListProps = {
  agent: Agent;
  /** Controlled selection for syncing with logs tab */
  selectedTaskId: string | null;
  onSelectTask: (task: TaskInfo) => void;
};

export function WorkforceSubtaskList({
  agent,
  selectedTaskId,
  onSelectTask,
}: WorkforceSubtaskListProps) {
  const { chatStore } = useChatStoreAdapter();
  const [selectedState, setSelectedState] = useState<TaskStateType>('all');
  const [filterTasks, setFilterTasks] = useState<TaskInfo[]>(agent.tasks || []);

  const tasks = useMemo(() => agent.tasks || [], [agent.tasks]);

  useEffect(() => {
    if (selectedState === 'all') {
      setFilterTasks(tasks);
      return;
    }
    const newFiltered = tasks.filter((task) => {
      switch (selectedState) {
        case 'done':
          return task.status === TaskStatus.COMPLETED && !task.reAssignTo;
        case 'reassigned':
          return !!task.reAssignTo;
        case 'ongoing':
          return (
            task.status !== TaskStatus.FAILED &&
            task.status !== TaskStatus.COMPLETED &&
            task.status !== TaskStatus.SKIPPED &&
            task.status !== TaskStatus.WAITING &&
            task.status !== TaskStatus.EMPTY &&
            !task.reAssignTo
          );
        case 'pending':
          return (
            (task.status === TaskStatus.SKIPPED ||
              task.status === TaskStatus.WAITING ||
              task.status === TaskStatus.EMPTY) &&
            !task.reAssignTo
          );
        case 'failed':
          return task.status === TaskStatus.FAILED;
        default:
          return false;
      }
    });
    setFilterTasks(newFiltered);
  }, [selectedState, tasks]);

  useEffect(() => {
    if (!selectedTaskId || !tasks.length) return;
    const exists = tasks.some((t) => t.id === selectedTaskId);
    if (!exists && tasks[0]) onSelectTask(tasks[0]);
  }, [selectedTaskId, tasks, onSelectTask]);

  if (!chatStore) return null;

  const activeTaskId = chatStore.activeTaskId as string;

  if (!tasks.length) {
    return (
      <div className="text-text-label px-2 py-6 text-body-sm text-center">
        No subtasks for this agent yet.
      </div>
    );
  }

  return (
    <div className="gap-3 px-2 pb-4 flex flex-col">
      <div className="gap-1 border-task-border-default pt-3 flex flex-col border-[0px] border-t border-solid">
        <div className="flex flex-1 justify-end">
          <TaskState
            all={tasks.length}
            done={
              tasks.filter(
                (task) =>
                  task.status === TaskStatus.COMPLETED && !task.reAssignTo
              ).length
            }
            reAssignTo={tasks.filter((task) => task.reAssignTo).length}
            progress={
              tasks.filter(
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
              tasks.filter(
                (task) =>
                  (task.status === TaskStatus.SKIPPED ||
                    task.status === TaskStatus.WAITING ||
                    task.status === TaskStatus.EMPTY) &&
                  !task.reAssignTo
              ).length
            }
            failed={
              tasks.filter((task) => task.status === TaskStatus.FAILED).length
            }
            selectedState={selectedState}
            onStateChange={setSelectedState}
            clickable
          />
        </div>
      </div>
      <div className="gap-2 flex flex-col">
        {filterTasks.map((task) => {
          const lastActiveToolkit = task.toolkits
            ?.filter(
              (tool: { toolkitName?: string }) => tool.toolkitName !== 'notice'
            )
            .at(-1);
          const selected = selectedTaskId === task.id;
          return (
            <div
              onClick={() => onSelectTask(task)}
              key={`wf-task-${task.id}-${task.failure_count}`}
              className={`gap-2 rounded-xl px-sm py-sm ease-in-out flex cursor-pointer border border-solid transition-all duration-300 ${
                task.reAssignTo
                  ? 'bg-task-fill-warning'
                  : task.status === TaskStatus.COMPLETED
                    ? 'bg-task-fill-success'
                    : task.status === TaskStatus.FAILED
                      ? 'bg-task-fill-error'
                      : task.status === TaskStatus.RUNNING
                        ? 'bg-task-fill-running'
                        : task.status === TaskStatus.BLOCKED
                          ? 'bg-task-fill-warning'
                          : 'bg-task-fill-running'
              } ${
                task.status === TaskStatus.COMPLETED
                  ? 'hover:border-task-border-focus-success'
                  : task.status === TaskStatus.FAILED
                    ? 'hover:border-task-border-focus-error'
                    : task.status === TaskStatus.RUNNING
                      ? 'hover:border-border-primary'
                      : task.status === TaskStatus.BLOCKED
                        ? 'hover:border-task-border-focus-warning'
                        : 'hover:border-task-border-focus'
              } ${
                selected
                  ? task.status === TaskStatus.COMPLETED
                    ? '!border-task-border-focus-success'
                    : task.status === TaskStatus.FAILED
                      ? '!border-task-border-focus-error'
                      : task.status === TaskStatus.RUNNING
                        ? '!border-border-primary'
                        : task.status === TaskStatus.BLOCKED
                          ? '!border-task-border-focus-warning'
                          : '!border-task-border-focus'
                  : 'border-transparent'
              }`}
            >
              <div className="">
                {task.reAssignTo ? (
                  <CircleSlash2 size={16} className="text-icon-warning" />
                ) : (
                  <>
                    {task.status === TaskStatus.RUNNING && (
                      <LoaderCircle
                        size={16}
                        className={`text-icon-information ${
                          chatStore.tasks[activeTaskId]?.status ===
                            ChatTaskStatus.RUNNING && 'animate-spin'
                        }`}
                      />
                    )}
                    {task.status === TaskStatus.SKIPPED && (
                      <LoaderCircle size={16} className="text-icon-secondary" />
                    )}
                    {task.status === TaskStatus.COMPLETED && (
                      <CircleCheckBig size={16} className="text-icon-success" />
                    )}
                    {task.status === TaskStatus.FAILED && (
                      <CircleSlash size={16} className="text-icon-cuation" />
                    )}
                    {task.status === TaskStatus.BLOCKED && (
                      <TriangleAlert size={16} className="text-icon-warning" />
                    )}
                    {(task.status === TaskStatus.EMPTY ||
                      task.status === TaskStatus.WAITING) && (
                      <Circle size={16} className="text-slate-400" />
                    )}
                  </>
                )}
              </div>
              <div className="flex flex-1 flex-col items-start justify-center">
                <div
                  className={`w-full flex-grow-0 ${
                    task.status === TaskStatus.FAILED
                      ? 'text-text-cuation-default'
                      : task.status === TaskStatus.BLOCKED
                        ? 'text-text-body'
                        : 'text-text-primary'
                  } text-xs font-medium leading-13 text-wrap break-all whitespace-pre-line select-text`}
                >
                  <div className="gap-sm flex items-center">
                    <div className="text-xs font-bold leading-13 text-text-body">
                      No. {getWorkforceTaskIdLabel(task.id)}
                    </div>
                    {task.reAssignTo ? (
                      <div className="rounded-lg bg-tag-fill-document px-1 py-0.5 text-xs font-bold text-text-warning leading-none">
                        Reassigned to {task.reAssignTo}
                      </div>
                    ) : (
                      (task.failure_count ?? 0) > 0 && (
                        <div
                          className={`${
                            task.status === TaskStatus.FAILED
                              ? 'bg-surface-error-subtle text-text-cuation'
                              : task.status === TaskStatus.COMPLETED
                                ? 'text-text-success-default bg-tag-fill-developer'
                                : 'bg-tag-surface-hover text-text-label'
                          } rounded-lg px-1 py-0.5 text-xs font-bold leading-none`}
                        >
                          Attempt {task.failure_count}
                        </div>
                      )
                    )}
                  </div>
                  <div>{task.content}</div>
                </div>
                {task?.status === TaskStatus.RUNNING &&
                  lastActiveToolkit?.toolkitStatus ===
                    AgentStatusValue.RUNNING && (
                    <div className="mt-xs gap-2 flex items-center">
                      <div className="min-w-0 gap-sm flex flex-1 items-center justify-start">
                        {getToolkitIcon(lastActiveToolkit.toolkitName ?? '')}
                        <div className="min-w-0 pt-1 text-xs leading-17 text-text-primary max-w-full flex-shrink truncate">
                          <ShinyText
                            text={task.toolkits?.[0]?.toolkitName ?? ''}
                            className="text-xs font-bold leading-17 text-text-primary w-full truncate select-text"
                          />
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
