import{k as i,r as n,g as r,j as e}from"./index-Cny3-YC3.js";function l(){const a=i();return n.useEffect(()=>{const t=setTimeout(()=>{const s=r();a(s?"/":"/login")},3e3);return()=>clearTimeout(t)},[a]),e.jsxs("div",{className:"splash-container",style:{width:"100%",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,40,0.95) 100%)",position:"relative",overflow:"hidden"},children:[e.jsx("div",{style:{position:"absolute",top:0,left:0,right:0,bottom:0,opacity:.1,backgroundImage:"repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(200,200,200,.05) 35px, rgba(200,200,200,.05) 70px)"}}),e.jsxs("div",{style:{position:"relative",zIndex:10,textAlign:"center",animation:"fadeInUp 0.8s ease-out"},children:[e.jsx("div",{style:{marginBottom:"30px",animation:"scaleIn 0.8s ease-out"},children:e.jsx("img",{src:"https://cdn.builder.io/api/v1/image/assets%2F912f3720571b4a278e4934b7e38806ae%2F6ba1d6c01f7442adb2c42949109bd3ec?format=webp&width=800&height=1200",alt:"Joy Bangla",style:{maxWidth:"100%",height:"auto",maxHeight:"400px",objectFit:"contain"}})}),e.jsx("div",{style:{marginTop:"40px",display:"flex",justifyContent:"center",gap:"8px"},children:[0,1,2].map(t=>e.jsx("div",{style:{width:"8px",height:"8px",borderRadius:"50%",backgroundColor:"#ef4444",animation:`pulse 1.5s ease-in-out ${t*.2}s infinite`}},t))})]}),e.jsx("style",{children:`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `})]})}export{l as default};
