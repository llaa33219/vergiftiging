// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const limitInput = document.getElementById('limitInput');
  const saveButton = document.getElementById('saveBtn');
  // Get the status message element
  const statusMessage = document.getElementById('statusMessage');

  // Function to display status messages
  function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.style.color = isError ? 'red' : 'green';
    // Clear the message after 3 seconds
    setTimeout(() => {
      statusMessage.textContent = '';
    }, 3000);
  }

  // 저장된 제한 시간 불러오기 (초 단위) -> 분 단위로 변환하여 표시
  chrome.storage.sync.get(['limitTimeSec'], data => {
    if (data.limitTimeSec) {
      // 초를 분으로 변환하여 input 값 설정
      limitInput.value = data.limitTimeSec / 60;
    }
  });

  // 저장 버튼 클릭 이벤트
  saveButton.addEventListener('click', () => {
    // 입력된 분 값을 가져옴
    const limitTimeMin = parseInt(limitInput.value, 10);
    if (!isNaN(limitTimeMin) && limitTimeMin > 0) {
      // 분을 초로 변환하여 저장
      const limitTimeSec = limitTimeMin * 60;
      chrome.storage.sync.set({ limitTimeSec }, () => {
        // Show success message instead of alert
        showStatus('제한 시간이 저장되었습니다.');
        // window.close(); // Optional: close popup after save
      });
    } else {
      // Show error message instead of alert
      showStatus('유효한 시간을 분 단위로 입력해주세요.', true);
    }
  });
});
