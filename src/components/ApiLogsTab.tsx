'use client';

import { ApiCallRecord } from '@/lib/types';
import { useState } from 'react';

interface ApiLogsTabProps {
  logs: ApiCallRecord[];
  onClearLogs: () => void;
}

export default function ApiLogsTab({ logs, onClearLogs }: ApiLogsTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 计算总计
  const totalCost = logs.reduce((sum, log) => sum + (log.cost || 0), 0);
  const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0);
  const totalInputTokens = logs.reduce((sum, log) => sum + (log.inputTokens || 0), 0);
  const totalOutputTokens = logs.reduce((sum, log) => sum + (log.outputTokens || 0), 0);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">总调用次数</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{logs.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">总花费</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCost(totalCost)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">总耗时</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatDuration(totalDuration)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">总 Tokens</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {(totalInputTokens + totalOutputTokens).toLocaleString()}
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end">
        <button
          onClick={onClearLogs}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          清空日志
        </button>
      </div>

      {/* 日志列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            暂无 API 调用记录
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {logs.map((log) => (
              <div key={log.id} className="p-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* 状态指示器 */}
                    <div className={`w-2 h-2 rounded-full ${
                      log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`} />

                    {/* 时间 */}
                    <div className="text-sm text-gray-500 dark:text-gray-400 w-20">
                      {formatTimestamp(log.timestamp)}
                    </div>

                    {/* API 名称 */}
                    <div className="font-semibold text-gray-900 dark:text-white w-32">
                      {log.apiName}
                    </div>

                    {/* 耗时 */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 w-24">
                      {formatDuration(log.duration)}
                    </div>

                    {/* Tokens */}
                    {(log.inputTokens || log.outputTokens) && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 w-32">
                        {log.inputTokens || 0} → {log.outputTokens || 0}
                      </div>
                    )}

                    {/* 花费 */}
                    {log.cost !== undefined && (
                      <div className="text-sm font-medium text-green-600 dark:text-green-400 w-24">
                        {formatCost(log.cost)}
                      </div>
                    )}

                    {/* 展开按钮 */}
                    <div className="text-gray-400">
                      {expandedId === log.id ? '▼' : '▶'}
                    </div>
                  </div>
                </div>

                {/* 展开的详细信息 */}
                {expandedId === log.id && (
                  <div className="mt-4 pl-6 space-y-3">
                    {log.error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                        <div className="text-sm font-semibold text-red-800 dark:text-red-400 mb-1">
                          错误信息:
                        </div>
                        <div className="text-sm text-red-700 dark:text-red-300">
                          {log.error}
                        </div>
                      </div>
                    )}

                    {log.prompt && (
                      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3">
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Prompt:
                        </div>
                        <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap max-h-64 overflow-y-auto">
                          {log.prompt}
                        </pre>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {log.inputTokens !== undefined && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">输入 Tokens: </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {log.inputTokens.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {log.outputTokens !== undefined && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">输出 Tokens: </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {log.outputTokens.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {log.cost !== undefined && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">花费: </span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {formatCost(log.cost)}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">耗时: </span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {formatDuration(log.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
