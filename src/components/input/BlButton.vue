<template>
  <router-link
    v-if="to"
    :to="to"
    :class="[
      this.class,
      'btn',
      variant ? ' btn-' + variant.split(' ').join(' btn-') : ''
    ]"
  >
    <div class="btn__content">
      <slot />
    </div>
  </router-link>
  <button
    v-else
    :class="[
      this.class,
      'btn',
      variant ? ' btn-' + variant.split(' ').join(' btn-') : ''
    ]"
  >
    <div class="btn__content">
      <slot />
    </div>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    variant: { type: String, default: '' },
    class: { type: String, default: '' },
    to: { type: String, default: undefined }
  }
}
</script>
