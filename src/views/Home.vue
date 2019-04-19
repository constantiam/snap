<template>
  <div class="page-container">
    Create a new automatically rebalanced portfolio!
<br>
    Some awesome text and images to show what we are all about!
<br>
    explain how the user needs a wallet ect. and then drive to the button below.
    <br>
    <md-button class="md-raised" @click="handelLogin">Begin</md-button>
  </div>
</template>

<script>
// @ is an alias to /src
//import HelloWorld from "@/components/HelloWorld.vue";
import router from "@/router";

export default {
  name: "home",
  components: {},
  methods: {
    handelLogin() {
      router.push({ name: "create" });
    }
  }
};
</script>
