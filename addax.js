window.addax = (function(){

    var getNodesFromIdSelector = function(selector,context){

          var node = document.getElementById(selector);
          return (node) ? [node] : [];

        },

        getNodesByClassName = function(name,context){

            var node = context['firstChild'],
                nodes = [],
                elements;

            if(node){
                do{
                    
                    if(node.nodeType == 1){

                        if(node.className && node.className.match('\\b' + name + '\\b')) nodes.push(node);
                      
                        if((elements = getNodesByClassName(name,node))['length']) nodes = nodes.concat(elements);
                    
                    }
                }

                while(node = node['nextSibling']);
            
            }

            return nodes;
        
        },

        getNodesFromClassSelector = function(selector,context){

            if(context['getElementsByClassName']){
                return context['getElementsByClassName'](selector);
            }else{
                return getNodesByClassName(selector,context);
            }

        },

        getNodesFromTagSelector = function(selector,context){
            return context.getElementsByTagName(selector);
        },

     module = {

        ready: function(fn,win){

          win = window;

          var done = false, top = true,

          doc = win.document, root = doc.documentElement,

          add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
          rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
          pre = doc.addEventListener ? '' : 'on',

          init = function(e){

            if (e.type == 'readystatechange' && doc.readyState != 'complete') return;

            (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);

            if (!done && (done = true)) fn.call(win, e.type || e);

          },

          poll = function(){

            try{ root.doScroll('left'); }catch(e){ setTimeout(poll, 50); return; }
            init('poll');
            
          };

          if(doc.readyState == 'complete') fn.call(win, 'lazy');

          else{

            if(doc.createEventObject && root.doScroll){

              try{ top = !win.frameElement; }catch(e) { }
              if(top) poll();

            }

            doc[add](pre + 'DOMContentLoaded', init, false);
            doc[add](pre + 'readystatechange', init, false);
            win[add](pre + 'load', init, false);

          }

        },

        get: function(selectors,context){

          if(!context){
                context = document;
            }
            if(typeof context == 'object' && context.pop){

                context = context[0];

            }

            var local_contexts,
                future_local_contexts,
                selector,
                elements,
                nodes = [],
                j,k,l,m,n,o,
                getNodesFromSelector;    

            if(typeof selectors == 'object'){

              var objExtract = (selectors.outerHTML.split(' ')[0]).split('<')[1],
                  auxExtract,
                  pointer,
                  auxCategory = ['class','id'],
                  outerHTMLSelector = selectors.outerHTML;

              for(var i in auxCategory){

                  if(outerHTMLSelector.indexOf(objExtract + ' ' + auxCategory[i]) !== -1){

                      pointer = (auxCategory[i] == 'class') ? '.' : '#';

                      var numExtractElement = new String(objExtract + ' ' + auxCategory[i] +'="').length + 1;

                      for(var i = 0; i < outerHTMLSelector.length ; i++){

                        if(!/"| /.test(outerHTMLSelector.slice(numExtractElement,i + numExtractElement))){

                          auxExtract = outerHTMLSelector.slice(numExtractElement,i + numExtractElement);

                        }

                      }

                        selectors = new Array(pointer + auxExtract);

                      }else{

                        selectors = new Array(objExtract);

                      }

              }

            }else{

              selectors = selectors.split(',');

            }

            n = -1;
            while(selector = selectors[++n]){
                selectors[n] = selector.split(/\s+/);
            }

            j = selectors['length'];
            while(j){

                local_contexts = [context];

                k = -1;
                l = selectors[--j]['length'];
                while(++k<l){

                    if(selector = selectors[j][k]){
                        // Id
                        if(selector.charAt(0) == '#'){
                            selector = selector.substr(1);
                            getNodesFromSelector = getNodesFromIdSelector;
                        }
                        // Class
                        else if(selector.charAt(0) == '.'){
                            selector = selector.substr(1);
                            getNodesFromSelector = getNodesFromClassSelector;
                        }
                        // Tag
                        else{
                            getNodesFromSelector = getNodesFromTagSelector;
                        }

                        future_local_contexts = [];
                        m = -1;
                        while(local_contexts[++m]){
                            elements = getNodesFromSelector(selector,local_contexts[m]);
                            n = -1;
                            o = elements['length'];
                            while(++n<o){
                                future_local_contexts.push(elements[n]);
                            }
                        }

                        local_contexts = future_local_contexts;
                    }
                }

                nodes = nodes.concat(local_contexts);
            }

            return addax.extend(local_contexts, module);

        },

        ajax: function(o){

          this.bindFunction = function(caller, object){

            return function(){
              return caller.apply(object, [object]);
            };

          };

          this.stateChange = function(object){

            if(this.request.readyState == 4){

              if(this.request.status == 200){

                this.success(eval( "(" + this.request.responseText + ")" ) );

              }

            }
          
          };

          this.getRequest = function(){

            if(window.ActiveXObject){
              return new ActiveXObject('Microsoft.XMLHTTP');
            }else if(window.XMLHttpRequest){
              return new XMLHttpRequest();
            }

            return false;
          };

          this.postBody = (o.data || ""); //(arguments[2] || "");

          this.success = o.success;
          this.errortrack = o.errortrack;
          this.url = o.url;
          this.request = this.getRequest();
          
          if(this.request){
            var req = this.request;
            req.onreadystatechange = this.bindFunction(this.stateChange, this);

            if(this.postBody !== "" && o.type == 'POST'){

              req.open("POST", o.url, true);
              req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
              req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
              req.setRequestHeader('Connection', 'close');

            }else if(o.type == 'GET'){

              req.open("GET", o.url, true);

            }

            req.send(this.postBody);
          }

        },

        parseJSON: function(data){

          if(typeof data !== "string" || !data){
            return null;
          }

          var obj = eval("(function(){return " + data + ";})()");

          return obj;

        },

        bind: function(type,fn){

          if(this[0] == undefined) return [];

          for(var i in this){

            if(typeof this[i] == 'object'){

              if(this[i].attachEvent){

                this[i]['e' + type + fn] = fn;
                this[i][type + fn] = (function(){this[i]['e' + type + fn]( window.event );})(this);
                this[i].attachEvent( 'on' + type, this[i][type + fn] );

              }else{

                this[i].addEventListener( type, fn, false );

              }

            }

          }

        },

        unbind: function(type,fn){

          for(var i in this){

            if(typeof this[i] == 'object'){

              if (this[i].detachEvent){
              
                this[i].detachEvent('on' + type, this[i][type + fn] );
                this[i][type + fn] = null;
              
              }else{

                this[i].removeEventListener( type, fn, false );
              
              }

            }

          }

        },
         
        /* FORK */

        html: function(what,callback){

          if(this[0] == undefined) return [];

          if(what == undefined){

            this[0].cloneNode(true);
            (callback != undefined) ? callback() : false;

          }else{

            this[0].innerHTML = what;
            (callback != undefined) ? callback() : false;
            
          }

          return this;

        },

        toDOM: function(what){

          var d = document
             ,i
             ,a = d.createElement("div")
             ,b = d.createDocumentFragment();
          a.innerHTML = what;
          
          while(i = a.firstChild) b.appendChild(i);
          
          return b;

        },

        append: function(what){

          if(this[0] == undefined) return [];

          return this[0].appendChild(module.toDOM(what));

        },

        prepend: function(what){

          if(this[0] == undefined) return [];

          return this[0].insertBefore(module.toDOM(what),this[0].firstChild);

        },

        before: function(what){

          if(this[0] == undefined) return [];

          return this[0].parentNode.insertBefore(module.toDOM(what),this[0]);

        },

        remove: function(){

          if(this[0] == undefined) return [];

          return this[0].parentElement.removeChild(this[0]);
        
        },

        val: function(){

          if(this[0] == undefined) return [];

          return this[0].value;

        },

        parent: function(){

          /*var parent = this[0].parentNode,
              el;

          if(parent.id.split('').shift() == undefined){ }*/

        },

        next: function(){

          if(this[0] == undefined) return [];

          var next = this[0].nextSibling.nextSibling,
              el;

          if(next.id != ''){

            el = addax.find('#' + next.id);

          }else{

            el = addax.find('.' + next.className);

          }

          return el; 

        },

        prev: function(){

          if(this[0] == undefined) return [];

          var prev = this[0].previousSibling.previousSibling,
                el;

           if(prev.id != ''){

              el = addax.find('#' + prev.id);

            }else{

              el = addax.find('.' + prev.className);

            }

            return el;  

        },

        /* END */

        hasClass: function(cls){

          if(this[0] == undefined) return [];

          return (this[0].className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))[0]) ? true : false;

        },

        addClass: function(cls){

          if(this[0] == undefined) return [];

          for(var i in this){

            this[i].className += " " + cls;

          }

          return this;

          
        },

        removeClass: function(cls){

          if(this[0] == undefined) return [];

          for(var i in this){

            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            this[i].className = this[i].className.replace(reg,' ');

          }

          return this;

        },

        filter: function(f){

          if(this[0] == undefined) return [];

          var el;

           if(this.id != ''){

              el = addax.find('#' + this[0].id + ' ' + f);

            }else{

              el = addax.find('.' + this[0].className + ' ' + f);

            }

            return el;

        },

        show: function(){

          if(this[0] == undefined) return [];

          var dom = this[0],
              el;

           if(dom.id != ''){

              el = addax.find('#' + dom.id).css('display','block');

            }else{

              el = addax.find('.' + dom.className).css('display','block');
            }

            return el;  

        },

        hide: function(){

          if(this[0] == undefined) return [];

          var dom = this[0],
              el;

           if(dom.id != ''){

              el = addax.find('#' + dom.id).css('display','none');

            }else{

              el = addax.find('.' + dom.className).css('display','none');

            }

            return el;  

        },

        attr: function(name, value) {

          if(this[0] == undefined) return [];
          
          if (!value) return this[0].getAttribute(name);
          this[0].setAttribute(name, value);

          return this;
        
        },

        css: function(name, value) {

          if(this[0] == undefined) return [];

          if (!value) return this[0].style[name];
          this[0].style[name] = value;
                
          return this;
            
        },

        tmpl: function(template){

            var blockregex = /\{\{(([@!]?)(.+?))\}\}(([\s\S]+?)(\{\{:\1\}\}([\s\S]+?))?)\{\{\/\1\}\}/g,
              valregex = /\{\{([=%])(.+?)\}\}/g;

            this.tmpl = template;

            var scrub = function(val){
              return new Option(val).innerHTML.replace(/"/g,"&quot;");
            }

            var getValue = function(vars, key){

              var parts = key.split('.');

              while(parts.length){

                if(!(parts[0] in vars)){
                  return false;
                }

                vars = vars[parts.shift()];

              }

              return vars;

            }

            var render = function(fragment, vars){

              return fragment
                .replace(blockregex, function(_, __, meta, key, inner, if_true, has_else, if_false){

                  var val = getValue(vars,key), temp = "", i;

                  if(!val){

                    // handle if not
                    if(meta == '!'){
                      return render(inner, vars);
                    }
                    // check for else
                    if(has_else){
                      return render(if_false, vars);
                    }

                    return "";
                  }

                  // regular if
                  if(!meta){
                    return render(if_true, vars);
                  }

                  // process array/obj iteration

                  if(meta == '@'){

                    // store any previous vars
                    // reuse existing vars

                    _ = vars._key;
                    __ = vars._val;
                    for(i in val){
                      if(val.hasOwnProperty(i)){
                        vars._key = i;
                        vars._val = val[i];
                        temp += render(inner, vars);
                      }
                    }
                    vars._key = _;
                    vars._val = __;
                    return temp;
                  }

                })
                .replace(valregex, function(_, meta, key){
                  var val = getValue(vars,key);

                  if(val || val === 0){
                    return meta == '%' ? scrub(val) : val;
                  }
                  return "";
                });
            }

            module.tmpl.prototype.render = function(vars){
              return render(this.tmpl, vars);
            };
        
        }
    
    }

    return {

      ready: function(fn,win){

        return this._(module.ready)(fn,win);

      },

      find: function(selectors,context){
        return (selectors == undefined) ? [] : this._(module.get)(selectors,context);
      },

      extend: function(el, opt){

        for (var name in opt) el[name] = opt[name];
        return el;

      },

      fn: function(){

        return module;

      }(),

      ajax: function(url,callbackFunction){
        return this._(module.ajax)(url,callbackFunction);
      },

      parseJSON: function(data){
        return this._(module.parseJSON)(data);
      },
        
      template: function(template){
        return new module.tmpl(template);
      },

      _:function(callback){
          var self = this;
          return function(){
            return callback.apply(self,arguments);
          };

      }
        
    };

}());

/* SET ALIAS */

$ = function(selectors,context){ return addax.find(selectors,context) }
$$ = addax;