"use strict";(globalThis.webpackChunkpojo_accessibility=globalThis.webpackChunkpojo_accessibility||[]).push([[489],{21622(e,i,n){n.d(i,{w:()=>t});var a=n(86087);const t=(e,i)=>{const n=e.split(/\{\{(\w+)\}\}([^]*?)\{\{\/\1\}\}/g);return n.map((e,t)=>t%3==0?e:t%3==1?(0,a.createElement)(i[e],{key:t},n[t+1]):void 0)}},67340(e,i,n){if(n.d(i,{A:()=>d}),9884==n.j)var a=n(16956);var t=n(78048);if(9884==n.j)var s=n(85848);var r=n(95231),o=n(9626),l=n(27723),c=n(10790);const d=9884==n.j?()=>{const{openSidebar:e}=(0,o.t0)();return(0,c.jsxs)(p,{children:[(0,c.jsx)(h,{children:(0,c.jsx)(a.A,{"aria-hidden":!0,sx:{fontSize:"24px"}})}),e&&(0,c.jsx)(s.A,{variant:"subtitle1",as:"div",children:(0,l.__)("Accessibility","pojo-accessibility")})]})}:null,p=(0,r.I)(t.A)`
	display: flex;
	align-items: center;
	gap: ${({theme:e})=>e.spacing(1.5)};
	white-space: nowrap;
	line-height: 0;
	padding: 0;
`,h=(0,r.I)(t.A)`
	padding: ${({theme:e})=>e.spacing(1)};
	border: 1px solid ${({theme:e})=>e.palette.divider};
	border-radius: ${({theme:e})=>2*e.shape.borderRadius}px;
	color: rgb(0 0 0 / 0.54);
`},70589(e,i,n){if(n.d(i,{A:()=>r}),9884==n.j)var a=n(95726);var t=n(26544),s=n(10790);const r=9884==n.j?()=>(0,s.jsx)(a.A,{disablePadding:!0,children:Object.entries(t.c).map(([e,i])=>(0,s.jsx)(t.Dr,{keyName:e,item:i},e))}):null},14715(e,i,n){n.d(i,{A:()=>g});var a=n(68856);if(9884==n.j)var t=n(70320);if(9884==n.j)var s=n(21370);var r=n(95231),o=n(9626),l=n(59921),c=n(70276),d=n(5522),p=n(27723),h=n(42679);if(9884==n.j)var u=n(74565);var x=n(10790);const g=9884==n.j?()=>{const{planUsage:e,planData:i,dismissedQuotaNotices:n,setDismissedQuotaNotices:a}=(0,o.t0)(),{save:r}=(0,o.rX)(),g="Free"===i?.plan?.name,{isElementorOne:j}=(0,h.F)(),y=e=>{c.K.sendEvent(c.m.upgradeButtonClicked,{feature:"quota notice "+e,component:"upgrade button"}),(0,u.Fe)((0,d.b)(l.qQ[`UPGRADE_${e}`]))},b=e=>{c.K.sendEvent("quota_notice_triggered",{quota_level:e})},f=async e=>{const i=n.includes(e)?n:[...n,e];a(i);try{await r({ea11y_dismissed_quota_notices:i})}catch(e){console.error("Failed to save dismissed notice:",e)}};if(j)return null;if(e.aiCredits<80&&e.scannedPages<80)return null;if(e.aiCredits>=80&&e.aiCredits<95&&!g||e.scannedPages>=80&&e.scannedPages<95&&!g){const e="quota-banner-80";return n.includes(e)?null:(b("80%"),(0,x.jsxs)(m,{severity:"warning",square:!0,onClose:()=>f(e),children:[(0,x.jsx)(s.A,{children:(0,p.__)("You've reached 80% of your monthly plan usage","pojo-accessibility")}),(0,p.__)("Upgrade now to increase your limit and ensure all accessibility features stay fully available for every visitor.","pojo-accessibility"),(0,x.jsx)(t.A,{variant:"outlined",onClick:()=>y("80"),sx:{marginBlockStart:1},children:(0,p.__)("Upgrade now","pojo-accessibility")})]}))}if(e.aiCredits>=95&&e.aiCredits<100&&!g||e.scannedPages>=95&&e.scannedPages<100&&!g){const e="quota-banner-95";return n.includes(e)?null:(b("95%"),(0,x.jsxs)(m,{severity:"error",square:!0,onClose:()=>f(e),children:[(0,x.jsx)(s.A,{children:(0,p.__)("Only 5% of your monthly plan usage left","pojo-accessibility")}),(0,p.__)("Upgrade now to increase your limit and keep all accessibility features running smoothly for every visitor.","pojo-accessibility"),(0,x.jsx)(t.A,{variant:"outlined",onClick:()=>y("95"),sx:{marginBlockStart:1},children:(0,p.__)("Upgrade now","pojo-accessibility")})]}))}if((100===e.aiCredits||100===e.scannedPages)&&!g){const e="quota-banner-100";return n.includes(e)?null:(b("100%"),(0,x.jsxs)(m,{severity:"error",square:!0,onClose:()=>f(e),children:[(0,x.jsx)(s.A,{children:(0,p.__)("You've reached your monthly plan usage","pojo-accessibility")}),(0,p.__)("Upgrade now to raise your limit and maintain complete access to all accessibility features for every visitor.","pojo-accessibility"),(0,x.jsx)(t.A,{variant:"outlined",onClick:()=>y("100"),sx:{marginBlockStart:1},children:(0,p.__)("Upgrade now","pojo-accessibility")})]}))}if(100===e.scannedPages&&g){const e="quota-banner-100-free";return n.includes(e)?null:(b("100%"),(0,x.jsxs)(m,{severity:"error",square:!0,onClose:()=>f(e),children:[(0,x.jsx)(s.A,{children:(0,p.__)("You've reached your free plan limit","pojo-accessibility")}),(0,p.__)("Upgrade to scan more pages, unlock AI fixes, and access all accessibility features.","pojo-accessibility"),(0,x.jsx)(t.A,{variant:"outlined",onClick:()=>y("100"),sx:{marginBlockStart:1},children:(0,p.__)("Upgrade now","pojo-accessibility")})]}))}}:null,m=(0,r.I)(a.Ay)`
	.MuiAlert-content div {
		display: flex;
		flex-direction: column;
		align-items: start;
	}
`},70227(e,i,n){if(n.d(i,{A:()=>g}),9884==n.j)var a=n(42473);if(9884==n.j)var t=n(26368);var s=n(83904),r=n(73916);if(9884==n.j)var o=n(72608);var l=n(95231),c=n(26544),d=n(9626),p=n(85213),h=n(27723),u=n(42679),x=n(10790);const g=9884==n.j?()=>{const{openSidebar:e,setOpenSidebar:i}=(0,d.t0)(),{isElementorOne:n}=(0,u.F)();return(0,x.jsxs)(j,{variant:"permanent",open:e,role:"navigation","aria-label":(0,h.__)("Plugin sidebar","pojo-accessibility"),children:[(0,x.jsx)(m,{onClick:()=>i(!e),size:"small","aria-label":(0,h.__)("Toggle sidebar","pojo-accessibility"),children:(0,x.jsx)(o.A,{in:!e,children:(0,x.jsx)(a.A,{"aria-hidden":!0,fontSize:"tiny"})})}),(0,x.jsxs)(y,{children:[(0,x.jsx)(c.Nt,{}),(0,x.jsx)(t.A,{})]}),(0,x.jsx)(b,{children:(0,x.jsx)(c.wZ,{})}),!n&&(0,x.jsxs)(f,{children:[(0,x.jsx)(t.A,{}),(0,x.jsx)(p.En,{})]})]})}:null,m=(0,l.I)(r.A)`
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
`,y=(0,l.I)("div")`
	flex-shrink: 0;
	padding: ${({theme:e})=>e.spacing(2,2,0)};
	display: flex;
	flex-direction: column;
	gap: ${({theme:e})=>e.spacing(2)};
`,b=(0,l.I)("div")`
	flex: 1;
	padding: ${({theme:e})=>e.spacing(2)};
	overflow-y: auto;
`,f=(0,l.I)("div")`
	flex-shrink: 0;
`},556(e,i,n){n.r(i),n.d(i,{default:()=>C});var a=n(42473),t=n(78048),s=n(86752),r=n(99028),o=n(33022),l=n(55984),c=n(84162),d=n(72608),p=n(85848),h=n(95231),u=n(26544),x=n(96989),g=n(9626),m=n(50438),j=n(85213),y=n(41094),b=n(59921),f=n(70276),v=n(21622),_=n(86087),A=n(27723),w=n(42679),k=n(10790);const C=()=>{const{accessibilityStatementData:e}=(0,g.t0)(),{isOpen:i,open:n,close:h}=(0,g.hS)(!1),[C,E]=(0,_.useState)(!0),[S,$]=(0,_.useState)(""),[q,P]=(0,_.useState)(!1),{isRTL:B}=(0,w.F)();(0,_.useEffect)(()=>{f.K.sendEvent(f.m.pageView,{page:"Accessibility statement"})},[]),(0,_.useEffect)(()=>{E(!1)},[S]),(0,_.useEffect)(()=>{E(!0)},[]);const T=e=>()=>{$(e),f.K.sendEvent(f.m.statementFlowSelected,{flowType:e})};return(0,k.jsxs)(k.Fragment,{children:[(0,k.jsxs)(y.fM,{children:[(0,k.jsxs)(y.ax,{children:[(0,k.jsx)(I,{variant:"h5",component:"h1",children:(0,A.__)("Accessibility statement","pojo-accessibility")}),(0,k.jsx)(p.A,{variant:"body2",color:"text.primary",maxWidth:"1200px",margin:"0 auto 24px",paddingInlineEnd:"40%",children:(0,v.w)((0,A.__)("An accessibility statement showcases your efforts to create an inclusive online space, highlighting helpful features and a commitment to accessibility. {{link}}Learn more{{/link}}","pojo-accessibility"),{link:({children:e})=>(0,k.jsx)(o.A,{href:b.qQ.LEARN_MORE_STATEMENT,target:"_blank",rel:"noopener noreferrer",color:"secondary",underline:"hover",children:e})})}),!e?.pageId&&!q&&(0,k.jsx)(k.Fragment,{children:(0,k.jsxs)(s.A,{sx:{display:"flex",justifyContent:"center",width:"100%"},children:[(0,k.jsxs)(r.A,{id:"icon-select-radio-buttons-group-label",color:"secondary",children:[(0,k.jsx)(p.A,{variant:"h6",component:"h2",color:"text.primary",align:"center",marginBlockEnd:"4px",marginBlockStart:4,children:(0,A.__)("Need an accessibility statement?","pojo-accessibility")}),(0,k.jsx)(p.A,{variant:"body2",color:"text.secondary",marginBlockEnd:3,align:"center",children:(0,A.__)("You can have a statement created for you or use what you already have.","pojo-accessibility")})]}),(0,k.jsxs)(c.A,{"aria-labelledby":"icon-select-radio-buttons-group-label",name:"icon-select-radio-buttons-group",value:S,sx:{display:"flex",justifyContent:"center",flexDirection:"row",flexWrap:"nowrap",gap:5,width:"100%"},children:[(0,k.jsxs)(y.TE,{variant:"outlined",onClick:T("generate"),sx:{borderColor:"generate"===S?"info.main":"divider",borderWidth:"generate"===S?2:1},children:[(0,k.jsx)(m.$9,{}),(0,k.jsx)(p.A,{marginBlockStart:1,children:(0,A.__)("Yes, I need one","pojo-accessibility")}),(0,k.jsx)(l.A,{value:"generate",sx:{opacity:0,position:"absolute"}})]},"generate-accessibility-statement"),(0,k.jsxs)(y.TE,{variant:"outlined",onClick:T("existing"),sx:{borderColor:"existing"===S?"info.main":"divider",borderWidth:"existing"===S?2:1},children:[(0,k.jsx)(m.MH,{}),(0,k.jsx)(p.A,{marginBlockStart:1,children:(0,A.__)("No, I already have one","pojo-accessibility")}),(0,k.jsx)(l.A,{value:"existing",sx:{opacity:0,position:"absolute"}})]},"existing-accessibility-statement")]})]})}),(e?.pageId||q)&&(0,k.jsxs)(t.A,{width:"100%",maxWidth:"1200px",marginInline:"auto",children:[!e?.pageId&&(0,k.jsx)(x.A,{size:"large",color:"secondary",startIcon:(0,k.jsx)(d.A,{in:B,children:(0,k.jsx)(a.A,{"aria-hidden":!0,fontSize:"small"})}),onClick:()=>{E(!1),P(!1)},children:(0,A.__)("Back","pojo-accessibility")}),(0,k.jsx)(j.u5,{})]})]}),!e?.pageId&&!q&&(0,k.jsx)(t.A,{display:"flex",justifyContent:"end",p:2,width:"100%",sx:{borderBlockStart:"1px solid rgb(0 0 0 / 0.12)"},children:(0,k.jsx)(x.A,{color:"primary",variant:"contained",disabled:C,onClick:()=>{"generate"===S?(n(),E(!0)):"existing"===S&&P(!0)},sx:{alignSelf:"end"},children:(0,A.__)("Continue","pojo-accessibility")})})]}),(0,k.jsx)(u.Dg,{open:i,close:h})]})},I=(0,h.I)(y.QP)`
	max-width: 1200px;
	margin: 0 auto 24px;
`},41094(e,i,n){n.d(i,{Nc:()=>x,QP:()=>h,TE:()=>u,ax:()=>p,fM:()=>c,rf:()=>d});var a=n(78048),t=n(23712),s=n(32672),r=n(94284),o=n(85848),l=n(95231);const c=(0,l.I)(a.A)`
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
`,p=(0,l.I)(a.A)`
	overflow: auto;
	max-height: 100%;
	padding: ${({theme:e})=>e.spacing(4)};
	width: 100%;
`,h=(0,l.I)(o.A)`
	display: flex;
	align-items: center;

	margin: 0;

	color: ${({theme:e})=>e.palette.common.black};
	line-height: 1.75;

	.MuiChip-root {
		margin-inline-start: ${({theme:e})=>e.spacing(1)};
		font-weight: 400;
	}
`,u=(0,l.I)(r.A)`
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
`,x=((0,l.I)(s.A)`
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
`,(0,l.I)(t.A)`
	&:last-child {
		padding-block-end: 16px;
	}
`)}}]);