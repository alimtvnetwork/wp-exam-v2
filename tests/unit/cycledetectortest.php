<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\Forms\CycleDetector;

class CycleDetectorTest extends TestCase
{
    public function testAcyclicGraphPasses(): void
    {
        $detector = new CycleDetector();
        $detector->addEdge(1, 2);
        $detector->addEdge(2, 3);
        $detector->addEdge(3, 4);

        $hasCycle = $detector->hasCycle();
        $this->assertFalse($hasCycle);
    }

    public function testDirectCycleDetected(): void
    {
        $detector = new CycleDetector();
        $detector->addEdge(1, 2);
        $detector->addEdge(2, 1);

        $hasCycle = $detector->hasCycle();
        $this->assertTrue($hasCycle);
    }

    public function testMultiHopCycleDetected(): void
    {
        $detector = new CycleDetector();
        $detector->addEdge(1, 2);
        $detector->addEdge(2, 3);
        $detector->addEdge(3, 1);

        $hasCycle = $detector->hasCycle();
        $this->assertTrue($hasCycle);
    }

    public function testWouldCreateCycleInterception(): void
    {
        $detector = new CycleDetector();
        $detector->addEdge(10, 20);
        $detector->addEdge(20, 30);

        $wouldCycle = $detector->wouldCreateCycle(30, 10);
        $this->assertTrue($wouldCycle);

        $wouldNotCycle = $detector->wouldCreateCycle(30, 40);
        $this->assertFalse($wouldNotCycle);
    }
}
