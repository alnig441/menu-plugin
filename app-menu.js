(function(){

  // document.addEventListener("readystatechange", function(e) {
  //
  //   if(document.readyState === "loading") {
  //     console.log("loading: ", document.getElementById("app-menu").getAttribute("class"));
  //   }
  //
  //   if(document.readyState === "interactive") {
  //     console.log("interactive ", document.getElementById("app-menu").getAttribute("class"));
  //
  //   }
  //
  //   if(document.readyState === 'complete') {
  //     console.log("complete: ", document.getElementById("app-menu").getAttribute("class"));
  //     init();
  //   }
  // })

  window.addEventListener("load", function(e){
    // console.log('window load: ', document.getElementById("app-menu").getAttribute("class"));
    init();
  })

  document.addEventListener('click', function(e){
    hideMenu();
  })

  const NS = "http://www.w3.org/2000/svg";
  let menu;
  // const menu = document.getElementById("app-menu") ? document.getElementById("app-menu") : document.createElement("div");
  const menuLinks = document.createElement("ul");
  const links = document.getElementsByTagName("a");
  let numberOfLinks = 0;
  let isPlacedTop = false;

  const iconConfig = {
    SVG : {
      style: {
        border:"1px solid black",
        "border-radius":"5px",
      },
      width: "25",
      height: "25"
    },
    LINES : {
      L1 : { y1: "7.5", y2: "7.5", x1: "7.5", x2: "17.5", style: "stroke:rgb(0,0,0);stroke-width:2" },
      L2 : { y1: "12.5", y2: "12.5", x1: "7.5", x2: "17.5", style: "stroke:rgb(0,0,0);stroke-width:2" },
      L3 : { y1: "17.5", y2: "17.5", x1: "7.5", x2: "17.5", style: "stroke:rgb(0,0,0);stroke-width:2"}
    },
    clickStyle: {
      lines: {
        stroke: "rgb(0,0,0)",
        "stroke-width": "1p",
        "background-color": "lightgray"
      }
    }
  }

  const menuConfig = {
    style: {
      position: "fixed",
      bottom: "25px",
      right:"25px"
    },

  }

  const linkAnimationConfig = {
    style: {
      right: "0px",
      "animation-name": "menu-bottom",
      "animation-duration": ".2s",
    }
  }

  const backgroundAnimationConfig = {
    blur: {
      opacity: "0.15",
      "animation-name": "blur",
      "animation-duration": ".75s"
    },
    unblur: {
      opacity: "1",
      "animation-name": "unblur",
      "animation-duration": ".75s"
    }
  }



  let linkIndex = 0;

  init = function() {
    setNumberOfLinks();
    setMenu();
    // menu = document.getElementById("app-menu") ? document.getElementById("app-menu") : document.createElement("div");


    let config = menu.getAttribute("class");
    let setFloat = (!config || config.split("-").includes("right")) ? "right" : undefined;
    isPlacedTop = (config && config.split("-").includes("top")) ? true : false;
    iconConfig.SVG.style.float = setFloat;

    if(config) {
      setMenuConfig(config)
    }

    menuLinks.setAttribute("id", "app-menu-links");
    menuLinks.addEventListener('animationend', onAnimationEnd);

    let svgStyle = iconConfig.SVG;
    svgStyle.style = extractStyle(iconConfig.SVG.style);

    let svg = createMenuIcon("svg", iconConfig.SVG );
    svg.addEventListener('click', onClick);
    svg.addEventListener('mouseup', onKeyUp);
    svg.addEventListener('mousedown', onKeyDown);


    for(var line in iconConfig.LINES) {
      createMenuIcon("line", iconConfig.LINES[line], svg);
    }

    menu.setAttribute("style", extractStyle(menuConfig.style));
    menu.setAttribute("id", "app-menu");

    let span = document.createElement("span");
    span.setAttribute("style", "display:flow-root");
    span.append(svg);
    menu.append(span);

    if (isPlacedTop){
      menu.append(menuLinks)
    } else {
      menu.prepend(menuLinks)
    }

    document.body.append(menu);
  }

  setMenu = function() {
    menu = document.getElementById("app-menu") ? document.getElementById("app-menu") : document.createElement("div");
  }

  setNumberOfLinks = function() {
    numberOfLinks = links.length;
  }

  setMenuConfig = function(config){
    const props = config.split("-").sort();
    const allowedProps = ["bottom", "top", "left", "right"];
    const isAllowed = (props.length === 3 && allowedProps.includes(props[1]) && allowedProps.includes(props[2]) && !isNaN(parseInt(props[0])));

    if(isAllowed){
      props[0] += "px";
      menuConfig.style = { position: "fixed", [props[1]] : props[0], [props[2]] : props[0] };

      if(isPlacedTop) {
        linkAnimationConfig.style["animation-name"] = "menu-top";
      } else {
        linkAnimationConfig.style["animation-name"] = "menu-bottom";
      }
    }

  }

  createMenuIcon = function(element, elementProperties, parent) {
    let elem = document.createElementNS(NS, element);
    for(var prop in elementProperties) {
      elem.setAttribute(prop, elementProperties[prop]);
    }
    if(element.toLowerCase() === "line") {
      parent.append(elem);
      return;
    } else {
      return elem;
    }
  }

  extractStyle = function(styleObject) {
    let str = "";
    for(var prop in styleObject) {
      str += `${prop}: ${styleObject[prop]};`;
    }
    return str;
  }

  insertLink = function() {
    let currentLink;
    let liStyle = "";
    liStyle += isPlacedTop ? "margin-top:5px;" : "margin-bottom:5px;";
    liStyle += Object.hasOwn(menuConfig.style, "right") ? "text-align:right;" : "text-align:left;";

    if(links.length > 0){
      currentLink = links[linkIndex];

      let attr = currentLink.attributes;
      let text = currentLink.innerText;
      let li = document.createElement("li");
      li.setAttribute("style", liStyle);
      let a = document.createElement("a");
      a.setAttribute("style", extractStyle(linkAnimationConfig.style));

      for(var prop in attr) {
        var key = attr[prop].name;
        var value = attr[prop].value;
        if(typeof value === "string") {
          a.setAttribute(key, value);
          a.innerText = text;
          li.append(a);
        }
      }
      return li;
    } else {
      return;
    }
  }

  onClick = function(e) {
    e.stopPropagation();
    e.preventDefault();
    let empty = (menuLinks.children.length === 0);
    if(empty) {
      showMenu();
    }
    if(!empty) {
      hideMenu();
    }
  }

  showMenu = function() {
    main.setAttribute("style", extractStyle(backgroundAnimationConfig.blur));
    menuLinks.prepend(insertLink());
  }

  hideMenu = function() {
    main.setAttribute("style", extractStyle(backgroundAnimationConfig.unblur));
    while(menuLinks.firstChild) {
      menuLinks.removeChild(menuLinks.firstChild);
    }
    linkIndex = 0;
  }

  onKeyDown = function(e) {
    e.preventDefault();
    let icon = e.target;
    let length =  icon.children.length;
    for(var i = 0 ; i < length ; i ++) {
      icon.children[i].setAttribute("style", extractStyle(iconConfig.clickStyle.lines))
    }
  }

  onKeyUp = function(e) {
    e.preventDefault();
    let icon = e.target;
    let length = icon.children.length;
    for(var i = 0 ; i < length ; i ++) {
      icon.children[i].setAttribute("style", iconConfig.LINES.L1.style)
    }
  }

  onAnimationEnd = function(e){
    linkIndex ++;
    if(linkIndex < numberOfLinks) {
      if(isPlacedTop) {
        menuLinks.append(insertLink());
      } else {
        menuLinks.prepend(insertLink());
      }
    }
  }

})();
