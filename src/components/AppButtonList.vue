<template>
  <div class="app-button-list-component">
    <h3 class="app-button-list-header">
      <slot name="header"/>
    </h3>
    <div class="scroll y auto thin">
      <transition-group
        name="app-button"
        tag="div"
      >
        <slot/>
      </transition-group>
    </div>
  </div>
</template>
