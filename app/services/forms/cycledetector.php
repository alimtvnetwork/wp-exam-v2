<?php

declare(strict_types=1);

namespace App\Services\Forms;

/**
 * CycleDetector detects directed cycles in the Visual Project Node Canvas graph.
 * Prevents recursive or circular dependencies across project nodes.
 */
class CycleDetector
{
    /** @var array<int, array<int, int>> */
    private array $adjacencyList = [];

    /**
     * @param array<int, array{source: int, target: int}> $edges
     */
    public function __construct(array $edges = [])
    {
        foreach ($edges as $edge) {
            $this->addEdge($edge['source'], $edge['target']);
        }
    }

    public function addEdge(int $source, int $target): self
    {
        $hasSource = array_key_exists($source, $this->adjacencyList);

        if (!$hasSource) {
            $this->adjacencyList[$source] = [];
        }

        $this->adjacencyList[$source][] = $target;

        return $this;
    }

    /**
     * Checks if adding an edge from source to target would create a cycle.
     */
    public function wouldCreateCycle(int $newSource, int $newTarget): bool
    {
        if ($newSource === $newTarget) {
            return true;
        }

        // Clone graph and add proposed edge
        $temp = $this->adjacencyList;
        $hasKey = array_key_exists($newSource, $temp);

        if (!$hasKey) {
            $temp[$newSource] = [];
        }

        $temp[$newSource][] = $newTarget;

        return $this->hasCycle($temp);
    }

    /**
     * Traverses graph using Depth-First Search with visited and recursion stacks.
     *
     * @param array<int, array<int, int>>|null $graph
     */
    public function hasCycle(?array $graph = null): bool
    {
        $adj = $graph ?? $this->adjacencyList;
        $visited = [];
        $recursionStack = [];

        foreach (array_keys($adj) as $node) {
            $isNodeVisited = ($visited[$node] ?? false);

            if (!$isNodeVisited) {
                $cycleFound = $this->dfsCheckCycle((int) $node, $adj, $visited, $recursionStack);

                if ($cycleFound) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * @param array<int, array<int, int>> $adj
     * @param array<int, bool> $visited
     * @param array<int, bool> $recursionStack
     */
    private function dfsCheckCycle(int $node, array $adj, array &$visited, array &$recursionStack): bool
    {
        $visited[$node] = true;
        $recursionStack[$node] = true;

        $neighbors = $adj[$node] ?? [];

        foreach ($neighbors as $neighbor) {
            $isVisited = ($visited[$neighbor] ?? false);

            if (!$isVisited) {
                $subCycle = $this->dfsCheckCycle($neighbor, $adj, $visited, $recursionStack);

                if ($subCycle) {
                    return true;
                }
            }

            $inStack = ($recursionStack[$neighbor] ?? false);

            if ($inStack) {
                return true;
            }
        }

        $recursionStack[$node] = false;

        return false;
    }
}
