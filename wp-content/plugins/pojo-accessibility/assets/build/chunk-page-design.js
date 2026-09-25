"use strict";(globalThis.webpackChunkpojo_accessibility=globalThis.webpackChunkpojo_accessibility||[]).push([[6873],{67340(e,i,a){if(a.d(i,{A:()=>d}),9884==a.j)var n=a(16956);var s=a(78048);if(9884==a.j)var t=a(85848);var r=a(95231),o=a(9626),l=a(27723),c=a(10790);const d=9884==a.j?()=>{const{openSidebar:e}=(0,o.t0)();return(0,c.jsxs)(p,{children:[(0,c.jsx)(u,{children:(0,c.jsx)(n.A,{"aria-hidden":!0,sx:{fontSize:"24px"}})}),e&&(0,c.jsx)(t.A,{variant:"subtitle1",as:"div",children:(0,l.__)("Accessibility","pojo-accessibility")})]})}:null,p=(0,r.I)(s.A)`
	display: flex;
	align-items: center;
	gap: ${({theme:e})=>e.spacing(1.5)};
	white-space: nowrap;
	line-height: 0;
	padding: 0;
`,u=(0,r.I)(s.A)`
	padding: ${({theme:e})=>e.spacing(1)};
	border: 1px solid ${({theme:e})=>e.palette.divider};
	border-radius: ${({theme:e})=>2*e.shape.borderRadius}px;
	color: rgb(0 0 0 / 0.54);
`},70589(e,i,a){if(a.d(i,{A:()=>r}),9884==a.j)var n=a(95726);var s=a(26544),t=a(10790);const r=9884==a.j?()=>(0,t.jsx)(n.A,{disablePadding:!0,children:Object.entries(s.c).map(([e,i])=>(0,t.jsx)(s.Dr,{keyName:e,item:i},e))}):null},14715(e,i,a){a.d(i,{A:()=>x});var n=a(68856);if(9884==a.j)var s=a(70320);if(9884==a.j)var t=a(21370);var r=a(95231),o=a(9626),l=a(59921),c=a(70276),d=a(5522),p=a(27723),u=a(42679);if(9884==a.j)var h=a(74565);var g=a(10790);const x=9884==a.j?()=>{const{planUsage:e,planData:i,dismissedQuotaNotices:a,setDismissedQuotaNotices:n}=(0,o.t0)(),{save:r}=(0,o.rX)(),x="Free"===i?.plan?.name,{isElementorOne:j}=(0,u.F)(),f=e=>{c.K.sendEvent(c.m.upgradeButtonClicked,{feature:"quota notice "+e,component:"upgrade button"}),(0,h.Fe)((0,d.b)(l.qQ[`UPGRADE_${e}`]))},b=e=>{c.K.sendEvent("quota_notice_triggered",{quota_level:e})},v=async e=>{const i=a.includes(e)?a:[...a,e];n(i);try{await r({ea11y_dismissed_quota_notices:i})}catch(e){console.error("Failed to save dismissed notice:",e)}};if(j)return null;if(e.aiCredits<80&&e.scannedPages<80)return null;if(e.aiCredits>=80&&e.aiCredits<95&&!x||e.scannedPages>=80&&e.scannedPages<95&&!x){const e="quota-banner-80";return a.includes(e)?null:(b("80%"),(0,g.jsxs)(m,{severity:"warning",square:!0,onClose:()=>v(e),children:[(0,g.jsx)(t.A,{children:(0,p.__)("You've reached 80% of your monthly plan usage","pojo-accessibility")}),(0,p.__)("Upgrade now to increase your limit and ensure all accessibility features stay fully available for every visitor.","pojo-accessibility"),(0,g.jsx)(s.A,{variant:"outlined",onClick:()=>f("80"),sx:{marginBlockStart:1},children:(0,p.__)("Upgrade now","pojo-accessibility")})]}))}if(e.aiCredits>=95&&e.aiCredits<100&&!x||e.scannedPages>=95&&e.scannedPages<100&&!x){const e="quota-banner-95";return a.includes(e)?null:(b("95%"),(0,g.jsxs)(m,{severity:"error",square:!0,onClose:()=>v(e),children:[(0,g.jsx)(t.A,{children:(0,p.__)("Only 5% of your monthly plan usage left","pojo-accessibility")}),(0,p.__)("Upgrade now to increase your limit and keep all accessibility features running smoothly for every visitor.","pojo-accessibility"),(0,g.jsx)(s.A,{variant:"outlined",onClick:()=>f("95"),sx:{marginBlockStart:1},children:(0,p.__)("Upgrade now","pojo-accessibility")})]}))}if((100===e.aiCredits||100===e.scannedPages)&&!x){const e="quota-banner-100";return a.includes(e)?null:(b("100%"),(0,g.jsxs)(m,{severity:"error",square:!0,onClose:()=>v(e),children:[(0,g.jsx)(t.A,{children:(0,p.__)("You've reached your monthly plan usage","pojo-accessibility")}),(0,p.__)("Upgrade now to raise your limit and maintain complete access to all accessibility features for every visitor.","pojo-accessibility"),(0,g.jsx)(s.A,{variant:"outlined",onClick:()=>f("100"),sx:{marginBlockStart:1},children:(0,p.__)("Upgrade now","pojo-accessibility")})]}))}if(100===e.scannedPages&&x){const e="quota-banner-100-free";return a.includes(e)?null:(b("100%"),(0,g.jsxs)(m,{severity:"error",square:!0,onClose:()=>v(e),children:[(0,g.jsx)(t.A,{children:(0,p.__)("You've reached your free plan limit","pojo-accessibility")}),(0,p.__)("Upgrade to scan more pages, unlock AI fixes, and access all accessibility features.","pojo-accessibility"),(0,g.jsx)(s.A,{variant:"outlined",onClick:()=>f("100"),sx:{marginBlockStart:1},children:(0,p.__)("Upgrade now","pojo-accessibility")})]}))}}:null,m=(0,r.I)(n.Ay)`
	.MuiAlert-content div {
		display: flex;
		flex-direction: column;
		align-items: start;
	}
`},70227(e,i,a){if(a.d(i,{A:()=>x}),9884==a.j)var n=a(42473);if(9884==a.j)var s=a(26368);var t=a(83904),r=a(73916);if(9884==a.j)var o=a(72608);var l=a(95231),c=a(26544),d=a(9626),p=a(85213),u=a(27723),h=a(42679),g=a(10790);const x=9884==a.j?()=>{const{openSidebar:e,setOpenSidebar:i}=(0,d.t0)(),{isElementorOne:a}=(0,h.F)();return(0,g.jsxs)(j,{variant:"permanent",open:e,role:"navigation","aria-label":(0,u.__)("Plugin sidebar","pojo-accessibility"),children:[(0,g.jsx)(m,{onClick:()=>i(!e),size:"small","aria-label":(0,u.__)("Toggle sidebar","pojo-accessibility"),children:(0,g.jsx)(o.A,{in:!e,children:(0,g.jsx)(n.A,{"aria-hidden":!0,fontSize:"tiny"})})}),(0,g.jsxs)(f,{children:[(0,g.jsx)(c.Nt,{}),(0,g.jsx)(s.A,{})]}),(0,g.jsx)(b,{children:(0,g.jsx)(c.wZ,{})}),!a&&(0,g.jsxs)(v,{children:[(0,g.jsx)(s.A,{}),(0,g.jsx)(p.En,{})]})]})}:null,m=(0,l.I)(r.A)`
	position: absolute;
	inset-inline-end: -15px;
	inset-block-start: 58px;
	z-index: 999999;

	border: 1px solid ${({theme:e})=>e.palette.divider};
	background: ${({theme:e})=>e.palette.background.paper};

	:hover,
	:focus-visible {
		background: #f3f3f4;
	}
`,j=(0,l.I)(t.A,{shouldForwardProp:e=>"open"!==e})`
	width: auto;
	& .MuiDrawer-paper {
		position: relative;
		width: ${({open:e})=>e?"240px":"72px"};
		height: 100%;
		justify-content: space-between;
		padding-block-start: 0;
		overflow: visible;
		transition: all 0.3s;
	}
`,f=(0,l.I)("div")`
	flex-shrink: 0;
	padding: ${({theme:e})=>e.spacing(2,2,0)};
	display: flex;
	flex-direction: column;
	gap: ${({theme:e})=>e.spacing(2)};
`,b=(0,l.I)("div")`
	flex: 1;
	padding: ${({theme:e})=>e.spacing(2)};
	overflow-y: auto;
`,v=(0,l.I)("div")`
	flex-shrink: 0;
`},43093(e,i,a){a.r(i),a.d(i,{default:()=>p});var n=a(95231),s=a(26544),t=a(85213),r=a(41094),o=a(70276),l=a(86087),c=a(27723),d=a(10790);const p=()=>((0,l.useEffect)(()=>{o.K.sendEvent(o.m.pageView,{page:"Button"})},[]),(0,d.jsxs)(r.fM,{children:[(0,d.jsxs)(r.ax,{children:[(0,d.jsx)(u,{variant:"h5",component:"h1",children:(0,c.__)("Design","pojo-accessibility")}),(0,d.jsx)(t.JX,{marginBlockEnd:4}),(0,d.jsx)(t.hP,{})]}),(0,d.jsx)(s.dT,{})]})),u=(0,n.I)(r.QP)`
	max-width: 1200px;
	margin: 0 auto 24px;
`},41094(e,i,a){a.d(i,{Nc:()=>g,QP:()=>u,TE:()=>h,ax:()=>p,fM:()=>c,rf:()=>d});var n=a(78048),s=a(23712),t=a(32672),r=a(94284),o=a(85848),l=a(95231);const c=(0,l.I)(n.A)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	max-height: 100%;
	min-height: 50%;
	height: 100%;
	overflow: hidden;
`,d=(0,l.I)(t.A)`
	overflow: auto;
	max-height: 100%;
	padding: ${({theme:e})=>e.spacing(4)};
`,p=(0,l.I)(n.A)`
	overflow: auto;
	max-height: 100%;
	padding: ${({theme:e})=>e.spacing(4)};
	width: 100%;
`,u=(0,l.I)(o.A)`
	display: flex;
	align-items: center;

	margin: 0;

	color: ${({theme:e})=>e.palette.common.black};
	line-height: 1.75;

	.MuiChip-root {
		margin-inline-start: ${({theme:e})=>e.spacing(1)};
		font-weight: 400;
	}
`,h=(0,l.I)(r.A)`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 24px;
	width: 376px;
	min-height: 264px;
	box-shadow: ${({theme:e})=>e.shadows[0]};
	cursor: pointer;

	:hover {
		box-shadow: 0 0 15px 0 rgb(37 99 235 / 0.15);
		border-color: ${({theme:e})=>e.palette.info.main};
	}
`,g=((0,l.I)(t.A)`
	display: flex;
	flex-direction: column;
	align-items: start;
	gap: ${({theme:e})=>e.spacing(2)};
	overflow: auto;
	max-height: 100%;
	max-width: 1200px;
	width: 100%;
	margin-inline: auto;

	@media (min-width: ${({theme:e})=>e.breakpoints.values.sm}px) {
		padding-inline: 0;
	}
`,(0,l.I)(s.A)`
	&:last-child {
		padding-block-end: 16px;
	}
`)}}]);