#!/bin/bash
# .claude/hooks/check-warnings.sh

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
    exit 0
fi

# 运行检查（这里用eslint示例）
WARNINGS=""
if command -v eslint &> /dev/null; then
    WARNINGS=$(eslint --quiet --format=compact "$FILE_PATH" 2>/dev/null | grep -i warning)
fi

if [ -n "$WARNINGS" ]; then
    # 关键：告诉Claude有警告，并建议它修复
    jq -nc --arg warnings "$WARNINGS" --arg file "$FILE_PATH" '{
        hookSpecificOutput: {
            hookEventName: "PostToolUse",
            additionalContext: "[⚠️ Warnings Detected] File " + $file + ":\n" + $warnings + "\n\nPlease fix these warnings automatically using Edit tool."
        }
    }'
else
    exit 0
fi