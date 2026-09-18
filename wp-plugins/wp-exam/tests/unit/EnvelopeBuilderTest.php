<?php
/**
 * Unit Test for EnvelopeBuilder.
 *
 * @package WpExam\Tests
 */

namespace WpExam\Tests;

use PHPUnit\Framework\TestCase;
use WpExam\Helpers\EnvelopeBuilder;
use WpExam\Enums\HttpStatusType;
use WpExam\Enums\ResponseMessageType;

require_once dirname(__DIR__, 2) . '/includes/Autoloader.php';

class EnvelopeBuilderTest extends TestCase {
    public function testCreateSuccessEnvelopeHasCorrectStructure(): void {
        $payload = ['id' => 1, 'title' => 'Sample Form'];
        $builder = EnvelopeBuilder::createSuccess($payload, HttpStatusType::Ok->value, ResponseMessageType::Ok->value);
        $envelope = $builder->build();

        $this->assertArrayHasKey('Status', $envelope);
        $this->assertArrayHasKey('Attributes', $envelope);
        $this->assertArrayHasKey('Results', $envelope);

        $this->assertTrue($envelope['Status']['IsSuccess']);
        $this->assertFalse($envelope['Status']['IsFailed']);
        $this->assertEquals(200, $envelope['Status']['Code']);
        $this->assertEquals('OK', $envelope['Status']['Message']);
    }

    public function testCreateErrorEnvelopeIncludesErrors(): void {
        $errors = [['field' => 'GuestEmail', 'message' => 'Email is invalid']];
        $builder = EnvelopeBuilder::createError('Validation failed', HttpStatusType::BadRequest->value, $errors);
        $envelope = $builder->build();

        $this->assertFalse($envelope['Status']['IsSuccess']);
        $this->assertTrue($envelope['Status']['IsFailed']);
        $this->assertEquals(400, $envelope['Status']['Code']);
        $this->assertTrue($envelope['Attributes']['HasAnyErrors']);
        $this->assertArrayHasKey('Errors', $envelope);
        $this->assertCount(1, $envelope['Errors']);
    }
}
