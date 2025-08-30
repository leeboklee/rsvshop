import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const containerId = searchParams.get('container') || 'rsvshop-rsvshop-dev-1';

  // SSE 헤더 설정
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Docker 로그 명령어 실행
        const child = exec(`docker logs -f ${containerId}`, {
          maxBuffer: 1024 * 1024 * 10 // 10MB 버퍼
        });

        // stdout 스트림 처리
        child.stdout?.on('data', (data) => {
          const lines = data.toString().split('\n').filter(line => line.trim());
          lines.forEach(line => {
            const sseData = `data: ${JSON.stringify({
              timestamp: new Date().toISOString(),
              message: line,
              type: 'log'
            })}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          });
        });

        // stderr 스트림 처리
        child.stderr?.on('data', (data) => {
          const lines = data.toString().split('\n').filter(line => line.trim());
          lines.forEach(line => {
            const sseData = `data: ${JSON.stringify({
              timestamp: new Date().toISOString(),
              message: line,
              type: 'error'
            })}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          });
        });

        // 프로세스 종료 처리
        child.on('close', (code) => {
          const sseData = `data: ${JSON.stringify({
            timestamp: new Date().toISOString(),
            message: `Log stream ended with code: ${code}`,
            type: 'end'
          })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          controller.close();
        });

        // 에러 처리
        child.on('error', (error) => {
          const sseData = `data: ${JSON.stringify({
            timestamp: new Date().toISOString(),
            message: `Error: ${error.message}`,
            type: 'error'
          })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          controller.close();
        });

        // 클라이언트 연결 해제 시 프로세스 종료
        request.signal.addEventListener('abort', () => {
          child.kill();
          controller.close();
        });

      } catch (error) {
        const sseData = `data: ${JSON.stringify({
          timestamp: new Date().toISOString(),
          message: `Failed to start log stream: ${error}`,
          type: 'error'
        })}\n\n`;
        controller.enqueue(encoder.encode(sseData));
        controller.close();
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
} 