define(["jquery","lodash","knockout-footwork","storage"],function(e,t,n,r){return n.model({namespace:"Configuration",factory:function(){var i=35,s,o,u,a,f=n.observable({revision:6,header:{min:{height:i},max:{height:60},contentMaxHeight:80,limit:{height:320},borderWidth:5,autoHide:!1},links:{min:{width:155},max:{width:195}},pane:{min:{width:161},max:{width:440},collapsed:!1,accentPadding:20},dialog:{help:!0,notice:!0},transitions:!0});return this.scrollPosition=n.observable(0).receiveFrom("ViewPort","scrollPosition"),this.headerFixed=n.observable(!1).receiveFrom("Header","fixed"),this.headerClosed=n.observable(!1).receiveFrom("Header","closed"),this.headerMoving=n.observable(!1).receiveFrom("Header","moving"),this.navReflowing=n.observable(!1).receiveFrom("Navigation","reflowing"),this.paneAbsoluteMaxWidth=n.observable().receiveFrom("Pane","maxWidth"),this.paneAnimate3d=n.observable().receiveFrom("Pane","animate3d"),this.paneMoving=n.observable().receiveFrom("Pane","moving"),this.viewPortLayoutMode=n.observable().receiveFrom("ViewPort","layoutMode"),this.viewPortSmall=n.observable().receiveFrom("ViewPort","isSmall"),this.currentTheme=n.observable().receiveFrom("Themes","currentTheme"),this.saveSession=n.observable(r.get("saveSession")).broadcastAs("saveSession",!0),this.config=n.observable(this.saveSession()===!0&&r.get("configuration")||e.extend(!0,{},f())),this.savePulse=n.observable(!1).extend({autoDisable:1e3}).broadcastAs("savePulse"),this.throttledConfig=this.config.extend({throttle:300}),this.throttledConfig.extend({throttle:300}).subscribe(u=function(e){e=e||this.config(),this.saveSession()===!0&&(r.set("configuration",e),this.savePulse(!0))}.bind(this)),this.visible=n.observable(!1).broadcastAs("visible",!0),this.heightMutable=n.computed(function(){return this.visible()&&(!this.headerFixed()||this.scrollPosition()===0)},this).broadcastAs("heightMutable"),this.isMobile=n.observable(r.get("viewPortIsMobile")||window.isMobile).broadcastAs("isMobile",!0),this.defaultHeaderMaxHeight=n.computed(function(){return f().header.max.height},this).broadcastAs("defaultHeaderMaxHeight"),this.defaultPaneMaxWidth=n.computed(function(){return f().pane.max.width},this).broadcastAs("defaultPaneMaxWidth"),this.transitionsEnabled=n.computed({read:function(){return this.config().transitions},write:function(e){s({transitions:e})}},this).broadcastAs("transitionsEnabled",!0),this.headerMinHeight=n.computed({read:function(){return this.config().header.min.height},write:function(e){s({header:{min:{height:e}}})}},this).broadcastAs("headerMinHeight",!0),this.headerMaxHeight=n.computed({read:function(){return this.viewPortLayoutMode()==="desktop"||this.viewPortLayoutMode()==="tablet"?this.config().header.max.height:this.config().header.min.height},write:function(e){s({header:{max:{height:e}}})}},this).broadcastAs("headerMaxHeight",!0),this.headerContentMaxHeight=n.computed({read:function(){return this.config().header.contentMaxHeight},write:function(e){s({header:{contentMaxHeight:e}})}},this).broadcastAs("headerContentMaxHeight",!0),this.headerBorderWidth=n.computed({read:function(){return this.config().header.borderWidth},write:function(e){s({header:{borderWidth:e}})}},this).broadcastAs("headerBorderWidth",!0),this.headerLimitHeight=n.computed({read:function(){return this.config().header.limit.height},write:function(e){s({header:{limit:{height:e}}})}},this).broadcastAs("headerLimitHeight",!0),this.paneMinWidth=n.computed({read:function(){return this.config().pane.min.width},write:function(e){s({pane:{min:{width:e}}})}},this).broadcastAs("paneMinWidth",!0),this.paneMaxWidth=n.computed({read:function(){return this.config().pane.max.width},write:function(e){s({pane:{max:{width:e}}})}},this).broadcastAs("paneMaxWidth",!0),this.paneCollapsed=n.computed({read:function(){return this.config().pane.collapsed},write:function(e){((this.navReflowing()===!0||this.reflowing()===!0)&&this.paneAnimate3d()===!0)==0?s({pane:{collapsed:e}}):this.namespace.publish("paneCollapsed",!e)}},this).broadcastAs("paneCollapsed",!0),this.paneAccentPadding=n.computed({read:function(){return this.config().pane.accentPadding},write:function(e){s({pane:{accentPadding:e}})}},this).broadcastAs("paneAccentPadding",!0),this.linksMinWidth=n.computed({read:function(){return this.config().links.min.width},write:function(e){s({links:{min:{width:e}}})}},this).broadcastAs("linksMinWidth",!0),this.linksMaxWidth=n.computed({read:function(){return this.config().links.max.width},write:function(e){s({links:{min:{width:e}}})}},this).broadcastAs("linksMaxWidth",!0),this.helpDialog=n.computed({read:function(){return this.config().dialog.help},write:function(e){s({dialog:{help:e}})}},this).broadcastAs("helpDialog",!0),this.noticeDialog=n.computed({read:function(){return this.config().dialog.notice},write:function(e){s({dialog:{notice:e}})}},this).broadcastAs("noticeDialog",!0),this.autoHideHeader=n.computed({read:function(){return this.config().header.autoHide},write:function(e){s({header:{autoHide:e}})}},this).broadcastAs("autoHideHeader",!0),this.reflowing=n.observable(!1).broadcastAs("reflowing"),s=this.setConfig=function(t){this.config(e.extend(!0,{},this.config(),t))}.bind(this),this.updateSession=function(){clearTimeout(a),this.saveSession()===!0&&typeof this.currentTheme()=="object"&&(a=setTimeout(function(){var n={},r=this.currentTheme();typeof r=="object"&&r.params!==undefined&&(n.theme=r.params()),t.size(n)>0&&e.post("/session/update",n)}.bind(this),3e3))}.bind(this),this.namespace.subscribe("updateSession",this.updateSession).withContext(this),this.namespace.subscribe("reset",o=function(t){if(this.navReflowing()===!0||this.paneMoving()===!0||this.headerMoving()===!0)return!1;this.headerClosed(!1);var n=this.defaultPaneMaxWidth(),r=this.paneAbsoluteMaxWidth(),i=this.paneCollapsed()===!1?this.paneMaxWidth():0,o={header:this.headerMaxHeight(),pane:r<i?r:i},u={header:this.defaultHeaderMaxHeight(),pane:r<n?r:n},a={header:{max:{height:o.header}},pane:{max:{width:o.pane}}},l=e.extend(!0,{},f());if(this.viewPortSmall()||this.viewPortLayoutMode()!=="desktop")u.pane=n,l.pane.collapsed=this.paneCollapsed();s(e.extend(!0,{},l,a)),this._globalChannel.publish("configReset"),this.reflowing(!0),e(o).animate(u,{duration:t===!0?0:1e3,specialEasing:{header:"easeOutElastic",pane:"easeOutElastic"},step:function(e,t){t.prop==="header"?this.headerMaxHeight(parseInt(e,10)):this.paneMaxWidth(parseInt(e,10))}.bind(this),complete:function(){this.paneMaxWidth(n),this.reflowing(!1)}.bind(this)})}.bind(this)),this.configVersionCheck=n.computed(function(){(this.config().revision||0)!==f().revision&&o(!0)},this),this.isMobile.subscribe(function(e){r.set("viewPortIsMobile",e)},this),this.saveSession.subscribe(function(e){r.set("saveSession",e),e&&(u(),this.updateSession())},this),this}})});