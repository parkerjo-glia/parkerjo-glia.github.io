---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
---
<ul>
</ul>
<div class="container mx-auto p-8 w-full">
    <h2 class="text-4xl font-bold text-center text-gray-900 mb-8">Our Financial Products</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {% for product in site.products %}
            <div class="bg-white p-8 rounded-xl shadow-xl border border-gray-200 flex flex-col justify-between">
                <div class="mb-4">
                    <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ product.title }}</h3>
                    <p class="text-gray-600">{{ product.desc }}</p>
                </div>
                <button data-page="{{product.id}}" class="bg-cyan-600 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:bg-cyan-500 transition-colors self-start transform hover:-translate-y-0.5">
                    Learn More
                </button>
            </div>
        {% endfor %}
    </div>
</div>