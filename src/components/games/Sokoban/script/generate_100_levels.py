#!/usr/bin/env python3
"""
Sokoban 关卡生成器 - 稳定版
- 只验证有解，不要求唯一解
- 基于预置模板 + 变形
- 保证能稳定生成
"""

import json
import random
from collections import deque
from typing import List, Tuple, Set, Optional
from dataclasses import dataclass
from enum import IntEnum


class Cell(IntEnum):
    WALL = 1
    FLOOR = 0
    PLAYER = 2
    BOX = 3
    GOAL = 4


@dataclass
class GameState:
    player_pos: Tuple[int, int]
    boxes: Tuple[Tuple[int, int], ...]

    def __hash__(self):
        return hash((self.player_pos, self.boxes))

    def __eq__(self, other):
        return self.player_pos == other.player_pos and self.boxes == other.boxes


@dataclass
class Level:
    id: int
    name: str
    boxes: int
    difficulty: int
    map: List[List[int]]


# ==================== 求解器 ====================
class SokobanSolver:
    def __init__(self, grid: List[List[int]], goals: Set[Tuple[int, int]]):
        self.grid = grid
        self.goals = goals
        self.h = len(grid)
        self.w = len(grid[0])

    def is_wall(self, x: int, y: int) -> bool:
        return self.grid[y][x] == Cell.WALL

    def get_neighbors(self, state: GameState) -> List[GameState]:
        px, py = state.player_pos
        boxes_set = set(state.boxes)
        neighbors = []

        for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            nx, ny = px + dx, py + dy

            if nx < 0 or nx >= self.w or ny < 0 or ny >= self.h:
                continue
            if self.is_wall(nx, ny):
                continue

            new_boxes = list(state.boxes)

            if (nx, ny) in boxes_set:
                nnx, nny = nx + dx, ny + dy
                if nnx < 0 or nnx >= self.w or nny < 0 or nny >= self.h:
                    continue
                if self.is_wall(nnx, nny) or (nnx, nny) in boxes_set:
                    continue

                new_boxes.remove((nx, ny))
                new_boxes.append((nnx, nny))
                new_boxes.sort()

                neighbors.append(GameState((nx, ny), tuple(new_boxes)))
            else:
                neighbors.append(GameState((nx, ny), state.boxes))

        return neighbors

    def is_solvable(self, start_state: GameState, max_states: int = 100000) -> bool:
        """BFS验证可解性"""
        queue = deque()
        visited = {start_state}
        queue.append(start_state)

        while queue:
            state = queue.popleft()

            if len(visited) > max_states:
                return False

            if all(box in self.goals for box in state.boxes):
                return True

            for next_state in self.get_neighbors(state):
                if next_state not in visited:
                    visited.add(next_state)
                    queue.append(next_state)

        return False


# ==================== 地形生成器 ====================
class TerrainGenerator:
    """简单地形生成器"""

    @staticmethod
    def empty_map(rows: int, cols: int) -> List[List[int]]:
        """创建空地图（带边界墙）"""
        grid = [[Cell.FLOOR for _ in range(cols)] for _ in range(rows)]

        for i in range(cols):
            grid[0][i] = Cell.WALL
            grid[rows - 1][i] = Cell.WALL
        for i in range(rows):
            grid[i][0] = Cell.WALL
            grid[i][cols - 1] = Cell.WALL

        return grid

    @staticmethod
    def add_random_walls(grid: List[List[int]], density: float):
        """添加随机墙"""
        rows, cols = len(grid), len(grid[0])
        for y in range(2, rows - 2):
            for x in range(2, cols - 2):
                if random.random() < density and grid[y][x] == Cell.FLOOR:
                    grid[y][x] = Cell.WALL


# ==================== 关卡生成器 ====================
class SokobanGenerator:
    def __init__(self, rows: int = 10, cols: int = 10):
        self.rows = rows
        self.cols = cols
        self.terrain = TerrainGenerator()

    def get_empty_cells(self, grid: List[List[int]]) -> List[Tuple[int, int]]:
        """获取所有空格"""
        cells = []
        for y in range(1, self.rows - 1):
            for x in range(1, self.cols - 1):
                if grid[y][x] == Cell.FLOOR:
                    cells.append((x, y))
        return cells

    def place_goals(self, grid: List[List[int]], count: int) -> List[Tuple[int, int]]:
        """放置目标点"""
        empty_cells = self.get_empty_cells(grid)
        random.shuffle(empty_cells)
        goals = []

        for x, y in empty_cells:
            if len(goals) >= count:
                break
            # 目标点不要太靠边
            if 2 <= x <= self.cols - 3 and 2 <= y <= self.rows - 3:
                grid[y][x] = Cell.GOAL
                goals.append((x, y))

        return goals

    def place_boxes_near_goals(self, grid: List[List[int]], goals: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        """在目标点周围放置箱子"""
        boxes = []

        for gx, gy in goals:
            candidates = [(gx+1, gy), (gx-1, gy), (gx, gy+1), (gx, gy-1)]
            random.shuffle(candidates)

            for bx, by in candidates:
                if 1 <= bx < self.cols - 1 and 1 <= by < self.rows - 1:
                    if grid[by][bx] == Cell.FLOOR:
                        grid[by][bx] = Cell.BOX
                        boxes.append((bx, by))
                        break

        return boxes

    def place_player(self, grid: List[List[int]], boxes: Set[Tuple[int, int]]) -> Tuple[int, int]:
        """放置玩家（尽量远离箱子）"""
        empty_cells = self.get_empty_cells(grid)

        if boxes:
            # 优先放在离箱子远的位置
            def dist_to_boxes(x, y):
                return min(abs(x - bx) + abs(y - by) for bx, by in boxes)
            empty_cells.sort(key=lambda p: -dist_to_boxes(p[0], p[1]))

        for x, y in empty_cells:
            if grid[y][x] == Cell.FLOOR:
                return (x, y)

        return empty_cells[0] if empty_cells else (self.cols // 2, self.rows // 2)

    def generate_level(self, level_id: int, box_count: int,
                       wall_density: float = 0.15) -> Optional[Level]:
        """生成关卡"""

        for attempt in range(50):
            grid = self.terrain.empty_map(self.rows, self.cols)
            self.terrain.add_random_walls(grid, wall_density)

            goals = self.place_goals(grid, box_count)
            if len(goals) != box_count:
                continue

            boxes = self.place_boxes_near_goals(grid, goals)
            if len(boxes) != box_count:
                continue

            player = self.place_player(grid, set(boxes))

            # 验证可解性
            solver = SokobanSolver(grid, set(goals))
            start_state = GameState(player, tuple(sorted(boxes)))

            if solver.is_solvable(start_state):
                # 放置玩家到地图
                px, py = player
                grid[py][px] = Cell.PLAYER

                return Level(
                    id=level_id,
                    name=f"第{level_id}关",
                    boxes=box_count,
                    difficulty=int(wall_density * 100 + box_count * 10),
                    map=grid
                )

        return None


# ==================== 批量生成器 ====================
class BatchGenerator:
    def __init__(self, target: int = 100):
        self.target = target
        self.levels: List[Level] = []

    def generate_batch(self) -> List[Level]:
        level_id = 1
        box_count = 2
        wall_density = 0.08

        while len(self.levels) < self.target:
            print(f"生成第 {level_id} 关 (箱子:{box_count}, 墙密度:{wall_density:.2f})...", end=" ")

            # 根据难度调整地图大小
            if box_count <= 2:
                rows, cols = 8, 8
            elif box_count <= 3:
                rows, cols = 10, 10
            else:
                rows, cols = 12, 12

            generator = SokobanGenerator(rows, cols)
            level = generator.generate_level(level_id, box_count, wall_density)

            if not level:
                print("失败，重试")
                continue

            self.levels.append(level)
            print(f"✅")
            level_id += 1

            # 难度翻倍节点
            milestones = [10, 30, 70, 150]

            for m in milestones:
                if level_id == m:
                    if box_count < 5:
                        box_count += 1
                    wall_density = min(0.08 + (level_id / 1000), 0.35)
                    break

            for m in milestones:
                if len(self.levels) == m:
                    print(f"\n📊 进度: {len(self.levels)}/{self.target} 关\n")
                    break

        return self.levels

    def format_map_line(self, row: List[int]) -> str:
        return '[' + ','.join(str(cell) for cell in row) + ']'

    def export_to_json(self, filename: str):
        lines = ['{']
        lines.append('  "levels": [')

        for i, level in enumerate(self.levels):
            lines.append('    {')
            lines.append(f'      "id": {level.id},')
            lines.append(f'      "name": "{level.name}",')
            lines.append(f'      "boxes": {level.boxes},')
            lines.append('      "map": [')

            for j, row in enumerate(level.map):
                comma = ',' if j < len(level.map) - 1 else ''
                lines.append(f'        {self.format_map_line(row)}{comma}')

            lines.append('      ]')
            lines.append('    }' + (',' if i < len(self.levels) - 1 else ''))

        lines.append('  ]')
        lines.append('}')

        with open(filename, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))

        print(f"\n✅ 导出完成: {filename}")

    def print_stats(self):
        print("\n" + "="*100)
        print("📊 统计")
        print("="*100)
        print(f"总关卡数: {len(self.levels)}")

        box_dist = {}
        for level in self.levels:
            box_dist[level.boxes] = box_dist.get(level.boxes, 0) + 1

        print(f"\n箱子分布:")
        for boxes, count in sorted(box_dist.items()):
            print(f"  {boxes}个箱子: {count}关")


def main():
    print("🎮 Sokoban 关卡生成器 - 稳定版")
    print("="*100)
    print()
    print("特性:")
    print("  ✓ 只验证有解（不要求唯一解）")
    print("  ✓ 难度渐进（箱子数逐渐增加）")
    print("  ✓ 稳定生成，几乎不会失败")
    print()

    # 生成100关
    generator = BatchGenerator(target=100)
    levels = generator.generate_batch()
    generator.export_to_json("SokobanLevels.json")
    generator.print_stats()

    print(f"\n🎉 完成！共生成 {len(levels)} 关")


if __name__ == "__main__":
    main()