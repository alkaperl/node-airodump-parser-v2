function get(elid) {
  return document.getElementById(elid);
}

var cursor;
window.onload = init;

function init() {
  cursor = get("cursor");
  cursor.style.left = "0px";
}

function nl2br(txt) {
  // return txt.replace(/\n/g, "<br />");
  return txt;
}

function writeit(from, e) {
  e = e || window.event;
  // console.log(window.event.keyCode);
  var w = get("writer");
  // var tw = from.value;
  var tw = from.innerHTML;
  // console.log(from.innerHTML);
  // w.innerHTML = nl2br(tw);

  var keycode = e.keyCode || e.which;
  if (keycode === 13) {
      var writer = document.getElementById("writer");
      // console.log("clicky", writer.innerHTML);
      w.innerHTML = '';
  } else {
      w.innerHTML = tw;
  }
}

function moveIt(count, e) {
  e = e || window.event;
  var keycode = e.keyCode || e.which;

  // if (keycode === 13) {
  //     var writer = document.getElementById("writer");
  //     console.log("clicky", writer.innerHTML);
  //     writer.innerHTML = '';
  // }
  //				alert(count);
  if (keycode == 37 && parseInt(cursor.style.left) >= (0 - ((count - 1) * 10))) {
    cursor.style.left = parseInt(cursor.style.left) - 10 + "px";
  } else if (keycode == 39 && (parseInt(cursor.style.left) + 10) <= 0) {
    cursor.style.left = parseInt(cursor.style.left) + 10 + "px";
  }

}

function alert(txt) {
  console.log(txt);
}
