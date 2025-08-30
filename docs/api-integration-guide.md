# API 통합 가이드

이 문서는 외부 페이지에서 RSVShop 예약 시스템의 API를 사용하는 방법을 설명합니다.

## 개요

RSVShop은 RESTful API를 통해 예약 관리 기능을 외부 시스템에 제공합니다. API 키 기반 인증을 사용하여 안전한 접근을 보장합니다.

## 인증

### API 키 발급

1. 관리자 페이지에서 `/admin/api-keys`로 접속
2. "새 키 생성" 버튼 클릭
3. API 키 이름과 필요한 권한 선택
4. 생성된 API 키를 안전한 곳에 저장

### API 키 사용 방법

#### 방법 1: URL 파라미터로 전달
```
GET /api/external/reservations?apiKey=YOUR_API_KEY
```

#### 방법 2: Authorization 헤더로 전달
```
GET /api/external/reservations
Authorization: Bearer YOUR_API_KEY
```

## API 엔드포인트

### 1. 예약 관리

#### 예약 목록 조회
```http
GET /api/external/reservations
```

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)
- `search`: 검색어 (고객명, 이메일, 전화번호)
- `status`: 예약 상태 (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- `startDate`: 시작 날짜 (YYYY-MM-DD)
- `endDate`: 종료 날짜 (YYYY-MM-DD)

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking-id",
        "guestName": "홍길동",
        "guestEmail": "hong@example.com",
        "guestPhone": "010-1234-5678",
        "checkInDate": "2024-01-15T00:00:00.000Z",
        "checkOutDate": "2024-01-17T00:00:00.000Z",
        "status": "CONFIRMED",
        "totalAmount": 150000,
        "guestCount": 2,
        "room": {
          "id": "room-id",
          "name": "디럭스 룸",
          "description": "편안한 디럭스 룸"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### 예약 생성
```http
POST /api/external/reservations
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY
```

**요청 본문:**
```json
{
  "customerName": "홍길동",
  "customerEmail": "hong@example.com",
  "customerPhone": "010-1234-5678",
  "roomId": "room-id",
  "selectedPackages": ["package-id-1", "package-id-2"],
  "checkInDate": "2024-01-15",
  "checkOutDate": "2024-01-17",
  "totalPrice": 150000,
  "specialRequests": "조용한 방으로 부탁드립니다",
  "guestCount": 2,
  "memo": "VIP 고객",
  "source": "EXTERNAL_API"
}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "new-booking-id",
    "guestName": "홍길동",
    "status": "CONFIRMED",
    "totalAmount": 150000
  },
  "message": "예약이 성공적으로 생성되었습니다."
}
```

### 2. 객실 관리

#### 객실 목록 조회
```http
GET /api/external/rooms
```

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "id": "room-id",
      "name": "디럭스 룸",
      "description": "편안한 디럭스 룸",
      "capacity": 2,
      "imageUrl": "https://example.com/room-image.jpg",
      "packages": [
        {
          "id": "package-id",
          "name": "기본 패키지",
          "description": "기본 숙박 패키지",
          "price": 100000
        }
      ]
    }
  ]
}
```

### 3. 패키지 관리

#### 패키지 목록 조회
```http
GET /api/external/packages
```

**쿼리 파라미터:**
- `roomId`: 특정 객실의 패키지만 조회

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "id": "package-id",
      "name": "기본 패키지",
      "description": "기본 숙박 패키지",
      "price": 100000,
      "roomId": "room-id",
      "room": {
        "id": "room-id",
        "name": "디럭스 룸",
        "description": "편안한 디럭스 룸"
      }
    }
  ]
}
```

## 권한 시스템

API 키는 다음과 같은 권한을 가질 수 있습니다:

- `reservations.read`: 예약 조회 권한
- `reservations.write`: 예약 생성/수정 권한
- `rooms.read`: 객실 정보 조회 권한
- `packages.read`: 패키지 정보 조회 권한

## 에러 처리

### 일반적인 에러 응답
```json
{
  "success": false,
  "error": "에러 메시지"
}
```

### HTTP 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패 (API 키 누락 또는 유효하지 않음)
- `403`: 권한 없음
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 오류

## 실제 사용 예시

### 1. 다른 웹사이트에 예약 위젯 추가

#### HTML + JavaScript
```html
<!DOCTYPE html>
<html>
<head>
    <title>호텔 예약</title>
    <style>
        .reservation-widget {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 8px;
            max-width: 400px;
        }
        .room-item {
            border: 1px solid #eee;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .booking-form {
            margin-top: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .form-group input, .form-group select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .btn {
            background: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .btn:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="reservation-widget">
        <h2>🏨 호텔 예약</h2>
        
        <!-- 객실 목록 -->
        <div id="rooms-list">
            <h3>객실 목록</h3>
            <div id="rooms-container">로딩 중...</div>
        </div>

        <!-- 예약 폼 -->
        <div class="booking-form">
            <h3>예약하기</h3>
            <form id="booking-form">
                <div class="form-group">
                    <label>객실 선택:</label>
                    <select id="room-select" required>
                        <option value="">객실을 선택하세요</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>패키지 선택:</label>
                    <select id="package-select" required>
                        <option value="">패키지를 선택하세요</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>체크인 날짜:</label>
                    <input type="date" id="checkin-date" required>
                </div>
                <div class="form-group">
                    <label>체크아웃 날짜:</label>
                    <input type="date" id="checkout-date" required>
                </div>
                <div class="form-group">
                    <label>고객명:</label>
                    <input type="text" id="customer-name" required>
                </div>
                <div class="form-group">
                    <label>이메일:</label>
                    <input type="email" id="customer-email" required>
                </div>
                <div class="form-group">
                    <label>전화번호:</label>
                    <input type="tel" id="customer-phone" required>
                </div>
                <div class="form-group">
                    <label>투숙객 수:</label>
                    <input type="number" id="guest-count" min="1" value="1" required>
                </div>
                <div class="form-group">
                    <label>특별 요청사항:</label>
                    <textarea id="special-requests" rows="3"></textarea>
                </div>
                <button type="submit" class="btn">예약하기</button>
            </form>
        </div>

        <!-- 예약 목록 -->
        <div id="bookings-list">
            <h3>최근 예약</h3>
            <div id="bookings-container">로딩 중...</div>
        </div>
    </div>

    <script>
        // API 설정
        const API_BASE_URL = 'http://localhost:3900'; // 실제 도메인으로 변경
        const API_KEY = 'your-api-key-here'; // 실제 API 키로 변경

        // 객실 목록 로드
        async function loadRooms() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/external/rooms?apiKey=${API_KEY}`);
                const data = await response.json();
                
                if (data.success) {
                    const roomsContainer = document.getElementById('rooms-container');
                    const roomSelect = document.getElementById('room-select');
                    
                    roomsContainer.innerHTML = '';
                    roomSelect.innerHTML = '<option value="">객실을 선택하세요</option>';
                    
                    data.data.forEach(room => {
                        // 객실 목록 표시
                        const roomDiv = document.createElement('div');
                        roomDiv.className = 'room-item';
                        roomDiv.innerHTML = `
                            <h4>${room.name}</h4>
                            <p>${room.description}</p>
                            <p>수용 인원: ${room.capacity}명</p>
                            <p>패키지: ${room.packages.length}개</p>
                        `;
                        roomsContainer.appendChild(roomDiv);
                        
                        // 객실 선택 옵션 추가
                        const option = document.createElement('option');
                        option.value = room.id;
                        option.textContent = room.name;
                        roomSelect.appendChild(option);
                    });
                }
            } catch (error) {
                console.error('객실 목록 로드 실패:', error);
            }
        }

        // 패키지 목록 로드
        async function loadPackages(roomId) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/external/packages?apiKey=${API_KEY}&roomId=${roomId}`);
                const data = await response.json();
                
                if (data.success) {
                    const packageSelect = document.getElementById('package-select');
                    packageSelect.innerHTML = '<option value="">패키지를 선택하세요</option>';
                    
                    data.data.forEach(pkg => {
                        const option = document.createElement('option');
                        option.value = pkg.id;
                        option.textContent = `${pkg.name} - ${pkg.price.toLocaleString()}원`;
                        packageSelect.appendChild(option);
                    });
                }
            } catch (error) {
                console.error('패키지 목록 로드 실패:', error);
            }
        }

        // 예약 목록 로드
        async function loadBookings() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/external/reservations?apiKey=${API_KEY}&limit=5`);
                const data = await response.json();
                
                if (data.success) {
                    const bookingsContainer = document.getElementById('bookings-container');
                    bookingsContainer.innerHTML = '';
                    
                    data.data.bookings.forEach(booking => {
                        const bookingDiv = document.createElement('div');
                        bookingDiv.className = 'room-item';
                        bookingDiv.innerHTML = `
                            <h4>${booking.guestName}</h4>
                            <p>체크인: ${new Date(booking.checkInDate).toLocaleDateString()}</p>
                            <p>체크아웃: ${new Date(booking.checkOutDate).toLocaleDateString()}</p>
                            <p>상태: ${booking.status}</p>
                            <p>금액: ${booking.totalAmount.toLocaleString()}원</p>
                        `;
                        bookingsContainer.appendChild(bookingDiv);
                    });
                }
            } catch (error) {
                console.error('예약 목록 로드 실패:', error);
            }
        }

        // 예약 생성
        async function createBooking(bookingData) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/external/reservations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`
                    },
                    body: JSON.stringify(bookingData)
                });
                
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('예약 생성 실패:', error);
                throw error;
            }
        }

        // 이벤트 리스너 설정
        document.addEventListener('DOMContentLoaded', function() {
            // 초기 데이터 로드
            loadRooms();
            loadBookings();

            // 객실 선택 시 패키지 로드
            document.getElementById('room-select').addEventListener('change', function() {
                const roomId = this.value;
                if (roomId) {
                    loadPackages(roomId);
                }
            });

            // 예약 폼 제출
            document.getElementById('booking-form').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = {
                    customerName: document.getElementById('customer-name').value,
                    customerEmail: document.getElementById('customer-email').value,
                    customerPhone: document.getElementById('customer-phone').value,
                    roomId: document.getElementById('room-select').value,
                    selectedPackages: [document.getElementById('package-select').value],
                    checkInDate: document.getElementById('checkin-date').value,
                    checkOutDate: document.getElementById('checkout-date').value,
                    guestCount: parseInt(document.getElementById('guest-count').value),
                    specialRequests: document.getElementById('special-requests').value,
                    totalPrice: 0, // 실제로는 선택된 패키지의 가격을 계산해야 함
                    source: 'EXTERNAL_WIDGET'
                };

                try {
                    const result = await createBooking(formData);
                    if (result.success) {
                        alert('예약이 성공적으로 생성되었습니다!');
                        this.reset();
                        loadBookings(); // 예약 목록 새로고침
                    } else {
                        alert('예약 생성 실패: ' + result.error);
                    }
                } catch (error) {
                    alert('예약 생성 중 오류가 발생했습니다.');
                }
            });
        });
    </script>
</body>
</html>
```

### 2. React 앱에서 사용

```jsx
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3900';
const API_KEY = 'your-api-key-here';

function ReservationWidget() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
    loadBookings();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/external/rooms?apiKey=${API_KEY}`);
      const data = await response.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch (error) {
      console.error('객실 로드 실패:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/external/reservations?apiKey=${API_KEY}&limit=5`);
      const data = await response.json();
      if (data.success) {
        setBookings(data.data.bookings);
      }
    } catch (error) {
      console.error('예약 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="reservation-widget">
      <h2>🏨 호텔 예약</h2>
      
      <div className="rooms-section">
        <h3>객실 목록</h3>
        {rooms.map(room => (
          <div key={room.id} className="room-item">
            <h4>{room.name}</h4>
            <p>{room.description}</p>
            <p>수용 인원: {room.capacity}명</p>
          </div>
        ))}
      </div>

      <div className="bookings-section">
        <h3>최근 예약</h3>
        {bookings.map(booking => (
          <div key={booking.id} className="booking-item">
            <h4>{booking.guestName}</h4>
            <p>체크인: {new Date(booking.checkInDate).toLocaleDateString()}</p>
            <p>상태: {booking.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReservationWidget;
```

### 3. WordPress 플러그인으로 사용

```php
<?php
/*
Plugin Name: RSVShop 예약 위젯
Description: RSVShop API를 사용한 예약 위젯
Version: 1.0
*/

class RSVShopWidget extends WP_Widget {
    public function __construct() {
        parent::__construct(
            'rsvshop_widget',
            'RSVShop 예약 위젯',
            array('description' => 'RSVShop API를 사용한 예약 위젯')
        );
    }

    public function widget($args, $instance) {
        echo $args['before_widget'];
        echo $args['before_title'] . '호텔 예약' . $args['after_title'];
        
        // API 호출
        $api_key = get_option('rsvshop_api_key');
        $api_url = get_option('rsvshop_api_url');
        
        if ($api_key && $api_url) {
            $rooms = $this->get_rooms($api_url, $api_key);
            $bookings = $this->get_bookings($api_url, $api_key);
            
            echo '<div class="rsvshop-widget">';
            echo '<h3>객실 목록</h3>';
            foreach ($rooms as $room) {
                echo '<div class="room-item">';
                echo '<h4>' . esc_html($room['name']) . '</h4>';
                echo '<p>' . esc_html($room['description']) . '</p>';
                echo '</div>';
            }
            echo '</div>';
        }
        
        echo $args['after_widget'];
    }

    private function get_rooms($api_url, $api_key) {
        $response = wp_remote_get($api_url . '/api/external/rooms?apiKey=' . $api_key);
        if (is_wp_error($response)) {
            return array();
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        return $data['success'] ? $data['data'] : array();
    }

    private function get_bookings($api_url, $api_key) {
        $response = wp_remote_get($api_url . '/api/external/reservations?apiKey=' . $api_key . '&limit=5');
        if (is_wp_error($response)) {
            return array();
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        return $data['success'] ? $data['data']['bookings'] : array();
    }
}

// 위젯 등록
add_action('widgets_init', function() {
    register_widget('RSVShopWidget');
});
?>
```

## 다른 프로젝트에 API 키 전달 방법

### 1. API 키 전달 방법

#### 방법 1: 직접 전달
```javascript
// 개발자에게 직접 전달
const API_KEY = 'abc123def456ghi789'; // 실제 API 키
```

#### 방법 2: 환경 변수 사용
```javascript
// .env 파일에 저장
REACT_APP_RSVSHOP_API_KEY=abc123def456ghi789
REACT_APP_RSVSHOP_API_URL=http://localhost:3900

// 사용
const API_KEY = process.env.REACT_APP_RSVSHOP_API_KEY;
const API_URL = process.env.REACT_APP_RSVSHOP_API_URL;
```

#### 방법 3: 설정 파일 사용
```javascript
// config.js
export const RSVSHOP_CONFIG = {
    API_KEY: 'abc123def456ghi789',
    API_URL: 'http://localhost:3900',
    PERMISSIONS: ['reservations.read', 'reservations.write']
};
```

### 2. 보안 고려사항

1. **클라이언트 사이드 노출 방지**
   - API 키를 클라이언트 사이드 코드에 직접 노출하지 마세요
   - 서버 사이드에서 API 호출을 처리하세요

2. **도메인 제한**
   - API 키 생성 시 특정 도메인에서만 사용하도록 제한하세요

3. **정기적인 키 교체**
   - 보안을 위해 정기적으로 API 키를 교체하세요

### 3. 연동 체크리스트

- [ ] API 키 발급 완료
- [ ] 필요한 권한 설정 확인
- [ ] API 엔드포인트 테스트
- [ ] 에러 처리 구현
- [ ] 보안 설정 확인
- [ ] 문서 전달 완료

## 지원 및 문의

API 사용 중 문제가 발생하면 관리자에게 문의하세요. 