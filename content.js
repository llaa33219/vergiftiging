// content.js
(() => {
  let timeSpentMs = 0;
  let lastResetDate = new Date().toDateString();
  let limitTimeSec = null;

  // chrome.storage.sync 사용 가능 여부 체크
  function storageAvailable() {
    return (
      chrome &&
      chrome.storage &&
      chrome.storage.sync &&
      typeof chrome.storage.sync.get === 'function' &&
      typeof chrome.storage.sync.set === 'function'
    );
  }

  // limitTimeSec 변경 감지
  if (storageAvailable() && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes.limitTimeSec) {
        limitTimeSec = changes.limitTimeSec.newValue;
      }
      if (area === 'sync' && changes.lastResetDate) {
        lastResetDate = changes.lastResetDate.newValue;
        timeSpentMs = 0;
      }
    });
  }

  // 초기 저장값 로드 및 자정 초기화
  if (storageAvailable()) {
    chrome.storage.sync.get(
      ['timeSpentMs', 'lastResetDate', 'limitTimeSec'],
      data => {
        const today = new Date().toDateString();
        if (!data.limitTimeSec) {
          // 기본값 설정 (예: 1시간)
          chrome.storage.sync.set({ limitTimeSec: 60 });
          limitTimeSec = 60; // 기본값으로 설정
        }
        if (data.lastResetDate !== today) {
          // 날짜가 다르면 초기화
          chrome.storage.sync.set({ timeSpentMs: 0, lastResetDate: today });
          timeSpentMs = 0;
        } else {
          timeSpentMs = data.timeSpentMs || 0;
        }

        lastResetDate = data.lastResetDate;
        limitTimeSec = data.limitTimeSec || null;
      }
    );
  }

  // 메인 주기 처리: 0.5초마다 실행
  const intervalId = setInterval(() => {
    if (!storageAvailable()) {
      clearInterval(intervalId);
      return;
    }

    // textarea placeholder 변경
    const ta = document.querySelector(
      'textarea#Write[name="Write"][placeholder="무슨 생각을 하고 있나요?"]'
    );
    if (ta) ta.setAttribute('placeholder', '정말로 글을 쓰실 생각인가요?');

    // 자정 리셋
    const today = new Date().toDateString();
    if (lastResetDate !== today) {
      lastResetDate = today;
      timeSpentMs = 0;
      try {
        chrome.storage.sync.set({ timeSpentMs: 0, lastResetDate: today });
      } catch (e) {
        clearInterval(intervalId);
        return;
      }
    }

    // 리스트 페이지 체류 시간 기록
    if (
      window.location.href.startsWith(
      'https://playentry.org/community/entrystory'
      )
    ) {
      timeSpentMs += 500;
      try {
      // 시간 저장
      chrome.storage.sync.set({ timeSpentMs });
      } catch (e) {
      clearInterval(intervalId);
      return;
      }
    }

    updateOverlays();
    }, 500);

    // 오버레이 업데이트 함수
    function updateOverlays() {
    const totalSec = Math.floor(timeSpentMs / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;

    // 리스트 페이지에서 언제든 시간 오버레이 표시
    if (
      window.location.href.startsWith(
      'https://playentry.org/community/entrystory'
      )
    ) {
      document.querySelectorAll('div.css-v98ur4.eq36rvw4, div.css-1eth5pr.e1yi8oq65').forEach(el => {
        el.innerHTML =
          `<span style="font-size:1.8em;">당신은 오늘 </span> ` +
          `<span style="color:rgb(22,216,163);font-size:2.3em;font-weight:600;">${minutes}분 ${seconds}초</span> ` +
          `<span style="font-size:1.8em;">동안 엔트리 이야기에 들어가 있었습니다.</span><br>` +
          `<strong style="font-size:2.5em;">중독입니까?</strong>`;
      });
    }

    // 제한 시간이 설정되지 않았거나 아직 초과하지 않으면 블러 처리 건너뜀
    if (limitTimeSec == null || totalSec < limitTimeSec) return;

    // 제한 시간 초과 시 블러 및 오버레이 적용 대상
    const targets = document.querySelectorAll(
      'div.css-1uvivr9.e1h77j9v11, div.css-ahy3yn.euhmxlr3'
    );

    targets.forEach(el => {
      // 기존 오버레이 제거
      const old = el.querySelector('.entry-blocker-overlay');
      if (old) old.remove();

      // 자식 요소 블러 적용
      Array.from(el.children).forEach(child => {
        child.style.filter = 'blur(5px)';
        child.style.pointerEvents = 'none';
      });

      // 오버레이 요소 생성
      const overlay = document.createElement('div');
      overlay.className = 'entry-blocker-overlay';
      overlay.textContent = '제한 시간을 초과하였습니다.';
      Object.assign(overlay.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '1.5em',
        zIndex: '9999',
        pointerEvents: 'none',
        cursor: 'default'
      });

      el.style.position = 'relative';
      el.appendChild(overlay);
    });
  }
})();
