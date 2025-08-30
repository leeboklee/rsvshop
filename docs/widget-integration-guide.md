# 예약 위젯 연동 가이드

다른 프로젝트에서 RSVShop 예약 시스템을 쉽게 연동할 수 있는 방법들을 설명합니다.

## 1. iframe 방식 (가장 간단)

### 기본 사용법
```html
<iframe 
  src="http://localhost:3900/widget" 
  width="100%" 
  height="800px" 
  frameborder="0"
  scrolling="no">
</iframe>
```

### 반응형 iframe
```html
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe 
    src="http://localhost:3900/widget" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    scrolling="no">
  </iframe>
</div>
```

### WordPress에서 사용
```php
// WordPress 페이지나 포스트에 추가
[iframe src="http://localhost:3900/widget" width="100%" height="800"]

// 또는 PHP 코드로
<?php
echo '<iframe src="http://localhost:3900/widget" width="100%" height="800" frameborder="0"></iframe>';
?>
```

## 2. JavaScript 위젯 방식

### 기본 위젯 코드
```html
<!DOCTYPE html>
<html>
<head>
    <title>호텔 예약</title>
    <style>
        .reservation-widget {
            max-width: 800px;
            margin: 0 auto;
            font-family: Arial, sans-serif;
        }
        .widget-container {
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
        }
        .widget-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .widget-content {
            padding: 20px;
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
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        .btn {
            background: #667eea;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
        }
        .btn:hover {
            background: #5a6fd8;
        }
        .room-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .booking-list {
            margin-top: 20px;
        }
        .booking-item {
            border: 1px solid #eee;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="reservation-widget">
        <div class="widget-container">
            <div class="widget-header">
                <h1>🏨 호텔 예약</h1>
                <p>편리한 온라인 예약 시스템</p>
            </div>
            
            <div class="widget-content">
                <!-- 객실 정보 -->
                <div class="room-info">
                    <h3>객실 정보</h3>
                    <div id="rooms-container">로딩 중...</div>
                </div>

                <!-- 예약 폼 -->
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

                    <button type="submit" class="btn">예약하기</button>
                </form>

                <!-- 예약 목록 -->
                <div class="booking-list">
                    <h3>최근 예약</h3>
                    <div id="bookings-container">로딩 중...</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // API 설정
        const API_BASE_URL = 'http://localhost:3900';
        const API_KEY = 'your-api-key-here';

        // 객실 데이터 (실제로는 API에서 가져옴)
        const rooms = [
            {
                id: '1',
                name: '디럭스 룸',
                description: '편안한 디럭스 룸',
                capacity: 2,
                packages: [
                    { id: '1', name: '기본 패키지', price: 100000 },
                    { id: '2', name: '프리미엄 패키지', price: 150000 }
                ]
            },
            {
                id: '2',
                name: '스위트 룸',
                description: '고급스러운 스위트 룸',
                capacity: 4,
                packages: [
                    { id: '3', name: '기본 패키지', price: 200000 },
                    { id: '4', name: '럭셔리 패키지', price: 300000 }
                ]
            }
        ];

        // 객실 목록 표시
        function displayRooms() {
            const roomsContainer = document.getElementById('rooms-container');
            const roomSelect = document.getElementById('room-select');
            
            roomsContainer.innerHTML = '';
            roomSelect.innerHTML = '<option value="">객실을 선택하세요</option>';
            
            rooms.forEach(room => {
                // 객실 정보 표시
                const roomDiv = document.createElement('div');
                roomDiv.innerHTML = `
                    <h4>${room.name}</h4>
                    <p>${room.description} (수용인원: ${room.capacity}명)</p>
                    <p>패키지: ${room.packages.map(p => p.name).join(', ')}</p>
                `;
                roomsContainer.appendChild(roomDiv);
                
                // 객실 선택 옵션 추가
                const option = document.createElement('option');
                option.value = room.id;
                option.textContent = room.name;
                roomSelect.appendChild(option);
            });
        }

        // 패키지 목록 업데이트
        function updatePackages(roomId) {
            const packageSelect = document.getElementById('package-select');
            packageSelect.innerHTML = '<option value="">패키지를 선택하세요</option>';
            
            const room = rooms.find(r => r.id === roomId);
            if (room) {
                room.packages.forEach(pkg => {
                    const option = document.createElement('option');
                    option.value = pkg.id;
                    option.textContent = `${pkg.name} - ${pkg.price.toLocaleString()}원`;
                    packageSelect.appendChild(option);
                });
            }
        }

        // 예약 목록 표시
        function displayBookings() {
            const bookingsContainer = document.getElementById('bookings-container');
            
            // 샘플 예약 데이터
            const bookings = [
                {
                    guestName: '홍길동',
                    checkInDate: '2024-01-15',
                    checkOutDate: '2024-01-17',
                    status: '확정',
                    totalAmount: 150000
                },
                {
                    guestName: '김철수',
                    checkInDate: '2024-01-20',
                    checkOutDate: '2024-01-22',
                    status: '대기',
                    totalAmount: 200000
                }
            ];
            
            bookingsContainer.innerHTML = '';
            bookings.forEach(booking => {
                const bookingDiv = document.createElement('div');
                bookingDiv.className = 'booking-item';
                bookingDiv.innerHTML = `
                    <h4>${booking.guestName}</h4>
                    <p>${booking.checkInDate} ~ ${booking.checkOutDate}</p>
                    <p>상태: ${booking.status}</p>
                    <p>금액: ${booking.totalAmount.toLocaleString()}원</p>
                `;
                bookingsContainer.appendChild(bookingDiv);
            });
        }

        // 예약 생성
        async function createBooking(bookingData) {
            try {
                // 실제로는 API 호출
                console.log('예약 데이터:', bookingData);
                
                // 성공 시뮬레이션
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                alert('예약이 성공적으로 생성되었습니다!');
                document.getElementById('booking-form').reset();
                displayBookings();
            } catch (error) {
                alert('예약 생성 중 오류가 발생했습니다.');
            }
        }

        // 이벤트 리스너 설정
        document.addEventListener('DOMContentLoaded', function() {
            displayRooms();
            displayBookings();

            // 객실 선택 시 패키지 업데이트
            document.getElementById('room-select').addEventListener('change', function() {
                updatePackages(this.value);
            });

            // 예약 폼 제출
            document.getElementById('booking-form').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = {
                    roomId: document.getElementById('room-select').value,
                    packageId: document.getElementById('package-select').value,
                    checkInDate: document.getElementById('checkin-date').value,
                    checkOutDate: document.getElementById('checkout-date').value,
                    customerName: document.getElementById('customer-name').value,
                    customerEmail: document.getElementById('customer-email').value,
                    customerPhone: document.getElementById('customer-phone').value,
                    guestCount: parseInt(document.getElementById('guest-count').value)
                };

                createBooking(formData);
            });
        });
    </script>
</body>
</html>
```

## 3. React 컴포넌트 방식

```jsx
import React, { useState, useEffect } from 'react';

const ReservationWidget = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    guestCount: 1
  });

  useEffect(() => {
    // API에서 객실 데이터 가져오기
    loadRooms();
  }, []);

  const loadRooms = async () => {
    // 실제 API 호출
    const sampleRooms = [
      {
        id: '1',
        name: '디럭스 룸',
        description: '편안한 디럭스 룸',
        packages: [
          { id: '1', name: '기본 패키지', price: 100000 },
          { id: '2', name: '프리미엄 패키지', price: 150000 }
        ]
      }
    ];
    setRooms(sampleRooms);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 예약 생성 로직
    console.log('예약 데이터:', { ...formData, roomId: selectedRoom, packageId: selectedPackage });
  };

  return (
    <div className="reservation-widget">
      <h2>🏨 호텔 예약</h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>객실 선택:</label>
          <select 
            value={selectedRoom} 
            onChange={(e) => setSelectedRoom(e.target.value)}
            required
          >
            <option value="">객실을 선택하세요</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>체크인:</label>
          <input
            type="date"
            value={formData.checkInDate}
            onChange={(e) => setFormData({...formData, checkInDate: e.target.value})}
            required
          />
        </div>

        <div>
          <label>체크아웃:</label>
          <input
            type="date"
            value={formData.checkOutDate}
            onChange={(e) => setFormData({...formData, checkOutDate: e.target.value})}
            required
          />
        </div>

        <div>
          <label>고객명:</label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => setFormData({...formData, customerName: e.target.value})}
            required
          />
        </div>

        <button type="submit">예약하기</button>
      </form>
    </div>
  );
};

export default ReservationWidget;
```

## 4. WordPress 플러그인 방식

```php
<?php
/*
Plugin Name: RSVShop 예약 위젯
Description: RSVShop 예약 시스템을 WordPress에 연동
Version: 1.0
*/

// 숏코드 등록
add_shortcode('rsvshop_widget', 'rsvshop_widget_shortcode');

function rsvshop_widget_shortcode($atts) {
    $atts = shortcode_atts(array(
        'width' => '100%',
        'height' => '800px'
    ), $atts);
    
    return sprintf(
        '<iframe src="%s/widget" width="%s" height="%s" frameborder="0" scrolling="no"></iframe>',
        esc_url(get_option('rsvshop_api_url', 'http://localhost:3900')),
        esc_attr($atts['width']),
        esc_attr($atts['height'])
    );
}

// 관리자 메뉴 추가
add_action('admin_menu', 'rsvshop_admin_menu');

function rsvshop_admin_menu() {
    add_options_page(
        'RSVShop 설정',
        'RSVShop',
        'manage_options',
        'rsvshop-settings',
        'rsvshop_settings_page'
    );
}

function rsvshop_settings_page() {
    if (isset($_POST['submit'])) {
        update_option('rsvshop_api_url', sanitize_text_field($_POST['api_url']));
        update_option('rsvshop_api_key', sanitize_text_field($_POST['api_key']));
        echo '<div class="updated"><p>설정이 저장되었습니다.</p></div>';
    }
    
    $api_url = get_option('rsvshop_api_url', 'http://localhost:3900');
    $api_key = get_option('rsvshop_api_key', '');
    
    ?>
    <div class="wrap">
        <h2>RSVShop 설정</h2>
        <form method="post">
            <table class="form-table">
                <tr>
                    <th>API URL:</th>
                    <td>
                        <input type="url" name="api_url" value="<?php echo esc_attr($api_url); ?>" class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th>API 키:</th>
                    <td>
                        <input type="text" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" />
                    </td>
                </tr>
            </table>
            <p class="submit">
                <input type="submit" name="submit" class="button-primary" value="설정 저장" />
            </p>
        </form>
        
        <h3>사용법</h3>
        <p>페이지나 포스트에 다음 숏코드를 추가하세요:</p>
        <code>[rsvshop_widget]</code>
        
        <p>크기를 조정하려면:</p>
        <code>[rsvshop_widget width="800px" height="600px"]</code>
    </div>
    <?php
}
?>
```

## 5. 사용 방법 요약

### 가장 간단한 방법 (iframe)
```html
<!-- 다른 웹사이트에 추가 -->
<iframe src="http://localhost:3900/widget" width="100%" height="800" frameborder="0"></iframe>
```

### WordPress에서 사용
```php
// 플러그인 설치 후
[rsvshop_widget]
```

### React 앱에서 사용
```jsx
import ReservationWidget from './components/ReservationWidget';

function App() {
  return (
    <div>
      <h1>우리 호텔</h1>
      <ReservationWidget />
    </div>
  );
}
```

## 6. 장단점 비교

| 방식 | 장점 | 단점 |
|------|------|------|
| iframe | 구현 간단, 독립적 | SEO 불리, 커스터마이징 제한 |
| JavaScript | 커스터마이징 자유로움 | 구현 복잡, API 연동 필요 |
| React 컴포넌트 | 재사용성 높음, 상태 관리 용이 | React 환경 필요 |
| WordPress 플러그인 | WordPress 최적화 | WordPress 환경에서만 사용 |

## 7. 추천 방법

1. **빠른 연동**: iframe 방식
2. **커스터마이징**: JavaScript 위젯
3. **React 프로젝트**: React 컴포넌트
4. **WordPress**: 플러그인 방식

현재 상황에서는 **iframe 방식**이 가장 간단하고 빠르게 연동할 수 있는 방법입니다! 