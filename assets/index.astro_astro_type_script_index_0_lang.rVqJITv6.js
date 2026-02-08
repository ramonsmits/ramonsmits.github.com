document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll(".typewriter").forEach(a=>{const p=a.getAttribute("data-text")||"",m=parseInt(a.getAttribute("data-delay")||"0");let M=0;setTimeout(()=>{const l=()=>{M<p.length&&(a.textContent+=p.charAt(M),M++,setTimeout(l,50+Math.random()*50))};l()},m)})});(()=>{const c=document.getElementById("sine-scroller");if(!c||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const a=c.dataset.text||"";if(!a)return;const p=24,m=12,M=55,l=12,H=10,y=64,_=.012,b=.019,W=.004,E=-.003,I=.001,O=.0017,N=.6,U=.4,B=.4,F=.5,G=.5,z=.15,X=.5,q=.35,Y=.65,ct=.05,ot=.2,w=3,at=10,lt=.65,Q=m*3+p+H;c.style.height=Q+"px",document.fonts.ready.then(async()=>{const i=window.devicePixelRatio||1,it=p+'px "JetBrains Mono", monospace',j=document.createElement("canvas").getContext("2d");j.font=it;const x=j.measureText("M").width,C=[...new Set(a)],R={};C.forEach((t,n)=>R[t]=n);const $=Math.ceil(x)+l*2,u=p+l*2,f=Math.ceil($*i),r=Math.ceil(u*i),A=document.createElement("canvas");A.width=C.length*f,A.height=r*2;const s=A.getContext("2d"),rt=p*i,S=l*i;s.font=rt+'px "JetBrains Mono", monospace',s.textBaseline="middle",s.fillStyle="#b6e685",C.forEach((t,n)=>s.fillText(t,n*f+S,r/2)),s.shadowBlur=at*i,s.shadowColor="rgba(159,211,110,"+lt+")",s.fillStyle="#b6e685",C.forEach((t,n)=>s.fillText(t,n*f+S,r+r/2)),s.globalCompositeOperation="destination-out",s.shadowBlur=0,s.shadowColor="transparent",C.forEach((t,n)=>s.fillText(t,n*f+S,r+r/2));const v=new Array(y);for(let t=0;t<y;t++)v[t]="rgba(159,211,110,"+(ct+ot*t/(y-1)).toFixed(3)+")";const dt={cmap:R},D=c.parentElement;if(c.transferControlToOffscreen){const t=c.transferControlToOffscreen(),n=await createImageBitmap(A),e=new Worker(URL.createObjectURL(new Blob([`
          let canvas, ctx, atlas, w, h, dpr, centerY;
          let text, cmap, CW, cellW, cellH, pCW, pCH, PAD, AMP, SPD;
          let offset = 0, lastTime = 0, sLUT, lutMax;

          self.onmessage = e => {
            const d = e.data;
            if (d.type === 'init') {
              canvas = d.canvas; ctx = canvas.getContext('2d'); atlas = d.atlas;
              text = d.text; cmap = d.cmap; CW = d.CW;
              cellW = d.cellW; cellH = d.cellH; pCW = d.pCW; pCH = d.pCH;
              PAD = d.PAD; AMP = d.AMP; SPD = d.SPD; sLUT = d.sLUT;
              lutMax = sLUT.length - 1;
              resize(d.width, d.dpr);
              requestAnimationFrame(render);
            } else if (d.type === 'resize') {
              resize(d.width, d.dpr);
            }
          };

          function resize(width, newDpr) {
            dpr = newDpr; w = width;
            h = AMP * 3 + ${p} + ${H};
            canvas.width = Math.ceil(w * dpr);
            canvas.height = Math.ceil(h * dpr);
            centerY = h / 2;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          }

          function render(time) {
            const dt = lastTime ? (time - lastTime) / 1000 : 0;
            lastTime = time;
            offset += SPD * dt;
            const textPx = text.length * CW;
            if (offset >= textPx) offset -= textPx;

            ctx.globalAlpha = 1;
            ctx.clearRect(0, 0, w, h);

            const startChar = Math.floor(offset / CW);
            const sub = offset % CW;
            const visible = Math.ceil(w / CW) + 2;
            const amp1 = AMP * (${N} + ${U} * Math.sin(time * ${I}));
            const amp2 = AMP * ${B} * (${F} + ${G} * Math.sin(time * ${O}));

            for (let i = 0; i < visible; i++) {
              const ci = (startChar + i) % text.length;
              const x = i * CW - sub;
              if (x < -PAD || x > w - CW + PAD) continue;

              const s1 = Math.sin(x * ${_} + time * ${W});
              const s2 = Math.sin(x * ${b} + time * ${E});
              const y = centerY + s1 * amp1 + s2 * amp2;
              const col = cmap[text[ci]];
              if (col === undefined) continue;

              const srcX = col * pCW;
              const dx = x - PAD, dy = y - cellH / 2;

              // Glow layer (row 1) driven by sine 2
              ctx.globalAlpha = ${z} + ${X} * (0.5 + 0.5 * s2);
              ctx.drawImage(atlas, srcX, pCH, pCW, pCH, dx, dy, cellW, cellH);

              // Text layer (row 0) driven by sine 1
              ctx.globalAlpha = ${q} + ${Y} * (0.5 + 0.5 * s1);
              ctx.drawImage(atlas, srcX, 0, pCW, pCH, dx, dy, cellW, cellH);
            }

            // Scanlines with pre-built LUT — zero string alloc
            ctx.globalAlpha = 1;
            for (let x = 0; x < w; x += ${w}) {
              ctx.fillStyle = sLUT[(0.5 + 0.5 * Math.sin(x * ${_} + time * ${W})) * lutMax | 0];
              ctx.fillRect(x, 0, ${w}, 1);
              ctx.fillStyle = sLUT[(0.5 + 0.5 * Math.sin(x * ${b} + time * ${E})) * lutMax | 0];
              ctx.fillRect(x, h - 1, ${w}, 1);
            }
            requestAnimationFrame(render);
          }
        `],{type:"text/javascript"})));e.postMessage({type:"init",canvas:t,atlas:n,sLUT:v,text:a,cmap:dt.cmap,CW:x,cellW:$,cellH:u,pCW:f,pCH:r,PAD:l,AMP:m,SPD:M,width:D.getBoundingClientRect().width,dpr:i},[t,n]),new ResizeObserver(d=>{e.postMessage({type:"resize",width:d[0].contentRect.width,dpr:window.devicePixelRatio||1})}).observe(D)}else{let t=function(){d=D.getBoundingClientRect().width,g=Q,c.width=Math.ceil(d*i),c.height=Math.ceil(g*i),c.style.width=d+"px",k=g/2,e.setTransform(i,0,0,i,0,0)},n=function(h){const ht=L?(h-L)/1e3:0;L=h,T+=M*ht;const K=a.length*x;T>=K&&(T-=K),e.globalAlpha=1,e.clearRect(0,0,d,g);const pt=Math.floor(T/x),xt=T%x,ft=Math.ceil(d/x)+2,mt=m*(N+U*Math.sin(h*I)),Mt=m*B*(F+G*Math.sin(h*O));for(let o=0;o<ft;o++){const wt=(pt+o)%a.length,P=o*x-xt;if(P<-l||P>d-x+l)continue;const V=Math.sin(P*_+h*W),Z=Math.sin(P*b+h*E),At=k+V*mt+Z*Mt,tt=R[a[wt]];if(tt===void 0)continue;const et=tt*f,nt=P-l,st=At-u/2;e.globalAlpha=z+X*(.5+.5*Z),e.drawImage(A,et,r,f,r,nt,st,$,u),e.globalAlpha=q+Y*(.5+.5*V),e.drawImage(A,et,0,f,r,nt,st,$,u)}e.globalAlpha=1;for(let o=0;o<d;o+=w)e.fillStyle=v[(.5+.5*Math.sin(o*_+h*W))*J|0],e.fillRect(o,0,w,1),e.fillStyle=v[(.5+.5*Math.sin(o*b+h*E))*J|0],e.fillRect(o,g-1,w,1);requestAnimationFrame(n)};const e=c.getContext("2d");let d,g,k,T=0,L=0;const J=y-1;t(),window.addEventListener("resize",t),requestAnimationFrame(n)}})})();
