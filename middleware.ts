import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// 기본 포트. 환경변수로 덮어쓸 수 있음
const ADMIN_PORT = process.env.ADMIN_PORT || '4900';
const CUSTOMER_PORT = process.env.CUSTOMER_PORT || '5990';

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

	// 4900 → 루트는 대시보드, /admin, /hotel-admin, /customer, /shop 등 허용
	if (host.endsWith(`:${ADMIN_PORT}`)) {
		// 루트 경로(/)는 그대로 두고 대시보드로 렌더링
		if (url.pathname === '/') {
			return NextResponse.next();
		}
		// 허용된 경로들: /admin, /hotel-admin, /customer, /shop, /reservations, /payment, /auth 등
		if (
			url.pathname.startsWith('/admin') ||
			url.pathname.startsWith('/hotel-admin') ||
			url.pathname.startsWith('/customer') ||
			url.pathname.startsWith('/shop') ||
			url.pathname.startsWith('/reservations') ||
			url.pathname.startsWith('/payment') ||
			url.pathname.startsWith('/auth') ||
			url.pathname.startsWith('/site') ||
			url.pathname.startsWith('/widget') ||
			url.pathname.startsWith('/test-error')
		) {
			return NextResponse.next();
		}
		// 그 외 경로는 /admin으로 리다이렉트
		url.pathname = '/admin';
		return NextResponse.redirect(url);
	}

	// 5990 → /hotel-admin, /customer 전용 (기본 진입은 /hotel-admin로 유도)
	if (host.endsWith(`:${CUSTOMER_PORT}`)) {
		if (
			!url.pathname.startsWith('/hotel-admin') &&
			!url.pathname.startsWith('/customer')
		) {
			url.pathname = '/hotel-admin';
			return NextResponse.redirect(url);
		}
		return NextResponse.next();
	}

	// 그 외 포트는 변경하지 않음
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
