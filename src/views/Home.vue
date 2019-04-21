<template>
  <div class="page-container">
    <div style="margin-left: 200px; margin-top: 100px; width:1800px">
      <div class="md-layout md-gutter">
        <div class="md-layout-item md-side-60">
          <span class="md-display-3">
            Perfectly balanced,
            <br>as all things should be.
          </span>

          <p style="margin-top:50px;">Snap lets you create totally decentralised and automatically rebalancing smart contract portfolios.</p>

          <p>Choose your tokens, pick your ratios, set a time period, load up the contract and your new Snapfund will make sure your universe is balanced using the power of mathematics and decentralised exchanges.</p>

          <md-button class="md-raised md-primary" @click="goToCreate" style="margin-top:25px">Begin</md-button>
        </div>
        <div class="md-layout-item md-side-40">
          <img style="text-align: center; width:500px; margin-left:50px; margin-top:-100px;" src="@/assets/gif.gif"/>
        </div>
      </div>
      <div class="md-layout md-gutter md-alignment-bottom-right" style="padding-top:400px">
        <div class="md-layout-item md-side-50">
          <p>Built with Ethereum, Uniswap 🦄, an unhealthy amount of ☕️💊 and of course ❤️.</p>
        </div>
        <div
          class="md-layout-item md-side-50">
          Fun isn’t something one considers when balancing their portfolio. <br>But this… does put a smile on my face - Thanos.</div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
//import HelloWorld from "@/components/HelloWorld.vue";

import router from "@/router";

export default {
  name: "home",
  components: { },
  methods: {
    goToCreate() {
      router.push({ name: "create" });
    }
  }
};
</script>
