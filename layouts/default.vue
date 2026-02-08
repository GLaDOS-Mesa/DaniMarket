<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Skip link for accessibility -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
    >
      Salta al contenuto principale
    </a>

    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2" aria-label="DaniMarket - Torna alla home">
            <span class="text-xl font-bold text-primary-600">DaniMarket</span>
          </NuxtLink>

          <!-- Navigation Desktop -->
          <nav class="hidden md:flex items-center gap-6" aria-label="Navigazione principale">
            <NuxtLink
              to="/"
              class="text-gray-600 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
              active-class="text-primary-600 font-medium"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/settings"
              class="text-gray-600 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
              active-class="text-primary-600 font-medium"
            >
              Impostazioni
            </NuxtLink>
          </nav>

          <!-- Mobile menu button -->
          <button
            class="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-menu"
            aria-label="Menu di navigazione"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                v-if="!mobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" id="mobile-menu" class="md:hidden border-t bg-white">
        <nav class="px-4 py-3 space-y-2" aria-label="Navigazione mobile">
          <NuxtLink
            to="/"
            class="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            active-class="bg-primary-50 text-primary-600"
            @click="mobileMenuOpen = false"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink
            to="/settings"
            class="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            active-class="bg-primary-50 text-primary-600"
            @click="mobileMenuOpen = false"
          >
            Impostazioni
          </NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Main content -->
    <main id="main-content" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" tabindex="-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const mobileMenuOpen = ref(false)
</script>
