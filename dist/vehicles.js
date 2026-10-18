// A solid car projected with the same longitudinal/transverse axes as the road.
export function projectedCar(index=0){
 const direction=index%4<2?1:-1,paint=['#ddd9cd','#a4bdb5','#c6a986','#bac8c4'][index%4];
 const point=(u,v,h=0)=>`${(200*direction*u+158*v).toFixed(3)},${(-68*direction*u-h).toFixed(3)}`;
 const shape=(points,fill,cls='')=>`<path class="${cls}" d="M${points.map(p=>point(...p)).join('L')}Z" fill="${fill}"/>`;
 const footprint=[[-.042,-.034],[.042,-.034],[.042,.034],[-.042,.034]];
 const wheels=[-.027,.027].flatMap(u=>[-.035,.035].map(v=>`<g transform="translate(${point(u,v,1.5)})"><ellipse rx="2.25" ry="2.1" fill="#293831"/><ellipse rx=".9" ry="1" fill="#adb5aa"/></g>`)).join('');
 return `<polygon class="car-footprint" points="${footprint.map(p=>point(...p)).join(' ')}" fill="#20352b" opacity=".24"/>${wheels}${shape([[-.042,-.034,1],[.042,-.034,1],[.042,-.034,4],[-.042,-.034,4]],'#71877e','car-body-side')}${shape([[-.042,.034,1],[.042,.034,1],[.042,.034,4],[-.042,.034,4]],'#7a8d82','car-body-side')}${shape([[-.042,-.034,4],[.042,-.034,4],[.042,.034,4],[-.042,.034,4]],paint,'car-body-top')}${shape([[.042,-.034,1],[.042,.034,1],[.042,.034,4],[.042,-.034,4]],'#8a9b8e')}${shape([[-.023,-.029,4],[-.014,-.026,7],[.014,-.026,7],[.025,-.029,4]],'#527171','car-window')}${shape([[-.023,.029,4],[-.014,.026,7],[.014,.026,7],[.025,.029,4]],'#3f5d5e','car-window')}${shape([[-.014,-.026,7],[.014,-.026,7],[.014,.026,7],[-.014,.026,7]],paint,'car-roof')}${shape([[.014,-.026,7],[.025,-.029,4],[.025,.029,4],[.014,.026,7]],'#9db9b7','car-windshield')}<path d="M${point(.043,-.025,2.8)}L${point(.043,-.013,2.8)}M${point(.043,.013,2.8)}L${point(.043,.025,2.8)}" stroke="#fcf0c7" stroke-width="1.2"/>`;
}
