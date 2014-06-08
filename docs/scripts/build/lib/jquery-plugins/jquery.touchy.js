(function(){function e(e,t){var n=e;(function(e){e.touchyOptions={useDelegation:!1,longpress:{preventDefault:{start:!0,move:!0,end:!0},requiredTouches:1,msThresh:800,triggerStartPhase:!1,data:{startDate:null},proxyEvents:["TouchStart","TouchEnd"]},drag:{preventDefault:{start:!0,move:!0,end:!0},requiredTouches:1,msHoldThresh:100,data:{startPoint:null,startDate:null,movePoint:null,moveDate:null,held:!1},proxyEvents:["TouchStart","TouchMove","TouchEnd"]},pinch:{preventDefault:{start:!0,move:!0,end:!0},requiredTouches:2,pxThresh:0,data:{startPoint:null,startDate:null,movePoint:null,moveDate:null},proxyEvents:["TouchStart","TouchMove","GestureChange","TouchEnd"]},rotate:{preventDefault:{start:!0,move:!0,end:!0},requiredTouches:1,data:{},proxyEvents:["TouchStart","TouchMove","GestureChange","TouchEnd"]},swipe:{preventDefault:{start:!0,move:!0,end:!0},requiredTouches:1,velocityThresh:1,triggerOn:"touchmove",data:{startPoint:null,startDate:null,movePoint:null,moveDate:null},proxyEvents:["TouchStart","TouchMove","TouchEnd"]}};var t={handleTouchStart:function(t){var i=this.context,o=a(t,i);if(o){var f=t.originalEvent,l=f.targetTouches,c="touchy"+i.charAt(0).toUpperCase()+i.slice(1),h=o.data(c),p=h.settings;p.preventDefault.start&&f.preventDefault();if(l.length===p.requiredTouches)switch(i){case"drag":n(h,l,t.timeStamp);var d=h.startPoint;o.trigger("touchy-drag",["start",o,{movePoint:d,lastMovePoint:d,startPoint:d,velocity:0}]);break;case"swipe":r(h,l,t.timeStamp);break;case"pinch":var v=u(t);v&&(h.startPoint={x:v.centerX,y:v.centerY},h.startDistance=Math.sqrt(Math.pow(v.x2-v.x1,2)+Math.pow(v.y2-v.y1,2)));break;case"longpress":h.startPoint={x:l[0].pageX,y:l[0].pageY},h.startDate=t.timeStamp,p.triggerStartPhase&&o.trigger("touchy-longpress",["start",o]),h.timer=setTimeout(e.proxy(function(){o.trigger("touchy-longpress",["end",o])},this),p.msThresh);break;case"rotate":if(l.length===1)s(h,l,t.timeStamp);else{var v=u(t);h.startPoint={x:v.centerX,y:v.centerY},h.startDate=t.timeStamp}var d=h.startPoint;o.trigger("touchy-rotate",["start",o,{startPoint:d,movePoint:d,lastMovePoint:d,velocity:0,degrees:0}])}}},handleTouchMove:function(e){var t=this.context,s=a(e,t);if(s){var l=e.originalEvent,c=l.targetTouches,h="touchy"+t.charAt(0).toUpperCase()+t.slice(1),p=s.data(h),d=p.settings;d.preventDefault.move&&l.preventDefault();if(c.length===d.requiredTouches)switch(t){case"drag":n(p,c,e.timeStamp);var v=p.movePoint,m=p.lastMovePoint,g=v.x===m.x&&v.y===m.y?0:Math.sqrt(Math.pow(v.x-m.x,2)+Math.pow(v.y-m.y,2)),y=p.moveDate-p.lastMoveDate,b=y===0?0:g/y;p.held&&s.trigger("touchy-drag",["move",s,{movePoint:v,lastMovePoint:m,startPoint:p.startPoint,velocity:b}]);break;case"swipe":r(p,c,e.timeStamp),!p.swipeExecuted&&p.swiped&&d.triggerOn==="touchmove"&&(p.swipeExecuted=!0,i(p,s));break;case"pinch":var w=u(e);if(w){p.currentPoint={x:w.centerX,y:w.centerY};if(!o()){var E=Math.sqrt(Math.pow(w.x2-w.x1,2)+Math.pow(w.y2-w.y1,2)),S=p.previousScale=p.scale||1,x=p.startDistance,T=p.scale=E/x,N=T*x;N>d.pxThresh&&s.trigger("touchy-pinch",[s,{scale:T,previousScale:S,currentPoint:p.currentPoint,startPoint:p.startPoint,startDistance:x}])}}break;case"rotate":var m,C,v,k,C,g,y,b,L,A,O,M,_,D;m=p.lastMovePoint=p.movePoint||p.startPoint,C=p.lastMoveDate=p.moveDate||p.startDate,v=p.movePoint={x:c[0].pageX,y:c[0].pageY},k=p.moveDate=e.timeStamp;if(c.length===1)L=p.targetPageCoords=p.targetPageCoords||f(e.target),A=p.centerCoords=p.centerCoords||{x:L.x+s.width()*.5,y:L.y+s.height()*.5};else{var w=u(e);A=p.centerCoords={x:w.centerX,y:w.centerY};if(o())break}O=Math.atan2(v.y-A.y,v.x-A.x),_=p.lastDegrees=p.degrees,M=p.degrees=O*(180/Math.PI),D=_?M-_:0,y=k-C,b=p.velocity=y===0?0:D/y,s.trigger("touchy-rotate",["move",s,{startPoint:p.startPoint,startDate:p.startDate,movePoint:v,lastMovePoint:m,centerCoords:A,degrees:M,degreeDelta:D,velocity:b}])}}},handleGestureChange:function(t){var n=this.context,r=a(t,n);if(r){var r=e(t.target),i=t.originalEvent,s=i.touches,o="touchy"+n.charAt(0).toUpperCase()+n.slice(1),u=r.data(o);u.preventDefault.move&&i.preventDefault();switch(n){case"pinch":var f=u.previousScale=u.scale||1,l=u.scale=i.scale,c=u.startPoint,h=u.currentPoint||c,p=u.startDistance,d=l*p;d>u.settings.pxThresh&&r.trigger("touchy-pinch",[r,{scale:l,previousScale:f,currentPoint:h,startPoint:c,startDistance:p}]);break;case"rotate":var v=u.lastDegrees=u.degrees,m=u.degrees=i.rotation,g=v?m-v:0,y=u.moveDate-u.lastMoveDate,b=u.velocity=y===0?0:g/y;r.trigger("touchy-rotate",["move",r,{startPoint:u.startPoint,startDate:u.startDate,movePoint:u.movePoint,lastMovePoint:u.lastMovePoint,centerCoords:u.centerCoords,degrees:m,degreeDelta:g,velocity:b}])}}},handleTouchEnd:function(t){var n=this.context,r=a(t,n);if(r){var s=t.originalEvent,o="touchy"+n.charAt(0).toUpperCase()+n.slice(1),u=r.data(o),f=u.settings;f.preventDefault.end&&s.preventDefault();switch(n){case"drag":if(u.held){var l=u.movePoint||u.startPoint,c=u.lastMovePoint||u.startPoint,h=l.x===c.x&&l.y===c.y?0:Math.sqrt(Math.pow(l.x-c.x,2)+Math.pow(l.y-c.y,2)),p=u.moveDate-u.lastMoveDate,d=p===0?0:h/p;r.trigger("touchy-drag",["end",r,{movePoint:l,lastMovePoint:c,startPoint:u.startPoint,velocity:d}])}e.extend(u,{startPoint:null,startDate:null,movePoint:null,moveDate:null,lastMovePoint:null,lastMoveDate:null,held:!1});break;case"swipe":u.swiped&&f.triggerOn==="touchend"&&i(u,r),e.extend(u,{startPoint:null,startDate:null,movePoint:null,moveDate:null,lastMovePoint:null,lastMoveDate:null,swiped:!1,swipeExecuted:!1});break;case"pinch":e.extend(u,{startPoint:null,startDistance:0,currentPoint:null,pinched:!1,scale:1,previousScale:null});break;case"longpress":clearTimeout(u.timer),e.extend(u,{startDate:null});break;case"rotate":var v=u.lastDegrees?u.degrees-u.lastDegrees:0;r.trigger("touchy-rotate",["end",r,{startPoint:u.startPoint,startDate:u.startDate,movePoint:u.movePoint,lastMovePoint:u.lastMovePoint,degrees:u.degrees,degreeDelta:v,velocity:u.velocity}]),e.extend(u,{startPoint:null,startDate:null,movePoint:null,moveDate:null,lastMovePoint:null,lastMoveDate:null,targetPageCoords:null,centerCoords:null,degrees:null,lastDegrees:null,velocity:null})}}}},n=function(t,n,r){s(t,n,r);var i=t.moveDate||t.startDate,o=r;t.held||o-i>t.settings.msHoldThresh?e.extend(t,{held:!0,lastMoveDate:i,lastMovePoint:t.movePoint&&t.movePoint.x?t.movePoint:t.startPoint,moveDate:o,movePoint:{x:n[0].pageX,y:n[0].pageY}}):e.extend(t,{held:!1,lastMoveDate:0,lastMovePoint:t.startPoint,moveDate:0,movePoint:t.startPoint})},r=function(t,n,r){s(t,n,r);var i=t.settings,o=t.startDate,u=t.startPoint,a=t.moveDate||t.startDate,f=r,l={x:n[0].pageX,y:n[0].pageY},c=l.x-u.x,h=l.y-u.y,p=f-a;e.extend(t,{lastMoveDate:a,lastMovePoint:t.movePoint&&t.movePoint.x?t.movePoint:t.startPoint,moveDate:f,movePoint:l,hDistance:c,vDistance:h}),!t.swiped&&(Math.abs(c)/p>i.velocityThresh||Math.abs(h)/p>i.velocityThresh)&&(t.swiped=!0)},i=function(e,t){var n=e.movePoint,r=e.lastMovePoint,i=n.x===r.x&&n.y===r.y?0:Math.sqrt(Math.pow(n.x-r.x,2)+Math.pow(n.y-r.y,2)),s=e.moveDate-e.lastMoveDate,o=s===0?0:i/s,u=e.hDistance,a=e.vDistance,f;o>e.settings.velocityThresh&&(Math.abs(u)>Math.abs(a)?f=u>0?"right":"left":f=a>0?"down":"up",t.trigger("touchy-swipe",[t,{direction:f,movePoint:n,lastMovePoint:r,startPoint:e.startPoint,velocity:o}]))},s=function(e,t,n){e.startPoint||(e.startPoint={x:t[0].pageX,y:t[0].pageY}),e.startDate||(e.startDate=n)},o=function(){return typeof window.ongesturechange=="object"},u=function(e){var t=!1,n=e.originalEvent.touches;return n.length===2?(t={x1:n[0].pageX,y1:n[0].pageY,x2:n[1].pageX,y2:n[1].pageY},t.centerX=(t.x1+t.x2)/2,t.centerY=(t.y1+t.y2)/2,t):t},a=function(t,n){var r,i=!1,s=0,o=l[n].length;if(e.touchyOptions.useDelegation)for(;s<o;s+=1){r=e(l[n][s]).has(t.target);if(r.length>0){i=r;break}}else l[n]&&l[n].index(t.target)!=-1&&(i=e(t.target));return i},f=function(e,t){function n(e,r,i){var s=e.offsetParent;r.x+=e.offsetLeft-(s?s.scrollLeft:0),r.y+=e.offsetTop-(s?s.scrollTop:0);if(s){if(s.nodeType==1){var o=i.getComputedStyle(s,"");if(o.position!="static"){r.x+=parseInt(o.borderLeftWidth),r.y+=parseInt(o.borderTopWidth);if(s.localName=="TABLE")r.x+=parseInt(o.paddingLeft),r.y+=parseInt(o.paddingTop);else if(s.localName=="BODY"){var u=i.getComputedStyle(e,"");r.x+=parseInt(u.marginLeft),r.y+=parseInt(u.marginTop)}}else s.localName=="BODY"&&(r.x+=parseInt(o.borderLeftWidth),r.y+=parseInt(o.borderTopWidth));var a=e.parentNode;while(s!=a)r.x-=a.scrollLeft,r.y-=a.scrollTop,a=a.parentNode;n(s,r,i)}}else{if(e.localName=="BODY"){var u=i.getComputedStyle(e,"");r.x+=parseInt(u.borderLeftWidth),r.y+=parseInt(u.borderTopWidth);var f=i.getComputedStyle(e.parentNode,"");r.x-=parseInt(f.paddingLeft),r.y-=parseInt(f.paddingTop)}e.scrollLeft&&(r.x+=e.scrollLeft),e.scrollTop&&(r.y+=e.scrollTop);var l=e.ownerDocument.defaultView;l&&!t&&l.frameElement&&n(l.frameElement,r,l)}}var r={x:0,y:0};return e&&n(e,r,e.ownerDocument.defaultView),r},l={},c={};e.each(e.touchyOptions,function(n,r){if(n!=="useDelegation"){var i=n.charAt(0).toUpperCase()+n.slice(1);l[n]=e([]),c[n]=new function(){this.context=n},e.event.special["touchy-"+n]={setup:function(r,s,o){l[n]=l[n].add(this),e(this).data("touchy"+i,e.extend({},e.touchyOptions[n].data)),e(this).data("touchy"+i).settings=e.extend({},e.touchyOptions[n]),delete e(this).data("touchy"+i).settings.data,l[n].length===1&&e.each(e.touchyOptions[n].proxyEvents,function(r,i){e(document).bind(i.toLowerCase()+".touchy."+n,e.proxy(t["handle"+i],c[n]))})},teardown:function(t){l[n]=l[n].not(this),e(this).removeData("touchy"+i),l[n].length===0&&e.each(e.touchyOptions[n].proxyEvents,function(t,r){e(document).unbind(r.toLowerCase()+".touchy."+n)})},add:function(t){e.extend(e(this).data("touchy"+i).settings,t.data);var n=t.handler;t.handler=function(e){return n.apply(this,arguments)}}}}})})(n)}typeof define=="function"&&define.amd?define(["jquery"],function(t){e(t)}):typeof require=="function"&&typeof exports=="object"&&typeof module=="object"?e(require("jquery")):e(jQuery||$)}).call(this);