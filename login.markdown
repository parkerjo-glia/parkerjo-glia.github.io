---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
---

<div class="flex items-center justify-center w-full">
    <div class="bg-white p-8 rounded-xl shadow-xl border border-gray-200 w-full max-w-sm">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-6">Member Login</h2>
        <form id="login-form">
            <div class="mb-4">
                <label class="block text-gray-600 text-sm font-semibold mb-2" for="username">
                    Username
                </label>
                <input type="text" id="username" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="member" />
            </div>
            <div class="mb-6">
                <label class="block text-gray-600 text-sm font-semibold mb-2" for="password">
                    Password
                </label>
                <input type="password" id="password" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="password" />
            </div>
            <button type="submit" class="w-full bg-cyan-600 text-white font-bold py-2 rounded-lg hover:bg-cyan-500 transition-colors shadow-lg transform hover:-translate-y-0.5">
                Log In
            </button>
        </form>
    </div>
</div>