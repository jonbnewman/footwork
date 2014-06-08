define(["jquery","lodash","knockout-footwork","jquery.pulse"],function(e,t,n){var r=n.model({namespace:"PageSection",afterCreating:function(){this.visible(!1)},factory:function(r){var i=n.namespace("PaneElements"),s,o=100;r=r||{},this.pageBaseURL=n.observable().receiveFrom("Page","baseURL"),this.currentSection=n.observable().receiveFrom("PageSections","currentSection"),this.chosenSection=n.observable().receiveFrom("PageSections","chosenSection"),this.paneCollapsed=n.observable().receiveFrom("Pane","collapsed"),this.viewPortLayoutMode=n.observable().receiveFrom("ViewPort","layoutMode"),this.visible=n.observable(null).extend({autoEnable:t.random(200,600)}),this.title=n.observable(r.title),this.description=n.observable(r.description),this.anchor=n.observable(r.anchor),this.active=n.computed(function(){return this.currentSection()===this.anchor()},this),this.anchorAddress=n.computed(function(){return this.pageBaseURL()+"#"+this.anchor()},this),this.anchorPosition=n.observable(),s=function(){this.anchorPosition(e("[name="+this.anchor()+"]").offset())}.bind(this),s(),n.observable().extend({throttle:o}).receiveFrom("ViewPort","layoutMode").subscribe(s),n.observable().extend({throttle:o}).receiveFrom("ViewPort","dimensions").subscribe(s),n.observable().extend({throttle:o}).receiveFrom("Header","height").subscribe(s),n.observable().extend({throttle:o}).receiveFrom("Pane","width").subscribe(s),n.observable().extend({throttle:o+1e3}).receiveFrom("Pane","collapsed").subscribe(s),this.namespace.subscribe("chooseSection",function(e){e===this.anchor()&&this.chooseSection()}).withContext(this),this.namespace.subscribe("scrollToSection",function(t){var n;t===this.anchor()&&(this.chooseSection(),n=e("[name="+this.anchor()+"]"),n.length&&window.scrollTo(0,n.offset().top))}).withContext(this),i.subscribe("hideAll",function(){this.visible(!1)}).withContext(this),this.chooseSection=function(){var t=this.anchor();return this.chosenSection(""),this.chosenSection(t),e("section[name="+t+"]").pulse({className:"active",duration:1e3}),this.viewPortLayoutMode()==="mobile"&&this.paneCollapsed(!0),!0}.bind(this)}});return n.model({namespace:"PageSections",factory:function(){this.visible=n.observable(!1),this.description=n.observable(),this.initialized=n.observable(!0),this.currentSelection=n.observable().receiveFrom("PaneLinks","currentSelection"),this.paneContentMaxHeight=n.observable().receiveFrom("Pane","contentMaxHeight").extend({units:"px"}),this.defaultPaneSelection=n.observable().receiveFrom("PaneLinks","defaultSelection"),this.title=n.observable().receiveFrom("Page","shortTitle"),this.viewPortScrollPos=n.observable().receiveFrom("ViewPort","scrollPosition"),this.viewPortLayoutMode=n.observable().receiveFrom("ViewPort","layoutMode"),this.sections=n.observable().broadcastAs("sections"),this.highlightSection=n.observable().broadcastAs("highlightSection").extend({autoDisable:300}),this.chosenSection=n.observable(null).extend({write:function(e,t){e(t),this.highlightSection(t),this._chosenRead=!1}.bind(this)}).broadcastAs("chosenSection",!0),this.hasSections=n.computed(function(){var e=this.description()||"",t=this.sections()||[];return t.length||e.length},this).broadcastAs("hasSections"),this.sectionCount=n.computed(function(){var e=this.sections()||[];return e.length},this).broadcastAs("sectionCount"),this.currentSection=n.computed(function(){var e=this.sections(),n=this.viewPortScrollPos(),r=this.chosenSection(),i=this._chosenRead;return this._chosenRead=!0,i!==!0&&r||t.reduce(e,function(e,t){return typeof t.anchorPosition()=="object"&&n>=t.anchorPosition().top?t.anchor():e},!1)},this).broadcastAs("currentSection"),this.loadSections=function(e){e=e||[],this.sections(t.reduce(e,function(e,t){return e.push(new r(t)),e},[])),this.hasSections()&&this.viewPortLayoutMode()!=="mobile"?this.currentSelection(this.namespaceName):this.currentSelection(this.defaultPaneSelection())}.bind(this),this.namespace.subscribe("clear",function(){this.sections([])}).withContext(this),this.namespace.subscribe("load",function(e){e&&(e.description&&this.description(e.description),this.loadSections(e.sections))}).withContext(this),this.currentSelection.subscribe(function(e){this.visible(e===this.namespaceName)},this)}})});