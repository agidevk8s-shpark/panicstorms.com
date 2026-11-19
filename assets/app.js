(function(){
  /* theme */
  var btn=document.getElementById('themeBtn');
  btn.addEventListener('click',function(){
    var n=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
    document.documentElement.setAttribute('data-theme',n);
    try{localStorage.setItem('theme',n);}catch(e){}
  });

  /* journey tabs */
  var tabs=[].slice.call(document.querySelectorAll('.station'));
  var panels=[].slice.call(document.querySelectorAll('.panel'));
  function select(i,focus){
    tabs.forEach(function(t,k){
      var on=k===i;
      t.setAttribute('aria-selected',on);
      t.tabIndex=on?0:-1;
      panels[k].hidden=!on;
    });
    if(focus)tabs[i].focus();
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){select(i,false);});
    t.addEventListener('keydown',function(e){
      var k=e.key,n=tabs.length;
      if(k==='ArrowRight'||k==='ArrowDown'){e.preventDefault();select((i+1)%n,true);}
      else if(k==='ArrowLeft'||k==='ArrowUp'){e.preventDefault();select((i-1+n)%n,true);}
      else if(k==='Home'){e.preventDefault();select(0,true);}
      else if(k==='End'){e.preventDefault();select(n-1,true);}
    });
  });

  /* one-time sequence on load */
  var st=document.getElementById('stations');
  requestAnimationFrame(function(){requestAnimationFrame(function(){st.classList.add('lit');});});

  /* open the service row that a link or hash points to */
  function openTarget(){
    var id=location.hash.slice(1);
    if(!id)return;
    var el=document.getElementById(id);
    if(el&&el.tagName==='DETAILS'){el.open=true;el.scrollIntoView();}
  }
  window.addEventListener('hashchange',openTarget);
  openTarget();
  document.querySelectorAll('.panel .rel a').forEach(function(a){
    a.addEventListener('click',function(){
      var el=document.getElementById(a.getAttribute('href').slice(1));
      if(el)el.open=true;
    });
  });

  /* copy email */
  var cb=document.getElementById('copyMailBtn'),msg=document.getElementById('copyMailMsg'),timer;
  var ADDR='kyle@panicstorms.com';
  function done(ok){
    msg.textContent=ok?'복사했습니다.':'복사하지 못했습니다. "도입 상담 요청하기" 버튼을 이용해 주세요.';
    clearTimeout(timer);timer=setTimeout(function(){msg.textContent='';},3000);
  }
  function legacy(){
    var t=document.createElement('textarea');
    t.value=ADDR;t.setAttribute('readonly','');
    t.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(t);t.select();
    var ok=false;try{ok=document.execCommand('copy');}catch(e){}
    document.body.removeChild(t);cb.focus();done(ok);
  }
  cb.addEventListener('click',function(){
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(ADDR).then(function(){done(true);},legacy);
    }else legacy();
  });
})();

(function(){
  var boxes=[].slice.call(document.querySelectorAll('.chk input'));
  if(!boxes.length)return;
  var sum=document.getElementById('scSummary'),list=document.getElementById('scList'),
      mail=document.getElementById('scMail'),reset=document.getElementById('scReset');
  var ADDR='kyle@panicstorms.com';
  function svcName(id){var el=document.querySelector('#'+id+' .svc-name');return el?el.textContent:id;}
  function buildMail(on,ko,da){
    function make(items,compact){
      var area=ko>0&&da>0?'둘 다':(ko>0?'Knowledge Officer':'Digital Archivist');
      var lines=compact
        ?['안녕하세요. 도입 상담을 요청합니다.','','관심 영역: '+area,'자가 점검에서 해당된 항목:']
        :['안녕하세요. 도입 상담을 요청합니다.','','1. 회사명:','2. 담당자명 / 직책:','3. 산업 분야:','4. 임직원 규모:','5. 관심 영역: '+area,'6. 자가 점검에서 해당된 항목:'];
      lines=lines.concat(items.map(function(t){return '   - '+t;}));
      if(!compact)lines=lines.concat(['7. 가장 큰 고민:','8. 회신받을 연락처:']);
      return 'mailto:'+ADDR+'?subject='+encodeURIComponent('[도입 상담 요청] 자가 점검 결과 공유')+'&body='+encodeURIComponent(lines.join('\r\n'));
    }
    var names=on.map(function(b){return b.dataset.short;});
    var href=make(names,false);
    if(href.length>2000)href=make(names,true);
    if(href.length>2000)href=make(on.map(function(b){return '자가 점검 '+(boxes.indexOf(b)+1)+'번';}),true);
    return href;
  }
  function render(){
    var on=boxes.filter(function(b){return b.checked;});
    list.textContent='';
    if(!on.length){
      sum.textContent='선택한 항목이 없습니다. 해당되는 항목을 선택하면 먼저 살펴볼 서비스를 알려 드립니다.';
      mail.hidden=true;reset.hidden=true;return;
    }
    var ko=on.filter(function(b){return b.dataset.role==='ko';}).length,da=on.length-ko;
    sum.textContent='해당되는 항목 '+on.length+'개 (Knowledge Officer 영역 '+ko+'개, Digital Archivist 영역 '+da+'개). 먼저 살펴볼 서비스:';
    on.forEach(function(b){
      var li=document.createElement('li'),a=document.createElement('a');
      a.href='#'+b.dataset.svc;a.textContent=svcName(b.dataset.svc);
      li.appendChild(a);list.appendChild(li);
    });
    mail.href=buildMail(on,ko,da);
    mail.hidden=false;reset.hidden=false;
  }
  boxes.forEach(function(b){b.addEventListener('change',render);});
  reset.addEventListener('click',function(){boxes.forEach(function(b){b.checked=false;});render();boxes[0].focus();});
  list.addEventListener('click',function(e){
    var a=e.target.closest?e.target.closest('a'):null;
    if(!a)return;
    var el=document.getElementById(a.getAttribute('href').slice(1));
    if(el&&el.tagName==='DETAILS')el.open=true;
  });
  window.addEventListener('pageshow',render);
  render();
})();
