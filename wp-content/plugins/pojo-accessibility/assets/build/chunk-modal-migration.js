"use strict";(globalThis.webpackChunkpojo_accessibility=globalThis.webpackChunkpojo_accessibility||[]).push([[8101],{32155(i,e,s){s.r(e),s.d(e,{default:()=>O});var t=s(50602),o=s(77374),n=s(74456),c=s(76656),a=s(16146),l=s(33022),r=s(95726),d=s(57936),b=s(62646),y=s(85848),p=s(95231),u=s(9626),_=s(59921),h=s(208),m=s(70276),g=s(86087),j=s(27723),A=s(47064),v=s(10790);const x=(0,p.I)(a.A)`
	position: relative;

	> div {
		padding: ${({theme:i})=>`\n\t\t\t${i.spacing(2)} \n\t\t\t${i.spacing(4.5)}\n\t\t\t${i.spacing(2)}\n\t\t\t${i.spacing(2.75)}\n\t\t`};
		min-height: auto;
	}
`,w=(0,p.I)(y.A)`
	line-height: 1.5;
`,k=(0,p.I)(r.A)`
	padding-inline-start: ${({theme:i})=>i.spacing(2)};
	list-style-type: disc;
`,f=(0,p.I)(d.A)`
	padding-block: 0;
	min-height: auto;
`,$=(0,p.I)(b.A)`
	display: list-item;
	color: ${({theme:i})=>i.palette.text.secondary};
	margin: 0;
`,W=(0,p.I)(n.A)`
	padding: ${({theme:i})=>i.spacing(2,3)};
`,O=({onClose:i})=>{const e=(0,h.m)(),{save:s}=(0,u.rX)(),[n,a]=(0,g.useState)(!1),r=(i,e,s=null,t)=>{m.K.oneMigration.trackButtonClicked(i,e,s,t)},d=async()=>{r("not_now","skip_migration",null),await(async()=>{await s({ea11y_migration_popup_dismissed:!0})})(),i(),e.hint((0,v.jsxs)(v.Fragment,{children:[(0,j.__)("You can always migrate your subscriptions from the","pojo-accessibility")," ",(0,v.jsx)(l.A,{href:_.$5,underline:"always",children:(0,j.__)("Tool Manager","pojo-accessibility")}),"."]}))};return(0,v.jsxs)(o.A,{open:!0,onClose:d,maxWidth:"sm",fullWidth:!0,"aria-labelledby":"migration-dialog-title",children:[(0,v.jsx)(x,{logo:!1,children:(0,v.jsx)(w,{variant:"subtitle1",component:"h2",fontWeight:600,id:"migration-dialog-title",children:(0,j.__)("Move Web Accessibility to Elementor One","pojo-accessibility")})}),(0,v.jsxs)(c.A,{children:[(0,v.jsx)(y.A,{variant:"body2",color:"text.secondary",marginBlockEnd:2,children:(0,j.__)("Web Accessibility is currently active with its own subscription. You also have an Elementor One subscription for this site.","pojo-accessibility")}),(0,v.jsx)(y.A,{variant:"body2",color:"text.secondary",marginBlockEnd:1,children:(0,j.__)("If you switch to Elementor One:","pojo-accessibility")}),(0,v.jsxs)(k,{dense:!0,disablePadding:!0,children:[(0,v.jsx)(f,{disableGutters:!0,children:(0,v.jsx)($,{primary:(0,j.__)("Your current Web Accessibility subscription will be deactivated","pojo-accessibility")})}),(0,v.jsx)(f,{disableGutters:!0,children:(0,v.jsx)($,{primary:(0,j.__)("Web Accessibility will use your shared Elementor One credits","pojo-accessibility")})})]})]}),(0,v.jsxs)(W,{children:[(0,v.jsx)(t.A,{color:"secondary",variant:"outlined",onClick:d,disabled:n,children:(0,j.__)("Not now","pojo-accessibility")}),(0,v.jsx)(t.A,{variant:"contained",onClick:async()=>{a(!0);try{const s=await A.A.migrateToOne();s?.isMigrated?(r("move_to_one","migration_success","success"),i(),e.success((0,j.__)("Web Accessibility has successfully moved to your One subscription.","pojo-accessibility")),setTimeout(()=>{window.location.reload()},1500)):(a(!1),r("move_to_one","migration_failed","failed"),e.error((0,j.__)("Web Accessibility could not move to your One subscription. Please try again.","pojo-accessibility")))}catch(i){a(!1);const s=i?.message??(0,j.__)("Unknown error","pojo-accessibility");r("move_to_one","migration_failed","failed",i?.code??s),e.error(`${(0,j.__)("Web Accessibility could not move to your One subscription.","pojo-accessibility")} ${(0,j.__)("Error:","pojo-accessibility")} ${s}`)}},disabled:n,children:(0,j.__)("Move to One","pojo-accessibility")})]})]})}}}]);