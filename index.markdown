---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
---
<div class="main-nav">
  <ul id="menu-options">
      <li class="active"><a href="index.html" title="Home" class="animsition-link">Home</a></li>
      <li><a href="accounts.html" title="Home" class="animsition-link">Bank Accounts</a></li>
      <li><a href="loans.html" title="Home" class="animsition-link">Loans</a></li>
  </ul>
</div>
<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>