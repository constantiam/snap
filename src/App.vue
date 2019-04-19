<template>
  <div id="app">
    <div id="nav">
      <div class="md-layout">
        <div class="md-layout-item">
          <div class="md-subheading">
            <clickable-address :eth-address="account"/>
          </div>
        </div>
        <div class="md-layout-item">
          <a class="md-title">
            <router-link to="/">⚖️ Constantiam</router-link>
          </a>
        </div>
        <div class="md-layout-item">
          <div class="md-subheading">{{currentNetwork}}</div>
        </div>
      </div>

      <hr>
    </div>
    <router-view/>
  </div>
</template>

<script>
/* global web3:true */

import Web3 from "web3";
import * as actions from "@/store/actions";
import * as mutations from "@/store/mutation-types";
import ClickableAddress from "@/components/widgets/ClickableAddress";
import { mapActions, mapState } from "vuex";
export default {
  name: "app",
  components: { ClickableAddress },
  data() {
    return {
      web3Detected: true
    };
  },
  methods: { ...mapActions(["INIT_APP"]) },
  async mounted() {
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      console.log("web3 provider detected!");
      console.log(window.web3);

      // Request account access if needed
      ethereum
        .enable()
        .then(value => {
          console.log("Bootstrapping web app - provider acknowedgled", value);
          this.INIT_APP(window.web3);
        })
        .catch(error => {
          console.log(
            "User denied access, boostrapping application using infura",
            error
          );
          window.web3 = new Web3(
            new Web3.providers.HttpProvider(
              "https://mainnet.infura.io/v3/fb32a606c5c646c7932e43cfaf6c39df"
            )
          );
          this.INIT_APP(window.web3);
        });
    } else if (window.web3) {
      console.log("Running legacy web3 provider");
      window.web3 = new Web3(web3.currentProvider);
      this.INIT_APP(window.web3);
    } else {
      window.web3 = new Web3(
        new Web3.providers.HttpProvider(
          "https://mainnet.infura.io/v3/fb32a606c5c646c7932e43cfaf6c39df"
        )
      );
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
      this.INIT_APP(window.web3);
    }
  },
  computed: {
    ...mapState(["currentNetwork", "account"])
  }
};
</script>

<style>
#app {
  text-align: center;
  color: #2c3e50;
  margin-top: 10px;
}
</style>
