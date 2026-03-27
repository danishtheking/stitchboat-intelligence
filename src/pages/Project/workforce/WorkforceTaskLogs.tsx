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

import { MarkDown } from '@/components/WorkFlow/MarkDown';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import useChatStoreAdapter from '@/hooks/useChatStoreAdapter';
import { getToolkitIcon } from '@/lib/toolkitIcons';
import { AgentStatusValue, ChatTaskStatus } from '@/types/constants';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, LoaderCircle } from 'lucide-react';
import { useRef } from 'react';

type WorkforceTaskLogsProps = {
  selectedTask: TaskInfo | null;
  agentType: AgentNameType;
};

export function WorkforceTaskLogs({
  selectedTask,
  agentType: _agentType,
}: WorkforceTaskLogsProps) {
  const { chatStore } = useChatStoreAdapter();
  const logRef = useRef<HTMLDivElement>(null);
  const rePortRef = useRef<HTMLDivElement>(null);

  if (!chatStore) return null;

  const activeTaskId = chatStore.activeTaskId as string;

  return (
    <div
      ref={logRef}
      className="scrollbar scrollbar-always-visible px-2 pb-4 max-h-[min(70vh,560px)] overflow-y-auto"
    >
      <AnimatePresence mode="wait">
        {selectedTask && (
          <motion.div
            key={selectedTask.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: 'easeIn' }}
            className="gap-sm flex w-full flex-col"
          >
            {selectedTask.toolkits &&
              selectedTask.toolkits.length > 0 &&
              selectedTask.toolkits.map((toolkit: any, index: number) => (
                <div key={`toolkit-${toolkit.toolkitId ?? index}`}>
                  {toolkit.toolkitName === 'notice' ? (
                    <div className="gap-sm px-2 py-1 flex w-full flex-col">
                      <MarkDown
                        content={toolkit?.message}
                        enableTypewriter={false}
                        pTextSize="text-label-xs"
                      />
                    </div>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (toolkit.toolkitMethods === 'write to file') {
                              chatStore.tasks[activeTaskId].activeWorkspace =
                                'documentWorkSpace';
                            } else if (
                              toolkit.toolkitMethods === 'visit page'
                            ) {
                              const parts = toolkit.message.split('\n');
                              const url = parts[0];
                              window.location.href = url;
                            } else if (toolkit.toolkitMethods === 'scrape') {
                              window.location.href = toolkit.message;
                            }
                          }}
                          className="gap-1 rounded-lg bg-log-default p-1 px-2 flex flex-col items-start justify-center transition-all duration-300 hover:opacity-50"
                        >
                          <div className="gap-sm flex w-full items-center justify-start">
                            {toolkit.toolkitStatus ===
                            AgentStatusValue.RUNNING ? (
                              <LoaderCircle
                                size={16}
                                className={`${
                                  chatStore.tasks[activeTaskId]?.status ===
                                    ChatTaskStatus.RUNNING && 'animate-spin'
                                }`}
                              />
                            ) : (
                              getToolkitIcon(toolkit.toolkitName)
                            )}
                            <span className="gap-sm text-label-xs font-bold text-text-primary flex items-center text-nowrap">
                              {toolkit.toolkitName}
                            </span>
                          </div>
                          <div className="gap-sm pl-6 flex w-full items-start justify-center overflow-hidden select-text">
                            <div className="text-label-xs font-bold text-text-primary text-nowrap">
                              {toolkit.toolkitMethods
                                ? toolkit.toolkitMethods
                                    .charAt(0)
                                    .toUpperCase() +
                                  toolkit.toolkitMethods.slice(1)
                                : ''}
                            </div>
                            <div
                              className={`text-label-xs font-normal text-text-primary max-w-full flex-1 truncate`}
                            >
                              {toolkit.message}
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      {toolkit.message && (
                        <TooltipContent
                          align="start"
                          className="scrollbar left-6 rounded-lg border-task-border-default bg-surface-tertiary p-2 text-label-xs pointer-events-auto !fixed z-[9999] max-h-[200px] w-max max-w-[296px] overflow-y-auto border border-solid text-wrap break-words select-text"
                          side="bottom"
                          sideOffset={4}
                        >
                          <MarkDown
                            content={toolkit.message}
                            enableTypewriter={false}
                            pTextSize="text-label-xs"
                            olPadding="pl-4"
                          />
                        </TooltipContent>
                      )}
                    </Tooltip>
                  )}
                </div>
              ))}
            {selectedTask.report && (
              <div
                ref={rePortRef}
                className="group my-2 rounded-lg bg-surface-primary relative flex w-full flex-col"
              >
                <div className="top-0 rounded-lg bg-surface-primary py-2 pl-2 pr-2 sticky z-10 flex items-center justify-between">
                  <div className="text-label-sm font-bold text-text-primary">
                    Completion Report
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      const reportText =
                        typeof selectedTask?.report === 'string'
                          ? selectedTask.report
                          : '';
                      if (reportText && navigator.clipboard?.writeText) {
                        navigator.clipboard
                          .writeText(reportText)
                          .catch(() => {});
                      }
                    }}
                    className="text-label-xs"
                  >
                    <Copy className="text-icon-secondary" />
                    <span className="text-icon-secondary">Copy</span>
                  </Button>
                </div>
                <div className="px-2 py-2">
                  <MarkDown
                    content={selectedTask?.report}
                    enableTypewriter={false}
                    pTextSize="text-label-xs"
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {!selectedTask && (
        <div className="text-text-label py-8 text-body-sm text-center">
          Select&nbsp;a subtask to view logs.
        </div>
      )}
    </div>
  );
}
