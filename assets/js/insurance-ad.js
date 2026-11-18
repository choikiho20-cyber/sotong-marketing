/* /insurance/ 광고 꼬리표 (?a=…)
   - ppt·db·fit·edu: 첫 화면 제목(h1)과 그 아래 첫 문장만 그 광고 문구로 바꾼다. 나머지는 똑같다.
   - 어떤 꼬리표든: 문의 문자 머리에 「· 광고 꼬리표」를 붙이고, 카톡·톡톡용 안내 한 줄을 보인다(보험설계사 홈페이지 track.js 와 같은 형식).
   - 꼬리표가 없으면 아무것도 안 한다. 기본 제목은 HTML 에 그대로 있다(검색 로봇은 JS 를 안 돌림). */
(function () {
  var AD = {
    ppt: ['교육자료 PDF를 넣으면,<br>고객용 설명 PPT와 영상이', '초안으로 나옵니다. 숫자는 자료에서 그대로 옮기고 몇 쪽에서 왔는지 표시합니다.'],
    db:  ['DB 사는 비용,<br>내 이름이 검색되는 홈페이지로 줄여 보세요', '고객이 설계사님 이름을 검색해서 먼저 연락해 오는 길을 만듭니다.'],
    fit: ['70세 유병자 고객,<br>가입할 수 있는 상품부터 바로 찾기', '고객 나이와 간편·무심사 조건으로 상품을 찾고, 고른 상품으로 설명 PPT 초안을 만듭니다.'],
    edu: ['신입 교육 자료,<br>설명 PPT·영상으로 바로', '교육자료 PDF를 넣고 하나하나 확인하면 설명 PPT와 영상 초안이 나옵니다.']
  };
  var a = (new URLSearchParams(location.search).get('a') || '').slice(0, 20);
  if (!a) return;

  if (Object.prototype.hasOwnProperty.call(AD, a)) {
    var h1 = document.querySelector('[data-ad-h1]'), sub = document.querySelector('[data-ad-sub]');
    if (h1) h1.innerHTML = AD[a][0];   // 위 고정 문구만 넣는다(주소 값은 넣지 않음)
    if (sub) sub.textContent = AD[a][1];
  }

  var body = encodeURIComponent('[보험설계사 홈페이지 문의 · 광고 ' + a + '] ');
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="sms:"]'), function (el) {
    el.href = el.getAttribute('href').split('?')[0] + '?&body=' + body;   // ?& = 아이폰·안드로이드 둘 다 본문 채움
  });
  var note = document.querySelector('[data-ad-note]');
  if (note) { note.textContent = '카카오톡·톡톡으로 보내실 땐 첫 줄에 「광고 ' + a + '」라고 적어 주세요.'; note.hidden = false; }
})();
