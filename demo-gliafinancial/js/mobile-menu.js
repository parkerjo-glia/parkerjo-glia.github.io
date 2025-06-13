var menuOptions = document.getElementById("menu-options");
var languages = document.getElementsByClassName("language-selector")[0].getElementsByTagName("ul")[0];
function menuCloser() {
  if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
    const $menu = $('#menu-button');
    const $submenu = $('.language-selector > .submenu-button');
    $(document).mouseup(function (e) {
      if ($submenu.is(e.target))
      {
        menuOptions.style.display="none";
        $menu.removeClass('menu-opened');
      }
      else if ($menu.is(e.target)) {
        languages.style.display="none";
      }
    });
  }
}