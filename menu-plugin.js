'use strict';

window.onload = (e) => {
  const menuContainerExists = (document.getElementById("app-menu")) ? true : false;
  const links = document.getElementsByTagName('a');
  const typeOfMenuLinks = {
    "app-links"     : [],
    "contact-links" : []
  }

  const SVG = {
    tag: "svg",
    style: {
      border: "1px solid black",
      "border-radius": "5px"
    },
    width: "25px",
    height: "25px"
  }

  const APPSIcon = {
    L1 : { tag: "line", y1: "7.5", y2: "7.5", x1: "7.5", x2: "17.5", style: { stroke:"rgb(0,0,0)", "stroke-width":"2"} },
    L2 : { tag: "line", y1: "12.5", y2: "12.5", x1: "7.5", x2: "17.5", style: { stroke:"rgb(0,0,0)", "stroke-width":"2"} },
    L3 : { tag: "line", y1: "17.5", y2: "17.5", x1: "7.5", x2: "17.5", style: { stroke:"rgb(0,0,0)", "stroke-width":"2"} }
  }

  const CONTACTIcon = {
    circle1: { tag: "circle", cx: "12.5", cy: "17.5", r: "1.25", stroke: "black", "stroke-width": "1", fill: "black"},
    circle2: { tag: "circle", cx: "12.5", cy: "7", r: "2", stroke: "black", "stroke-width": "1", fill: "black"},
    path: { tag: "path", d: "M 10.5 7 l 2 7 l 2 -7 z", stroke: "black", fill: "black"}
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

  const linkAnimationConfig = {
    style: {
      right: "0px",
      "animation-name": "menu-bottom",
      "animation-duration": ".2s",
    }
  }

  let currentLinkCounter = 0;
  let invokedMenu = '';
  let menuContainer;

  let menuPosition = {
    position: "fixed",
    bottom: "25px",
    right: "25px"
  }

  if(menuContainerExists) {
    menuContainer = document.getElementById("app-menu");
    setMenuPosition(menuContainer.getAttribute("class"));
  }
  let isInserted = false;

/** Make menu available on scroll **/
/** implement animation/transition **/

  // window.addEventListener("wheel", function(e) {
  //   if(!isInserted && e.deltaY > 0 && window.scrollY > 10) {
  //     console.log('links inserted? ', isInserted)
  //     isInserted = true;
  //     console.log('lets insert links', isInserted)
  //   }
  //   else if(isInserted && e.deltaY < 0 && window.scrollY < 10) {
  //     console.log("links inserted?", isInserted)
  //     console.log('lets remove links');
  //     isInserted = false;
  //   }
  // })

  sortLinks();
  initAppMenuContainer();
  addMenuIcons();


  function addMenuIcons() {
    for(var prop in typeOfMenuLinks) {
      const iconDiv = document.getElementById("icon-container")
      const span = document.createElement("span");
      const isRight = menuPosition.hasOwnProperty("right");
      const isTop = menuPosition.hasOwnProperty("top");
      const isSpan = (menuContainer.firstChild.tagName.toLowerCase() === "span");
      let icon;

      if(prop === "app-links") {
        icon = createMenuIcon(SVG, APPSIcon);
      } else {
        icon = createMenuIcon(SVG, CONTACTIcon);
      }

      icon.setAttribute('id', prop);
      span.append(icon);
      span.setAttribute("id", prop + "-icon");
      span.addEventListener("click", onClick);

      if(isRight) {
        span.setAttribute("style", "padding-left:5px");
        iconDiv.prepend(span);
        iconDiv.setAttribute("style", "text-align:right")
      } else {
        span.setAttribute("style", "padding-right: 5px");
        iconDiv.append(span);
      }

      if(isTop) {
       menuContainer.prepend(iconDiv);
      } else {
       menuContainer.append(iconDiv);
      }
    }
    return;
  }

  function sortLinks() {
    const allowed = ["https", "tel", "mailto", "sms"];
    let linkHrefs = [];

    for(var link in links) {

      let enumerable = (typeof parseInt(link) === "number" && !isNaN(parseInt(link)));

      if(enumerable) {
        let current = links[link];
        let href = links[link].getAttribute("href").split(":");
        let isAllowed = allowed.includes(href[0]);

        let isDuplicate = checkIfDuplicate(current);

        if(allowed && !isDuplicate) {
          switch(current.className) {
            case "app" :
              typeOfMenuLinks["app-links"].push(current);
              break;
            case "detail" :
              typeOfMenuLinks["contact-links"].push(current);
              break;
            case "resource" :
              typeOfMenuLinks["app-links"].push(current);
              break;
            default:
              break;
          }
        }
      }
    }
    return;

    function checkIfDuplicate(current) {
      let result = linkHrefs.filter((href) => {
        return (href === current.href);
      })
      if (result.length > 0) {
        return true;
      } else {
        linkHrefs.push(current.href);
        return false;
      }
    }

  }

  function createMenuIcon(parent, children) {
    const NS = "http://www.w3.org/2000/svg";
    const { tag, ...props } = parent;
    let icon = generate(tag, props);

    if(children) {
      for(var element in children) {
        const { tag, ...props } = children[element];
        icon.append(generate(tag, props));
      }
    }
    return icon;

    function generate(element, props) {
      let elem = document.createElementNS(NS, element);
      const length = props.length;
      for(var i in props) {
        (i === "style") ? elem.setAttribute("style", extractStyle(props[i])) : elem.setAttribute(i , props[i]);
      }
      return elem;
    }
  }

  function onClick(e) {
    let targetMenu = e.target.id.toLowerCase() || e.target.parentNode.id.toLowerCase();
    e.stopPropagation();
    e.preventDefault();
    const sameAsPrevious = (typeOfMenuLinks[targetMenu] === invokedMenu || invokedMenu === "");
    const menuIsPopulated =  (document.getElementById("app-menu-links").children.length > 0);
    invokedMenu = typeOfMenuLinks[targetMenu] ;

    if(!menuIsPopulated) {
      showMenu();
    }
    else if(menuIsPopulated && !sameAsPrevious) {
      clearMenu();
      showMenu();
    }
    else {
      hideMenu();
    }
    return;
  }

  function showMenu() {
    document.getElementById("main").setAttribute("style", extractStyle(backgroundAnimationConfig.blur));
    document.getElementById("app-menu-links").append(insertLink());
    return;
  }

  function hideMenu() {
    document.getElementById("main").setAttribute("style", extractStyle(backgroundAnimationConfig.unblur));
    clearMenu();
    return;
  }

  function clearMenu() {
    let menu = document.getElementById("app-menu-links");
    while(menu.firstChild) {
      menu.removeChild(menu.firstChild);
    }
    currentLinkCounter = 0;
    return;
  }

  function insertLink() {
    if(invokedMenu.length > 0){
      let currentLink = invokedMenu[currentLinkCounter];
      let liStyle = "";
      liStyle += menuPosition.hasOwnProperty("top") ? "margin-top:5px;" : "margin-bottom:5px;";
      liStyle += menuPosition.hasOwnProperty("right") ? "text-align:right;" : "text-align:left;";

      let href = currentLink.getAttribute("href").split(":");
      let attr = currentLink.attributes;
      let text ;

      if(currentLink.className === "detail") {
        switch(href[0]) {
          case "tel" :
            text = "call me!";
            break;
          case "sms" :
            text = " text me! ";
            break;
          case "mailto" :
            text = " mail me! ";
            break;
          case "https" :
            text = "visit me!";
            break;
          default:
            break;
        }
      } else {
        text = currentLink.innerText;
      }


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


  function setMenuPosition(position) {
    const allowedProps = ["bottom","top", "left", "right"];
    const properties = position.split("-").sort();
    const isAllowed = (properties.length === 3 && allowedProps.includes(properties[1]) && allowedProps.includes(properties[2]));

    if(isAllowed) {
      menuPosition = {
        position: "fixed",
        [properties[1]] : properties[0].toString() + "px",
        [properties[2]] : properties[0].toString() + "px"
      }
    }
    return;
  }

  function onAnimationEnd(e) {
    currentLinkCounter ++;
    let menu = document.getElementById("app-menu-links");
    if(currentLinkCounter < invokedMenu.length) {
      if(menuPosition.hasOwnProperty("top")) {
        menu.append(insertLink())
      } else {
        menu.prepend(insertLink())
      }
    }
    return;
  }

  function initAppMenuContainer() {
    let ul = document.createElement("ul");
    let div = document.createElement("div");
    div.setAttribute("id", "icon-container");
    const isTop = (menuPosition.hasOwnProperty("top"));

    ul.setAttribute("id", "app-menu-links");
    ul.addEventListener("animationend", onAnimationEnd);

    if(!menuContainerExists) {
       menuContainer = document.createElement("div");
       menuContainer.setAttribute("id", "app-menu");
    }

    menuContainer.setAttribute("style", extractStyle(menuPosition));
    menuContainer.append(ul);

    if(isTop){
      menuContainer.prepend(div);
    } else {
      menuContainer.append(div);
    }

    if(!menuContainerExists){
      document.body.append(menuContainer);
    }
    document.addEventListener('click', hideMenu);

    return;
  }

  function extractStyle(styleObject) {
    let str = "";
    for(var prop in styleObject) {
      str += `${prop}: ${styleObject[prop]};`;
    }
    return str;
  }

}
