import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function isBypassedPath(pathname: string): boolean {
	return (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/favicon') ||
		pathname.startsWith('/robots.txt') ||
		pathname.startsWith('/sitemap.xml') ||
		pathname.startsWith('/assets') ||
		pathname.startsWith('/images') ||
		pathname.startsWith('/fonts') ||
		pathname.startsWith('/api')
	);
}

export function middleware(request: NextRequest) {
	// Vercel 환경에서는 포트 기반 라우팅을 사용하지 않음
	if (process.env.VERCEL) {
		return NextResponse.next();
	}

	// 개발 환경에서 HTTP → HTTPS 자동 리다이렉트
	if (process.env.NODE_ENV === 'development' && 
			process.env.NEXT_DEV_HTTPS === 'true' && 
			request.nextUrl.protocol === 'http:' &&
			request.nextUrl.hostname === 'localhost') {
		
		const httpsUrl = request.nextUrl.clone()
		httpsUrl.protocol = 'https:'
		
		return NextResponse.redirect(httpsUrl, 307)
	}

	const url = request.nextUrl;
	const host = request.headers.get('host') || '';

	// 정적/이미지/API는 우회
	if (isBypassedPath(url.pathname)) {
		return NextResponse.next();
	}

	// 로컬 개발 환경에서만 포트 기반 라우팅 적용
	if (host.includes('localhost') || host.includes('127.0.0.1')) {
		// 기본적으로 모든 경로 허용 (개발 환경)
		return NextResponse.next();
	}

	// 프로덕션 환경에서는 모든 경로 허용
	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
};
