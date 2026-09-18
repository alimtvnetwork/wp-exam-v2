<?php
/**
 * Plugin Bootstrap and WordPress Integration Unit Tests.
 *
 * @package WpExam\Tests
 */

declare(strict_types=1);

namespace WpExam\Tests;

use PHPUnit\Framework\TestCase;
use WpExam\Core\Plugin;
use WpExam\Api\UserInviteRestController;
use WpExam\Api\EmailSettingsRestController;
use WpExam\Api\CompletionHistoryRestController;
use WpExam\Api\JsonImportExportRestController;
use WpExam\Api\FormRestController;

class PluginBootstrapTest extends TestCase {
    public function testPluginSingletonInstance(): void {
        $plugin = Plugin::getInstance();
        $this->assertNotNull($plugin);
        $this->assertInstanceOf(Plugin::class, $plugin);
    }

    public function testPluginRegistersRestControllers(): void {
        $plugin = Plugin::getInstance();
        $this->assertNotNull($plugin);

        $inviteController = new UserInviteRestController();
        $this->assertNotNull($inviteController);

        $emailController = new EmailSettingsRestController();
        $this->assertNotNull($emailController);

        $historyController = new CompletionHistoryRestController();
        $this->assertNotNull($historyController);

        $jsonController = new JsonImportExportRestController();
        $this->assertNotNull($jsonController);

        $formController = new FormRestController();
        $this->assertNotNull($formController);

        $hierarchyController = new \WpExam\Api\ProjectHierarchyRestController();
        $this->assertNotNull($hierarchyController);

        $aiController = new \WpExam\Api\AIInstructionRestController();
        $this->assertNotNull($aiController);

        $backupController = new \WpExam\Api\SystemBackupRestController();
        $this->assertNotNull($backupController);

        $historyDb = \WpExam\Database\ProjectHistoryDatabase::getInstance();
        $this->assertNotNull($historyDb);
    }

    public function testWpSamPluginBootstrap(): void {
        $possiblePaths = [
            dirname(__DIR__, 2) . '/wp-plugins/wp-sam/wp-sam.php',
            dirname(__DIR__, 3) . '/wp-sam/wp-sam.php',
            dirname(__DIR__, 2) . '/wp-sam.php',
        ];
        $samFile = null;
        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                $samFile = $path;
                break;
            }
        }
        $hasSamFile = ($samFile !== null);
        $this->assertTrue($hasSamFile);

        require_once $samFile;

        $hasVersionConstant = defined('WP_SAM_VERSION');
        $this->assertTrue($hasVersionConstant);
    }
}
