(function(){
  var el = {
    fc:document.getElementById('sl-fc'), bw:document.getElementById('sl-bw'), fs:document.getElementById('sl-fs'),
    vfc:document.getElementById('v-fc'), vbw:document.getElementById('v-bw'), vfs:document.getElementById('v-fs'),
    st:document.getElementById('bps-status'), cv:document.getElementById('bps-canvas')
  };
  var ctx = el.cv.getContext('2d');

  function rnd(v,d){ var p=Math.pow(10,d==null?2:d); return Math.round(v*p)/p; }

  function findZone(fL,fH,fs){
    var maxN=Math.floor(fH/(fH-fL));
    for(var n=1;n<=maxN;n++){
      var lo=2*fH/n, hi=n===1?1e9:2*fL/(n-1);
      if(fs>=lo-0.002&&fs<=hi+0.002) return n;
    }
    return null;
  }

  function aliasOf(f,fs,n){
    return n%2===1 ? f-(n-1)/2*fs : n/2*fs-f;
  }

  function update(){
    var fc=+el.fc.value, bw=+el.bw.value, fs=+el.fs.value;
    if(bw>=fc){bw=Math.max(1,fc-1);el.bw.value=bw;}
    var fL=fc-bw/2, fH=fc+bw/2;
    el.vfc.textContent=rnd(fc); el.vbw.textContent=rnd(bw); el.vfs.textContent=rnd(fs);

    var n=findZone(fL,fH,fs);
    var inv=n!==null&&n%2===0;
    var aL=null,aH=null;
    if(n!==null){
      aL=Math.min(aliasOf(fL,fs,n),aliasOf(fH,fs,n));
      aH=Math.max(aliasOf(fL,fs,n),aliasOf(fH,fs,n));
    }
    if(n){
      el.st.style.background='#d4edda';el.st.style.color='#155724';
      el.st.innerHTML='İZİNLİ &nbsp; n = '+n+(inv?' (<b>çift → ters spektrum</b>)':' (tek → düz spektrum)')+
        ' &nbsp;|&nbsp; Alias bandı: ['+rnd(aL)+', '+rnd(aH)+'] MHz';
    } else {
      el.st.style.background='#f8d7da';el.st.style.color='#721c24';
      el.st.innerHTML='YASAK BÖLGE &mdash; sinyal iki Nyquist zone sınırını aşıyor; alias\'lar çakışıyor';
    }
    paint(fL,fH,fs,n,aL,aH,inv);
  }

  function paint(fL,fH,fs,n,aL,aH,inv){
    var W=el.cv.parentElement.clientWidth-40, H=170;
    var dpr=window.devicePixelRatio||1;
    el.cv.width=W*dpr; el.cv.height=H*dpr;
    el.cv.style.width=W+'px'; el.cv.style.height=H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);

    var PT=30,PB=30,PL=8,MID=18;
    var pw=(W-PL*2-MID)/2, ph=H-PT-PB;
    var x1=PL, x2=PL+pw+MID;

    ctx.clearRect(0,0,W,H);
    ctx.font='11px system-ui,sans-serif';

    function panel(x0,fMin,fMax,bL,bH,title,col,extra){
      var f2x=function(f){return x0+(f-fMin)/(fMax-fMin)*pw;};
      ctx.fillStyle='#f8f9fa'; ctx.fillRect(x0,PT,pw,ph);

      /* Nyquist zone stripes on alias panel */
      if(extra&&extra.zones){
        for(var zi=1;zi<=extra.zones;zi++){
          var zx1=f2x((zi-1)*fs/2), zx2=f2x(zi*fs/2);
          ctx.fillStyle=zi%2===1?'rgba(200,230,255,0.18)':'rgba(220,200,255,0.18)';
          var rx=Math.max(x0,zx1),rw=Math.min(x0+pw,zx2)-rx;
          if(rw>0) ctx.fillRect(rx,PT,rw,ph);
        }
        ctx.strokeStyle='#c0c8d8'; ctx.lineWidth=0.5;
        for(var zi=1;zi<extra.zones;zi++){
          var bndx=f2x(zi*fs/2);
          if(bndx>x0&&bndx<x0+pw){
            ctx.setLineDash([3,3]);
            ctx.beginPath();ctx.moveTo(bndx,PT);ctx.lineTo(bndx,PT+ph);ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }

      /* signal band fill */
      if(bL!==null&&bH!==null){
        var bx1=Math.max(x0,f2x(bL)), bx2=Math.min(x0+pw,f2x(bH));
        if(bx2>bx1){
          ctx.fillStyle=col+'28'; ctx.fillRect(bx1,PT,bx2-bx1,ph);
          ctx.fillStyle=col+'aa'; ctx.fillRect(bx1,PT+ph-4,bx2-bx1,4);
          /* band edge lines */
          ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.setLineDash([]);
          [bx1,bx2].forEach(function(bx){
            ctx.beginPath();ctx.moveTo(bx,PT);ctx.lineTo(bx,PT+ph);ctx.stroke();
          });
          /* band label */
          ctx.fillStyle=col; ctx.textAlign='center'; ctx.font='10px system-ui,sans-serif';
          ctx.fillText(rnd(bL)+'–'+rnd(bH)+' MHz',(bx1+bx2)/2,PT+13);
          ctx.font='11px system-ui,sans-serif';
        }
      }

      /* border */
      ctx.strokeStyle='#dee2e6'; ctx.lineWidth=1; ctx.setLineDash([]);
      ctx.strokeRect(x0,PT,pw,ph);

      /* baseline */
      ctx.strokeStyle='#999'; ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(x0,PT+ph);ctx.lineTo(x0+pw,PT+ph);ctx.stroke();

      /* ticks */
      var nt=5;
      for(var i=0;i<=nt;i++){
        var tf=fMin+(fMax-fMin)*i/nt, tx=f2x(tf);
        ctx.strokeStyle='#ccc'; ctx.lineWidth=0.5;
        ctx.beginPath();ctx.moveTo(tx,PT);ctx.lineTo(tx,PT+ph+4);ctx.stroke();
        ctx.fillStyle='#777'; ctx.textAlign='center';
        ctx.fillText(rnd(tf,1),tx,PT+ph+14);
      }
      ctx.fillStyle='#888'; ctx.textAlign='center';
      ctx.fillText('MHz',x0+pw/2,H-4);

      /* title */
      ctx.fillStyle='#333'; ctx.textAlign='center';
      ctx.font='bold 11px system-ui,sans-serif';
      ctx.fillText(title,x0+pw/2,PT-10);
      ctx.font='11px system-ui,sans-serif';

      if(extra&&extra.inv){
        ctx.fillStyle='#6a1b9a'; ctx.textAlign='right'; ctx.font='10px system-ui,sans-serif';
        ctx.fillText('↔ ters spektrum',x0+pw-4,PT+ph-6);
        ctx.font='11px system-ui,sans-serif';
      }
    }

    /* forbidden panel */
    function forbidPanel(x0){
      ctx.fillStyle='#fff5f5'; ctx.fillRect(x0,PT,pw,ph);
      ctx.strokeStyle='#dee2e6'; ctx.lineWidth=1; ctx.strokeRect(x0,PT,pw,ph);
      ctx.fillStyle='#dc354588'; ctx.fillRect(x0,PT,pw,ph);
      ctx.fillStyle='#721c24'; ctx.textAlign='center';
      ctx.font='bold 12px system-ui,sans-serif';
      ctx.fillText('Alias çakışması',x0+pw/2,PT+ph/2+5);
      ctx.fillStyle='#333'; ctx.font='bold 11px system-ui,sans-serif';
      ctx.fillText('Yasak bölge',x0+pw/2,PT-10);
      ctx.font='11px system-ui,sans-serif';
    }

    var analogMax=Math.max(fH*1.55, fH+20);
    panel(x1,0,analogMax,fL,fH,'Analog spektrum','#1565c0',null);

    if(n!==null){
      var maxZone=Math.ceil(analogMax/(fs/2));
      panel(x2,0,fs/2,aL,aH,'Zone 1 alias (n = '+n+')',inv?'#6a1b9a':'#2e7d32',{zones:1,inv:inv});
    } else {
      forbidPanel(x2);
    }

    /* arrow */
    ctx.fillStyle='#555'; ctx.textAlign='center'; ctx.font='15px system-ui,sans-serif';
    ctx.fillText('→',x1+pw+MID/2,PT+ph/2+6);
    ctx.font='9px system-ui,sans-serif'; ctx.fillStyle='#888';
    ctx.fillText('f_s='+rnd(fs),x1+pw+MID/2,PT+ph/2+18);
  }

  [el.fc,el.bw,el.fs].forEach(function(s){s.addEventListener('input',update);});
  window.addEventListener('resize',update);
  update();
})();
