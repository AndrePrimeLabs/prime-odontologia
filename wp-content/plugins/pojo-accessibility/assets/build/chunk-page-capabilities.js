"use strict";(globalThis.webpackChunkpojo_accessibility=globalThis.webpackChunkpojo_accessibility||[]).push([[3313],{67340(e,i,n){if(n.d(i,{A:()=>d}),9884==n.j)var t=n(16956);var a=n(78048);if(9884==n.j)var s=n(85848);var o=n(95231),r=n(9626),l=n(27723),c=n(10790);const d=9884==n.j?()=>{const{openSidebar:e}=(0,r.t0)();return(0,c.jsxs)(p,{children:[(0,c.jsx)(h,{children:(0,c.jsx)(t.A,{"aria-hidden":!0,sx:{fontSize:"24px"}})}),e&&(0,c.jsx)(s.A,{variant:"subtitle1",as:"div",children:(0,l.__)("Accessibility","pojo-accessibility")})]})}:null,p=(0,o.I)(a.A)`
	display: flex;
	align-items: center;
	gap: ${({theme:e})=>e.spacing(1.5)};
	white-space: nowrap;
	line-height: 0;
	padding: 0;
`,h=(0,o.I)(a.A)`
	padding: ${({theme:e})=>e.spacing(1)};
	border: 1px solid ${({theme:e})=>e.palette.divider};
	border-radius: ${({theme:e})=>2*e.shape.borderRadius}px;
	color: rgb(0 0 0 / 0.54);
`},70589(e,i,n){if(n.d(i,{A:()=>o}),9884==n.j)var t=n(95726);var a=n(26544),s=n(10790);const o=9884==n.j?()=>(0,s.jsx)(t.A,{disablePadding:!0,children:Object.entries(a.c).map(([e,i])=>(0,s.jsx)(a.Dr,{keyName:e,item:i},e))}):null},14715(e,i,n){n.d(i,{A:()=>g});var t=n(68856);if(9884==n.j)var a=n(70320);if(9884==n.j)var s=n(21370);var o=n(95231),r=n(9626),l=n(59921),c=n(70276),d=n(5522),p=n(27723),h=n(42679);if(9884==n.j)var x=n(74565);var u=n(10790);const g=9884==n.j?()=>{const{planUsage:e,planData:i,dismissedQuotaNotices:n,setDismissedQuotaNotices:t}=(0,r.t0)(),{save:o}=(0,r.rX)(),g="Free"===i?.plan?.name,{isElementorOne:j}=(0,h.F)(),b=e=>{c.K.sendEvent(c.m.upgradeButtonClicked,{feature:"quota notice "+e,component:"upgrade button"}),(0,x.Fe)((0,d.b)(l.qQ[`UPGRADE_${e}`]))},f=e=>{c.K.sendEvent("quota_notice_triggered",{quota_level:e})},y=async e=>{const i=n.includes(e)?n:[...n,e];t(i);try{await o({ea11y_dismissed_quota_notices:i})}catch(e){console.error("Failed to save dismissed notice:",e)}};if(j)return null;if(e.aiCredits<80&&e.scannedPages<80)return null;if(e.aiCredits>=80&&e.aiCredits<95&&!g||e.scannedPages>=80&&e.scannedPages<95&&!g){const e="quota-banner-80";return n.includes(e)?null:(f("80%"),(0,u.jsxs)(m,{severity:"warning",square:!0,onClose:()=>y(e),children:[(0,u.jsx)(s.A,{children:(0,p.__)("You've reached 80% of your monthly plan usage","pojo-accessibility")}),(0,p.__)("Upgrade now to increase your limit and ensure all accessibility features stay fully available for every visitor.","pojo-accessibility"),(0,u.jsx)(a.A,{variant:"outlined",onClick:()=>b("80"),sx:{marginBlockStart:1},children:(0,p.__)("Upgrade now","pojo-accessibility")})]}))}if(e.aiCredits>=95&&e.aiCredits<100&&!g||e.scannedPages>=95&&e.scannedPages<100&&!g){const e="quota-banner-95";return n.includes(e)?null:(f("95%"),(0,u.jsxs)(m,{severity:"error",square:!0,onClose:()=>y(e),children:[(0,u.jsx)(s.A,{children:(0,p.__)("Only 5% of your monthly plan usage left","pojo-accessibility")}),(0,p.__)("Upgrade now to increase your limit and keep all accessibility features running smoothly for every visitor.","pojo-accessibility"),(0,u.jsx)(a.A,{variant:"outlined",onClick:()=>b("95"),sx:{marginBlockStart:1},children:(0,p.__)("Upgrade now","pojo-accessibility")})]}))}if((100===e.aiCredits||100===e.scannedPages)&&!g){const e="quota-banner-100";return n.includes(e)?null:(f("100%"),(0,u.jsxs)(m,{severity:"error",square:!0,onClose:()=>y(e),children:[(0,u.jsx)(s.A,{children:(0,p.__)("You've reached your monthly plan usage","pojo-accessibility")}),(0,p.__)("Upgrade now to raise your limit and maintain complete access to all accessibility features for every visitor.","pojo-accessibility"),(0,u.jsx)(a.A,{variant:"outlined",onClick:()=>b("100"),sx:{marginBlockStart:1},children:(0,p.__)("Upgrade now","pojo-accessibility")})]}))}if(100===e.scannedPages&&g){const e="quota-banner-100-free";return n.includes(e)?null:(f("100%"),(0,u.jsxs)(m,{severity:"error",square:!0,onClose:()=>y(e),children:[(0,u.jsx)(s.A,{children:(0,p.__)("You've reached your free plan limit","pojo-accessibility")}),(0,p.__)("Upgrade to scan more pages, unlock AI fixes, and access all accessibility features.","pojo-accessibility"),(0,u.jsx)(a.A,{variant:"outlined",onClick:()=>b("100"),sx:{marginBlockStart:1},children:(0,p.__)("Upgrade now","pojo-accessibility")})]}))}}:null,m=(0,o.I)(t.Ay)`
	.MuiAlert-content div {
		display: flex;
		flex-direction: column;
		align-items: start;
	}
`},70227(e,i,n){if(n.d(i,{A:()=>g}),9884==n.j)var t=n(42473);if(9884==n.j)var a=n(26368);var s=n(83904),o=n(73916);if(9884==n.j)var r=n(72608);var l=n(95231),c=n(26544),d=n(9626),p=n(85213),h=n(27723),x=n(42679),u=n(10790);const g=9884==n.j?()=>{const{openSidebar:e,setOpenSidebar:i}=(0,d.t0)(),{isElementorOne:n}=(0,x.F)();return(0,u.jsxs)(j,{variant:"permanent",open:e,role:"navigation","aria-label":(0,h.__)("Plugin sidebar","pojo-accessibility"),children:[(0,u.jsx)(m,{onClick:()=>i(!e),size:"small","aria-label":(0,h.__)("Toggle sidebar","pojo-accessibility"),children:(0,u.jsx)(r.A,{in:!e,children:(0,u.jsx)(t.A,{"aria-hidden":!0,fontSize:"tiny"})})}),(0,u.jsxs)(b,{children:[(0,u.jsx)(c.Nt,{}),(0,u.jsx)(a.A,{})]}),(0,u.jsx)(f,{children:(0,u.jsx)(c.wZ,{})}),!n&&(0,u.jsxs)(y,{children:[(0,u.jsx)(a.A,{}),(0,u.jsx)(p.En,{})]})]})}:null,m=(0,l.I)(o.A)`
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
`,j=(0,l.I)(s.A,{shouldForwardProp:e=>"open"!==e})`
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
`,b=(0,l.I)("div")`
	flex-shrink: 0;
	padding: ${({theme:e})=>e.spacing(2,2,0)};
	display: flex;
	flex-direction: column;
	gap: ${({theme:e})=>e.spacing(2)};
`,f=(0,l.I)("div")`
	flex: 1;
	padding: ${({theme:e})=>e.spacing(2)};
	overflow-y: auto;
`,y=(0,l.I)("div")`
	flex-shrink: 0;
`},99418(e,i,n){n.r(i),n.d(i,{default:()=>S});var t=n(78048),a=n(95231),s=n(26544),o=n(97579),r=n(42666),l=n(99028),c=n(49775),d=n(18650),p=n(75260),h=n(85848),x=n(9626),u=n(70276),g=n(27723),m=n(74565),j=n(10790);const b=(0,a.I)(r.A)`
	padding: ${({theme:e})=>e.spacing(2)};
	margin-block: ${({theme:e})=>e.spacing(4)};
	max-width: 1200px;
	margin-inline: auto;
`,f=(0,a.I)(t.A)`
	display: flex;
	align-items: center;
	justify-content: space-between;
`,y=(0,a.I)(d.A)`
	input {
		height: 56px !important;
	}
`,v=(0,a.I)(t.A)`
	display: flex;
	flex-direction: column;
	gap: 16px;
	align-items: flex-start;
	justify-content: start;
	padding-block-start: 16px;
`,A=(0,a.I)(l.A)`
	display: flex;
	align-items: center;
	gap: 8px;
	white-space: nowrap;
	padding-block-start: 7px;
`,_=(0,a.I)(p.A)`
	width: 200px;
	input {
		height: 36px;
	}
`,k=(0,a.I)(h.A)`
	display: flex;
	gap: 8px;
	align-items: center;
`,w=()=>{const{skipToContentSettings:e,setSkipToContentSettings:i,skipToContentHasChanges:n,setSkipToContentHasChanges:a,hasError:s,setHasError:r,setHasChanges:l}=(0,x.t0)(),d=(0,g.__)("This feature allows visitors with visual assistive tools to skip to the main content of each page they’re viewing.","pojo-accessibility"),p=(0,g.__)("This is the HTML ID of the main content area on your pages. Changing this is only needed if your theme uses a custom ID instead of the default #main-content.","pojo-accessibility");return(0,j.jsxs)(b,{variant:"outlined",children:[(0,j.jsxs)(f,{children:[(0,j.jsxs)(k,{variant:"subtitle1",component:"h2",id:"ea11y-skip-to-content-toggle","aria-description":d,children:[(0,g.__)("Skip to main content","pojo-accessibility"),(0,j.jsx)(c.A,{tabIndex:"0",content:(0,j.jsxs)(t.A,{sx:{p:2,maxWidth:"250px"},children:[(0,j.jsx)(h.A,{variant:"subtitle2",sx:{marginBlockEnd:1},children:(0,g.__)("Skip to main content","pojo-accessibility")}),(0,j.jsx)(h.A,{variant:"body2",children:d})]}),placement:"top",arrow:!0,children:(0,j.jsx)(o.A,{fontSize:"small"})})]}),(0,j.jsx)(y,{size:"medium",color:"info",checked:e?.enabled||!1,onChange:()=>{i({...e,enabled:!e.enabled}),r({...s,sitemap:!e?.enabled&&!(0,m.GZ)(e?.anchor)}),a(!0),l(!0)},inputProps:{"area-labelledby":"ea11y-skip-to-content-toggle"}})]}),(0,j.jsx)(h.A,{variant:"body1",children:(0,g.__)("Add skip to content link when using keyboard","pojo-accessibility")}),(0,j.jsxs)(v,{children:[(0,j.jsxs)(A,{htmlFor:"skip-to-content-anchor","aria-description":p,children:[(0,g.__)("Main content ID","pojo-accessibility"),(0,j.jsx)(c.A,{tabIndex:"0",content:(0,j.jsxs)(t.A,{sx:{p:2,maxWidth:"250px"},children:[(0,j.jsx)(h.A,{variant:"subtitle2",sx:{marginBlockEnd:1},children:(0,g.__)("Skip to main content","pojo-accessibility")}),(0,j.jsx)(h.A,{variant:"body2",children:p})]}),placement:"top",arrow:!0,children:(0,j.jsx)(o.A,{fontSize:"small"})})]}),(0,j.jsxs)(t.A,{children:[(0,j.jsx)(_,{id:"skip-to-content-anchor",type:"url",onChange:n=>{i({...e,anchor:n.target.value});const t=(0,m.GZ)(n.target.value);r({...s,skipToContent:!t}),a(t),l(t)},onBlur:()=>{n&&u.K.sendEvent(u.m.fieldContentUpdated,{fieldName:"skip-to-content-anchor",value:e.anchor})},value:e.anchor,error:s.skipToContent,size:"small",variant:"outlined"}),s.skipToContent&&(0,j.jsx)(h.A,{as:"p",variant:"caption",color:"error",sx:{marginBlockStart:"4px"},children:(0,g.__)("Please enter valid ID!","pojo-accessibility")})]})]})]})};var C=n(85213),I=n(41094),$=n(86087);const S=()=>((0,$.useEffect)(()=>{u.K.sendEvent(u.m.pageView,{page:"Capabilities"})},[]),(0,j.jsxs)(I.fM,{children:[(0,j.jsxs)(I.ax,{children:[(0,j.jsx)(T,{variant:"h5",component:"h1",children:(0,g.__)("Capabilities","pojo-accessibility")}),(0,j.jsxs)(P,{children:[(0,j.jsx)(C.DG,{}),(0,j.jsx)(C.P6,{})]}),(0,j.jsx)(w,{}),(0,j.jsx)(s.gp,{})]}),(0,j.jsx)(s.dT,{})]})),P=(0,a.I)(t.A)`
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: ${({theme:e})=>e.spacing(4)};
	max-width: 1200px;
	margin-inline: auto;
`,T=(0,a.I)(I.QP)`
	max-width: 1200px;
	margin: 0 auto 24px;
`},41094(e,i,n){n.d(i,{Nc:()=>u,QP:()=>h,TE:()=>x,ax:()=>p,fM:()=>c,rf:()=>d});var t=n(78048),a=n(23712),s=n(32672),o=n(94284),r=n(85848),l=n(95231);const c=(0,l.I)(t.A)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	max-height: 100%;
	min-height: 50%;
	height: 100%;
	overflow: hidden;
`,d=(0,l.I)(s.A)`
	overflow: auto;
	max-height: 100%;
	padding: ${({theme:e})=>e.spacing(4)};
`,p=(0,l.I)(t.A)`
	overflow: auto;
	max-height: 100%;
	padding: ${({theme:e})=>e.spacing(4)};
	width: 100%;
`,h=(0,l.I)(r.A)`
	display: flex;
	align-items: center;

	margin: 0;

	color: ${({theme:e})=>e.palette.common.black};
	line-height: 1.75;

	.MuiChip-root {
		margin-inline-start: ${({theme:e})=>e.spacing(1)};
		font-weight: 400;
	}
`,x=(0,l.I)(o.A)`
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
`,u=((0,l.I)(s.A)`
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
`,(0,l.I)(a.A)`
	&:last-child {
		padding-block-end: 16px;
	}
`)}}]);