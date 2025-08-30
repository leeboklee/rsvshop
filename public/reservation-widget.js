// RSVShop Web Component - 완전 격리된 예약 위젯
class RsvShopWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.apiKey = this.getAttribute('api-key') || '';
    this.apiUrl = this.getAttribute('api-url') || 'http://localhost:3900';
    this.rooms = [];
    this.packages = [];
    this.loading = false;
  }

  connectedCallback() {
    this.render();
    this.loadData();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .rsvshop-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .rsvshop-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          text-align: center;
        }

        .rsvshop-header h2 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .rsvshop-header p {
          opacity: 0.9;
          font-size: 14px;
        }

        .rsvshop-content {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }

        .form-control {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
        }

        .form-control:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          width: 100%;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .loading {
          text-align: center;
          padding: 20px;
          color: #6b7280;
        }

        .error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #16a34a;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .room-card {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .room-card:hover {
          border-color: #667eea;
        }

        .room-card.selected {
          border-color: #667eea;
          background: #f8fafc;
        }

        .room-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .room-price {
          color: #667eea;
          font-weight: 600;
        }

        .package-select {
          margin-top: 12px;
        }

        .package-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .package-option:last-child {
          border-bottom: none;
        }

        .package-name {
          font-weight: 500;
        }

        .package-price {
          color: #667eea;
          font-weight: 600;
        }

        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .rsvshop-content {
            padding: 16px;
          }
        }
      </style>

      <div class="rsvshop-container">
        <div class="rsvshop-header">
          <h2>🏨 RSVShop 예약</h2>
          <p>간편한 온라인 예약 시스템</p>
        </div>
        
        <div class="rsvshop-content">
          <div id="loading" class="loading" style="display: none;">
            데이터를 불러오는 중...
          </div>
          
          <div id="error" class="error" style="display: none;"></div>
          <div id="success" class="success" style="display: none;"></div>
          
          <form id="reservation-form">
            <div class="form-row">
              <div class="form-group">
                <label for="checkIn">체크인</label>
                <input type="date" id="checkIn" class="form-control" required>
              </div>
              <div class="form-group">
                <label for="checkOut">체크아웃</label>
                <input type="date" id="checkOut" class="form-control" required>
              </div>
            </div>
            
            <div class="form-group">
              <label>객실 선택</label>
              <div id="rooms-container"></div>
            </div>
            
            <div class="form-group">
              <label>패키지 선택</label>
              <div id="packages-container"></div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="guestName">예약자명</label>
                <input type="text" id="guestName" class="form-control" required>
              </div>
              <div class="form-group">
                <label for="guestPhone">연락처</label>
                <input type="tel" id="guestPhone" class="form-control" required>
              </div>
            </div>
            
            <div class="form-group">
              <label for="guestEmail">이메일</label>
              <input type="email" id="guestEmail" class="form-control" required>
            </div>
            
            <div class="form-group">
              <label for="specialRequests">특별 요청사항</label>
              <textarea id="specialRequests" class="form-control" rows="3" placeholder="추가 요청사항이 있으시면 입력해주세요"></textarea>
            </div>
            
            <button type="submit" class="btn" id="submit-btn">
              예약하기
            </button>
          </form>
        </div>
      </div>
    `;
  }

  async loadData() {
    this.showLoading(true);
    
    try {
      // 객실 데이터 로드
      const roomsResponse = await fetch(`${this.apiUrl}/api/external/rooms`, {
        headers: {
          'X-API-Key': this.apiKey
        }
      });
      
      if (!roomsResponse.ok) {
        throw new Error('객실 데이터를 불러올 수 없습니다.');
      }
      
      this.rooms = await roomsResponse.json();
      
      // 패키지 데이터 로드
      const packagesResponse = await fetch(`${this.apiUrl}/api/external/packages`, {
        headers: {
          'X-API-Key': this.apiKey
        }
      });
      
      if (!packagesResponse.ok) {
        throw new Error('패키지 데이터를 불러올 수 없습니다.');
      }
      
      this.packages = await packagesResponse.json();
      
      this.renderRooms();
      this.renderPackages();
      
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.showLoading(false);
    }
  }

  renderRooms() {
    const container = this.shadowRoot.getElementById('rooms-container');
    container.innerHTML = this.rooms.map(room => `
      <div class="room-card" data-room-id="${room.id}">
        <div class="room-name">${room.name}</div>
        <div class="room-price">₩${room.price.toLocaleString()}/박</div>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
          ${room.description || '상세 정보 없음'}
        </div>
      </div>
    `).join('');
  }

  renderPackages() {
    const container = this.shadowRoot.getElementById('packages-container');
    container.innerHTML = this.packages.map(pkg => `
      <div class="package-option">
        <div class="package-name">${pkg.name}</div>
        <div class="package-price">₩${pkg.price.toLocaleString()}</div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    const form = this.shadowRoot.getElementById('reservation-form');
    const roomsContainer = this.shadowRoot.getElementById('rooms-container');
    
    // 객실 선택
    roomsContainer.addEventListener('click', (e) => {
      const roomCard = e.target.closest('.room-card');
      if (roomCard) {
        this.shadowRoot.querySelectorAll('.room-card').forEach(card => {
          card.classList.remove('selected');
        });
        roomCard.classList.add('selected');
      }
    });
    
    // 폼 제출
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.submitReservation();
    });
    
    // 날짜 유효성 검사
    const checkIn = this.shadowRoot.getElementById('checkIn');
    const checkOut = this.shadowRoot.getElementById('checkOut');
    
    checkIn.addEventListener('change', () => {
      const checkInDate = new Date(checkIn.value);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      checkOut.min = tomorrow.toISOString().split('T')[0];
    });
  }

  async submitReservation() {
    const selectedRoom = this.shadowRoot.querySelector('.room-card.selected');
    if (!selectedRoom) {
      this.showError('객실을 선택해주세요.');
      return;
    }

    const formData = {
      roomId: selectedRoom.dataset.roomId,
      checkIn: this.shadowRoot.getElementById('checkIn').value,
      checkOut: this.shadowRoot.getElementById('checkOut').value,
      guestName: this.shadowRoot.getElementById('guestName').value,
      guestPhone: this.shadowRoot.getElementById('guestPhone').value,
      guestEmail: this.shadowRoot.getElementById('guestEmail').value,
      specialRequests: this.shadowRoot.getElementById('specialRequests').value,
      source: 'WIDGET'
    };

    this.showLoading(true);
    
    try {
      const response = await fetch(`${this.apiUrl}/api/external/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '예약 생성에 실패했습니다.');
      }

      const result = await response.json();
      this.showSuccess('예약이 성공적으로 완료되었습니다!');
      this.resetForm();
      
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.showLoading(false);
    }
  }

  resetForm() {
    this.shadowRoot.getElementById('reservation-form').reset();
    this.shadowRoot.querySelectorAll('.room-card').forEach(card => {
      card.classList.remove('selected');
    });
  }

  showLoading(show) {
    this.shadowRoot.getElementById('loading').style.display = show ? 'block' : 'none';
    this.shadowRoot.getElementById('submit-btn').disabled = show;
  }

  showError(message) {
    const errorEl = this.shadowRoot.getElementById('error');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    this.shadowRoot.getElementById('success').style.display = 'none';
  }

  showSuccess(message) {
    const successEl = this.shadowRoot.getElementById('success');
    successEl.textContent = message;
    successEl.style.display = 'block';
    this.shadowRoot.getElementById('error').style.display = 'none';
  }
}

// Web Component 등록
customElements.define('rsvshop-widget', RsvShopWidget); 