<template>
  <div class="app-card-list-component scroll x auto">
    <transition-group
      name="app"
      tag="div"
    >
      <slot/>
    </transition-group>
  </div>
</template>
